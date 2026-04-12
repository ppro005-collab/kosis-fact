import { NextResponse } from 'next/server';
import Papa from 'papaparse';
import { identifyDataset } from '@/lib/datasetConfigs.js';
import { StorageProvider } from '@/lib/storage.js';
import { PlannerAgent } from '@/lib/agents/planner.js';
import { AnalystAgent } from '@/lib/agents/analyst.js';
import { SasAuthorAgent } from '@/lib/agents/sasAuthor.js';
import db from '@/lib/db.js';
import { localKbMatch } from '@/lib/kbLocalMatch.js';
import { geminiDesignPlan } from '@/lib/geminiDesign.js';
import { buildEnrichedPlan, normalizeSurveyType } from '@/lib/planBuilder.js';
import { getAnalysisResponseCache, setAnalysisResponseCache } from '@/lib/analysisCacheStorage.js';

async function readCsvHeaders(fileName) {
  try {
    const buffer = await StorageProvider.readFile(fileName);
    if (!buffer) return [];
    let csvData;
    try {
      const utf8Data = buffer.toString('utf8');
      if (utf8Data.includes('\ufffd')) throw new Error('Not UTF-8');
      csvData = utf8Data;
    } catch {
      csvData = new TextDecoder('euc-kr').decode(buffer);
    }
    const firstLine = csvData.split(/\r?\n/)[0] || '';
    return firstLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  } catch {
    return [];
  }
}

export async function POST(request) {
  try {
    const {
      query,
      manualMode,
      manualSurveyType,
      manualYears,
      manualAgeMin,
      manualAgeMax
    } = await request.json();

    const cachedFull = getAnalysisResponseCache(query);
    if (cachedFull) {
      return NextResponse.json({
        ...cachedFull,
        meta: { ...(cachedFull.meta || {}), cacheHit: true }
      });
    }

    let queryPlan = null;
    try {
      const cached = await db
        .prepare('SELECT plan_json FROM analysis_cache WHERE query = ?')
        .get(query);
      if (cached) queryPlan = JSON.parse(cached.plan_json);
    } catch (e) {
      console.warn('Cache read error:', e);
    }

    if (!queryPlan) {
      queryPlan = await PlannerAgent.plan(query, { surveyType: manualSurveyType });
      try {
        await db
          .prepare(
            'INSERT INTO analysis_cache (query, plan_json) VALUES (?, ?) ON CONFLICT DO NOTHING'
          )
          .run(query, JSON.stringify(queryPlan));
      } catch (e) {
        console.warn('Cache write error:', e);
      }
    }

    const stForKb = normalizeSurveyType(
      manualMode ? manualSurveyType : queryPlan.surveyType
    );
    const { matches: kbMatches, suggestedMetricKey } = localKbMatch(query, stForKb);

    if (suggestedMetricKey) {
      queryPlan.metric = suggestedMetricKey;
      const { METRIC_METADATA } = await import('@/lib/kosisStatLogic.js');
      const mm = METRIC_METADATA[suggestedMetricKey];
      if (mm?.prerequisites) {
        queryPlan.filters = mm.prerequisites.map(p => ({ label: p, fnKey: p }));
      }
    }

    const startYear =
      manualMode && manualYears?.length > 0
        ? Math.min(...manualYears)
        : queryPlan.yearRange?.start;
    const endYear =
      manualMode && manualYears?.length > 0
        ? Math.max(...manualYears)
        : queryPlan.yearRange?.end;

    const files = await StorageProvider.listFiles();
    const targetSurveyType = normalizeSurveyType(
      manualMode ? manualSurveyType : queryPlan.surveyType
    );

    const targetFiles = files.filter(file => {
      const fileNameId = identifyDataset(file);
      if (fileNameId !== targetSurveyType) return false;
      const yearInFile = file.match(/\d{4}/);
      if (yearInFile) {
        const y = parseInt(yearInFile[0]);
        if (y >= startYear && y <= endYear) return true;
      }
      return false;
    });

    let geminiExtras = null;
    if (process.env.GEMINI_API_KEY && !suggestedMetricKey) {
      const headers = targetFiles.length
        ? await readCsvHeaders(targetFiles[0])
        : [];
      geminiExtras = await geminiDesignPlan(query, headers, targetSurveyType);
      if (geminiExtras?.metric) {
        queryPlan.metric = geminiExtras.metric;
        const { METRIC_METADATA } = await import('@/lib/kosisStatLogic.js');
        const mm = METRIC_METADATA[geminiExtras.metric];
        if (mm?.prerequisites) {
          queryPlan.filters = mm.prerequisites.map(p => ({
            label: p,
            fnKey: p
          }));
        }
        queryPlan.isLlmInferred = true;
      }
    }

    const enriched = buildEnrichedPlan({
      query,
      rawPlanner: queryPlan,
      kbSuggestedMetric: suggestedMetricKey || geminiExtras?.metric,
      geminiExtras,
      manualSurveyType: targetSurveyType,
      manualAgeMin: manualMode ? manualAgeMin : undefined,
      manualAgeMax: manualMode ? manualAgeMax : undefined
    });

    if (manualMode) {
      if (!enriched.filters) enriched.filters = [];
      if (manualAgeMin !== undefined && manualAgeMax !== undefined) {
        enriched.filters.push({
          label: `${manualAgeMin}~${manualAgeMax}세`,
          fnKey: 'isAge15to29'
        });
      }
    }

    let allRows = [];
    const datasetMeta = [];

    for (const file of targetFiles) {
      try {
        const buffer = await StorageProvider.readFile(file);
        if (!buffer) continue;

        let csvData;
        try {
          const utf8Data = buffer.toString('utf8');
          if (utf8Data.includes('\ufffd')) throw new Error('Not UTF-8');
          csvData = utf8Data;
        } catch {
          const decoder = new TextDecoder('euc-kr');
          csvData = decoder.decode(buffer);
        }

        const parsed = Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true
        });
        if (!parsed.data || parsed.data.length === 0) continue;

        const yearsInFile = new Set();
        parsed.data.forEach(row => {
          const rawYearVal = String(
            row['조사연월'] || row['조사연도'] || ''
          );
          const yearVal = rawYearVal.substring(0, 4);
          if (yearVal && yearVal.length === 4) {
            const yInt = parseInt(yearVal);
            if (yInt >= startYear && yInt <= endYear) {
              allRows.push(row);
              yearsInFile.add(yearVal);
            }
          }
        });

        yearsInFile.forEach(year => {
          if (!datasetMeta.find(m => m.year === year)) {
            datasetMeta.push({ year, label: `${year}년` });
          }
        });
      } catch (fileErr) {
        console.warn(`File error: ${fileErr.message}`);
      }
    }

    const finalResults = AnalystAgent.analyze(allRows, {
      ...enriched,
      surveyType: targetSurveyType
    });

    const sasCode = SasAuthorAgent.generate({
      ...enriched,
      surveyType: targetSurveyType
    });

    const payload = {
      success: true,
      meta: {
        cacheHit: false,
        kbMatchCount: kbMatches.length,
        pipeline: suggestedMetricKey ? 'local_kb' : geminiExtras ? 'gemini' : 'planner'
      },
      plan: {
        ...enriched,
        surveyType: targetSurveyType,
        yearRange: { start: startYear, end: endYear }
      },
      results: finalResults,
      datasetMeta: datasetMeta.sort(
        (a, b) => parseInt(a.year) - parseInt(b.year)
      ),
      sasCode,
      kbMatches: kbMatches.slice(0, 5)
    };

    setAnalysisResponseCache(query, payload);

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Analysis API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
