import fs from 'fs';
import Papa from 'papaparse';

const filePath = 'c:/Antigravity/260411_청년층_경활 부가 MD/kosisfact/data/YOUTH_2025.csv';
const buffer = fs.readFileSync(filePath);

// Try EUC-KR
const decoder = new TextDecoder('euc-kr');
const csvData = decoder.decode(buffer);

const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true, dynamicTyping: true });
console.log('Total Rows:', parsed.data.length);
console.log('Headers:', Object.keys(parsed.data[0]));
console.log('First Row:', parsed.data[0]);

const ageField = Object.keys(parsed.data[0]).find(h => h.includes('만연령'));
console.log('Age Field Name:', ageField);

if (ageField) {
    const ageCount = parsed.data.filter(r => {
        const age = parseInt(r[ageField]);
        return age >= 15 && age <= 29;
    }).length;
    console.log('Rows in age 15~29:', ageCount);

    const weightField = Object.keys(parsed.data[0]).find(h => h.includes('가중값'));
    console.log('Weight Field Name:', weightField);
    if (weightField) {
        const totalWeight = parsed.data.reduce((sum, r) => sum + (parseFloat(r[weightField]) || 0), 0);
        console.log('Total Sum of Weights (thousands):', Math.round(totalWeight / 1000).toLocaleString());
    }
}
