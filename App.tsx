
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CodeEditor from './components/CodeEditor';
import { ConversionType, AppState, ConversionResult } from './types';
import { GeminiService } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    activeTab: ConversionType.SQL,
    isConverting: false,
    error: null,
    history: []
  });

  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);

  const handleConvert = async () => {
    if (!inputText.trim()) {
      setState(prev => ({ ...prev, error: "Please enter some content to convert." }));
      return;
    }

    setState(prev => ({ ...prev, isConverting: true, error: null }));
    setOutputText('');

    try {
      const converted = await GeminiService.convert(state.activeTab, inputText);
      setOutputText(converted);
      
      const newResult: ConversionResult = {
        original: inputText,
        converted,
        timestamp: Date.now(),
        fileName: fileName || undefined
      };
      
      setState(prev => ({
        ...prev,
        isConverting: false,
        history: [newResult, ...prev.history].slice(0, 10)
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isConverting: false,
        error: err.message || "An unexpected error occurred."
      }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputText(content);
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    if (!outputText) return;
    
    let defaultFileName = 'converted.sql';
    if (state.activeTab === ConversionType.MYBATIS) {
      defaultFileName = fileName ? fileName.replace(/\.xml$/, '_pg.xml') : 'mapper_pg.xml';
    } else if (state.activeTab === ConversionType.FUNCTION) {
      defaultFileName = 'function_pg.sql';
    }

    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = defaultFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setFileName(null);
    setState(prev => ({ ...prev, error: null }));
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      <Header 
        activeTab={state.activeTab} 
        onTabChange={(tab) => {
          setState(prev => ({ ...prev, activeTab: tab, error: null }));
          clearAll();
        }} 
      />

      <main className="flex-grow flex flex-col overflow-hidden">
        <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                {state.activeTab === ConversionType.MYBATIS ? 'MyBatis Mapper Converter' :
                 state.activeTab === ConversionType.FUNCTION ? 'Function & Procedure Translator' :
                 'SQL Query Translator'}
                {fileName && <span className="text-sm font-normal text-slate-400 ml-2">({fileName})</span>}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {state.activeTab === ConversionType.MYBATIS && (
                <label className="cursor-pointer bg-white border border-slate-300 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm inline-flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  UPLOAD XML
                  <input type="file" className="hidden" accept=".xml" onChange={handleFileUpload} />
                </label>
              )}
              <button
                onClick={clearAll}
                className="text-slate-500 hover:text-slate-700 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div className="flex-grow flex flex-col p-4 md:p-6 overflow-hidden">
          <div className="max-w-[1600px] mx-auto w-full flex-grow flex flex-col overflow-hidden">
            {state.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2 duration-300">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-bold">{state.error}</span>
              </div>
            )}

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 overflow-hidden min-h-0">
              <div className="flex flex-col h-full min-h-0">
                <CodeEditor 
                  label="ORACLE INPUT"
                  value={inputText}
                  onChange={setInputText}
                  placeholder={
                    state.activeTab === ConversionType.MYBATIS ? "Paste Oracle MyBatis XML here or upload a file..." :
                    state.activeTab === ConversionType.FUNCTION ? "Paste Oracle Function/Procedure code here..." :
                    "Paste Oracle SQL query here..."
                  }
                />
              </div>
              
              <div className="flex flex-col h-full min-h-0 relative group">
                <CodeEditor 
                  label="POSTGRESQL OUTPUT"
                  value={outputText}
                  readOnly
                  placeholder="PostgreSQL code will appear here after conversion..."
                />
                
                {outputText && (
                  <div className="absolute top-14 right-6 flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="bg-white/90 backdrop-blur border border-slate-200 p-2 rounded-md hover:bg-white shadow-sm transition-all hover:scale-110 active:scale-95"
                      title="Copy to clipboard"
                    >
                      <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                    <button
                      onClick={handleDownload}
                      className="bg-white/90 backdrop-blur border border-slate-200 p-2 rounded-md hover:bg-white shadow-sm transition-all hover:scale-110 active:scale-95"
                      title="Download file"
                    >
                      <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 md:mt-6 flex flex-shrink-0 items-center justify-between">
              <div className="hidden sm:flex items-center gap-4">
                {state.history.length > 0 && (
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">History ({state.history.length})</span>
                )}
              </div>

              <button
                onClick={handleConvert}
                disabled={state.isConverting || !inputText}
                className={`
                  px-10 py-3 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg transition-all transform active:scale-95
                  flex items-center gap-3
                  ${state.isConverting || !inputText
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:-translate-y-0.5 shadow-indigo-200'
                  }
                `}
              >
                {state.isConverting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Run Conversion
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </>
                )}
              </button>

              <div className="hidden sm:block">
                <span className="text-[10px] text-slate-300 font-medium tracking-tighter uppercase italic">Model: {GeminiService.getModelName()}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-100 py-2 px-6 flex justify-between items-center text-[10px] font-medium text-slate-400 shrink-0">
        <div>© 2024 ORAPOSTGRE ENGINE</div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> API Status: Connected</span>
          <span>Ready for Migration</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
