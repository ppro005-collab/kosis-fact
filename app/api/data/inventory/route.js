import { NextResponse } from 'next/server';
import Papa from 'papaparse';
import { identifyDataset, SURVEY_TYPES } from '@/lib/datasetConfigs.js';
import { StorageProvider } from '@/lib/storage.js';

export async function GET() {
  try {
    const files = await StorageProvider.listFiles();

    const inventory = {}; 
    const allYearsSet = new Set();

    for (const file of files) {
      if (file.startsWith('~$')) continue;

      let surveyType = identifyDataset(file);
      let yearMatch = file.match(/\d{4}/);
      let dataYear = yearMatch ? yearMatch[0] : null;

      if (!dataYear || (surveyType === SURVEY_TYPES.YOUTH && !file.toUpperCase().includes('YOUTH'))) {
        try {
          const buffer = await StorageProvider.readFile(file);
          if (buffer) {
            const decoder = new TextDecoder('euc-kr');
            const csvData = decoder.decode(buffer);
            
            const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true, preview: 1 });
            if (parsed.data.length > 0) {
              const firstRow = parsed.data[0];
              const yearKey = Object.keys(firstRow).find(h => h.includes('조사연월') || h.includes('조사연도'));
              if (!dataYear && yearKey) dataYear = String(firstRow[yearKey]).substring(0,4);
              if (surveyType === SURVEY_TYPES.YOUTH) surveyType = identifyDataset(Object.keys(firstRow));
            }
          }
        } catch (e) { console.error('Inventory parse error:', e); }
      }

      if (surveyType && dataYear && /^\d{4}$/.test(dataYear)) {
        if (!inventory[surveyType]) inventory[surveyType] = {};
        inventory[surveyType][dataYear] = true;
        allYearsSet.add(parseInt(dataYear));
      }
    }

    const allYears = Array.from(allYearsSet).sort((a, b) => b - a);
    return NextResponse.json({ success: true, inventory, allYears });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
