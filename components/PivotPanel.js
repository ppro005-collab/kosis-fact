'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, RefreshCw, Layout, MoveVertical, MoveHorizontal } from 'lucide-react';

export function PivotPanel({ plan, pivotConfig, setPivotConfig }) {
  const allVars = plan?.groupBys ? plan.groupBys.map(g => g.label) : [];
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedCol, setSelectedCol] = useState(null);

  const moveToCol = () => {
    if (!selectedRow) return;
    setPivotConfig(prev => ({
      rows: prev.rows.filter(r => r !== selectedRow),
      cols: [...prev.cols, selectedRow],
    }));
    setSelectedRow(null);
  };

  const moveToRow = () => {
    if (!selectedCol) return;
    setPivotConfig(prev => ({
      cols: prev.cols.filter(c => c !== selectedCol),
      rows: [...prev.rows, selectedCol],
    }));
    setSelectedCol(null);
  };

  const resetPivot = () => {
    if (allVars.length === 0) return;
    setPivotConfig({ rows: [allVars[0]], cols: allVars.slice(1) });
    setSelectedRow(null);
    setSelectedCol(null);
  };

  if (!plan?.groupBys || plan.groupBys.length < 1) return null;

  return (
    <div className="bg-white rounded-3xl p-5 mb-6 border border-gray-100 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Layout size={16} />
          </div>
          <div>
            <h4 className="text-sm font-black text-gray-800 leading-tight">분석 차원 설정</h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Axis Configuration</p>
          </div>
        </div>
        <button onClick={resetPivot} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl text-[10px] font-black transition-all">
          <RefreshCw size={12} /> 초기화
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-stretch gap-4">
        {/* 행 박스 (Row) */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg uppercase">Row (행)</span>
            {selectedRow && <span className="text-[10px] text-blue-400 animate-pulse font-bold">이동 준비됨</span>}
          </div>
          <div className="min-h-[100px] bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-2xl p-2.5 flex flex-wrap gap-2 content-start">
            {pivotConfig.rows.map(v => (
              <button key={v}
                onClick={() => { setSelectedRow(v === selectedRow ? null : v); setSelectedCol(null); }}
                className={`flex-1 min-w-[120px] md:min-w-0 md:w-full text-left text-xs px-4 py-3.5 rounded-2xl font-bold transition-all active:scale-95
                  ${selectedRow === v ? 'bg-blue-600 text-white shadow-lg translate-y-[-2px]' : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'}`}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* 컨트롤 브릿지 (Mobile: Horizontal, Desktop: Vertical) */}
        <div className="flex md:flex-col justify-center gap-3 py-2 md:py-0">
          <button 
            onClick={moveToCol} 
            disabled={!selectedRow}
            className={`w-14 h-14 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all shadow-md
              ${selectedRow ? 'bg-blue-600 text-white hover:scale-105 active:scale-90' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
          >
            <div className="md:hidden"><MoveVertical size={20} /></div>
            <div className="hidden md:block"><ArrowRight size={20} /></div>
          </button>
          
          <button 
            onClick={moveToRow} 
            disabled={!selectedCol}
            className={`w-14 h-14 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all shadow-md
              ${selectedCol ? 'bg-green-600 text-white hover:scale-105 active:scale-90' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
          >
            <div className="md:hidden"><MoveVertical size={20} className="rotate-180" /></div>
            <div className="hidden md:block"><ArrowLeft size={20} /></div>
          </button>
        </div>

        {/* 열 박스 (Column) */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-lg uppercase">Column (열)</span>
            {selectedCol && <span className="text-[10px] text-green-400 animate-pulse font-bold">이동 준비됨</span>}
          </div>
          <div className="min-h-[100px] bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-2xl p-2.5 flex flex-wrap gap-2 content-start">
            {pivotConfig.cols.length > 0 ? pivotConfig.cols.map(v => (
              <button key={v}
                onClick={() => { setSelectedCol(v === selectedCol ? null : v); setSelectedRow(null); }}
                className={`flex-1 min-w-[120px] md:min-w-0 md:w-full text-left text-xs px-4 py-3.5 rounded-2xl font-bold transition-all active:scale-95
                  ${selectedCol === v ? 'bg-green-600 text-white shadow-lg translate-y-[-2px]' : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'}`}>
                {v}
              </button>
            )) : (
              <div className="flex-1 flex items-center justify-center bg-white/50 rounded-2xl border border-gray-100 italic text-[10px] text-gray-300">
                변수가 없습니다
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 p-4 bg-gray-50 rounded-2xl flex items-start gap-3">
        <div className="w-5 h-5 bg-white rounded-lg flex items-center justify-center text-gray-400 shrink-0 shadow-sm">
          <MoveHorizontal size={12} />
        </div>
        <p className="text-[11px] leading-relaxed text-gray-500 font-medium">
          <b className="text-gray-800">모바일 팁:</b> 항목을 터치하여 선택한 후 가운데 화살표 버튼을 눌러 행/열을 바꿀 수 있습니다. 변경된 설정은 통계표에 즉시 반영됩니다.
        </p>
      </div>
    </div>
  );
}
