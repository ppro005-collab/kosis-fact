import { NextResponse } from 'next/server';
import Papa from 'papaparse';
import { mdParser } from '@/lib/mdParser.js';
import { nlpEngine } from '@/lib/nlpEngine.js';
import { identifyDataset } from '@/lib/datasetConfigs.js';
import { StorageProvider } from '@/lib/storage.js';

export async function POST(request) {
  try {
    const { query, manualMode, manualSurveyType, manualYears, manualAgeMin, manualAgeMax } = await request.json();
    const queryPlan = nlpEngine.parseQuery(query, { surveyType: manualSurveyType });
    
    if (manualMode) {
      if (!queryPlan.filters) queryPlan.filters = [];
      if (manualAgeMin !== undefined && manualAgeMax !== undefined) {
        queryPlan.filters.push({ 
          label: `${manualAgeMin}~${manualAgeMax}\uc138`, 
          fn: (row) => {
            const age = parseInt(row['\ub9cc\uc5f0\ub839'] || row['age'] || 0);
            return age >= manualAgeMin && age <= manualAgeMax;
          }
        });
      }
    }

    const targetSurveyType = manualMode ? manualSurveyType : queryPlan.surveyType;
    const startYear = manualMode && manualYears?.length > 0 ? Math.min(...manualYears) : queryPlan.yearRange?.start;
    const endYear = manualMode && manualYears?.length > 0 ? Math.max(...manualYears) : queryPlan.yearRange?.end;

    const files = await StorageProvider.listFiles();
    let allRows = [];
    const datasetMeta = [];

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

    for (const file of targetFiles) {
      try {
        const buffer = await StorageProvider.readFile(file);
        if (!buffer) continue;
        
        let csvData;
        try {
          const utf8Data = buffer.toString('utf8');
          if (utf8Data.includes('\ufffd')) throw new Error('Not UTF-8');
          csvData = utf8Data;
        } catch (e) {
          const decoder = new TextDecoder('euc-kr');
          csvData = decoder.decode(buffer);
        }
        
        const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true, dynamicTyping: true });
        if (!parsed.data || parsed.data.length === 0) continue;

        const yearsInFile = new Set();
        parsed.data.forEach(row => {
          const rawYearVal = String(row['\uc870\uc0ac\uc5f0\uc6d4'] || row['\uc870\uc0ac\uc5f0\ub3c4'] || '');
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
            datasetMeta.push({ year, label: `${year}\ub144` });
          }
        });

      } catch (fileErr) {
        console.warn(`File error: ${fileErr.message}`);
      }
    }

    const finalResults = mdParser.aggregateData(allRows, { ...queryPlan, surveyType: targetSurveyType });

    return NextResponse.json({ 
      success: true, 
      plan: { ...queryPlan, surveyType: targetSurveyType, yearRange: { start: startYear, end: endYear } }, 
      results: finalResults,
      datasetMeta: datasetMeta.sort((a,b) => parseInt(a.year) - parseInt(b.year))
    });

  } catch (error) {
    console.error('Analysis API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
