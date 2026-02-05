
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CodeEditor from './components/CodeEditor';
import SettingsModal from './components/SettingsModal';
import { ConversionType, AppState, ConversionResult } from './types';
import { GeminiService } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    activeTab: ConversionType.SQL,
    isConverting: false,
    error: null,
    history: []
  });

  const [isKeySelected, setIsKeySelected] = useState<boolean | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);

  // Check if API Key is already selected on mount
  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setIsKeySelected(hasKey);
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    try {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setIsKeySelected(true);
    } catch (err) {
      console.error("Failed to open key selector", err);
    }
  };

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
      const errorMessage = err.message || "An unexpected error occurred.";
      
      if (errorMessage.includes("Requested entity was not found")) {
        setState(prev => ({
          ...prev,
          isConverting: false,
          error: "API project not found. Please re-select a valid project."
        }));
        setIsSettingsOpen(true);
      } else {
        setState(prev => ({
          ...prev,
          isConverting: false,
          error: errorMessage
        }));
      }
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

  if (isKeySelected === null) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isKeySelected) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center p-6 overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]"></div>
        </div>
        
        <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl relative z-10 text-center flex flex-col items-center">
          <div className="bg-indigo-600 p-4 rounded-2xl mb-8 shadow-lg shadow-indigo-200">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Setup OraPostgre</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Professional database conversion requires an external project connection with billing enabled.
          </p>

          <button
            onClick={handleSelectKey}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl shadow-indigo-200 mb-4 flex items-center justify-center gap-2"
          >
            Connect External Project
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 font-bold uppercase tracking-widest hover:text-indigo-600 transition-colors">
            Learn about billing →
          </a>
        </div>
      </div>
    );
  }

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
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Manage API Key
              </button>
              {state.activeTab === ConversionType.MYBATIS && (
                <label className="cursor-pointer bg-white border border-slate-300 hover:bg-slate-50 px-3 py-2 rounded-xl text-xs font-semibold transition-colors shadow-sm inline-flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  UPLOAD XML
                  <input type="file" className="hidden" accept=".xml" onChange={handleFileUpload} />
                </label>
              )}
              <button onClick={clearAll} className="text-slate-500 hover:text-slate-700 px-3 py-2 text-xs font-semibold uppercase tracking-wider">
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
                  placeholder="Paste Oracle code here..."
                />
              </div>
              
              <div className="flex flex-col h-full min-h-0 relative group">
                <CodeEditor 
                  label="POSTGRESQL OUTPUT"
                  value={outputText}
                  readOnly
                  placeholder="PostgreSQL code will appear here..."
                />
                
                {outputText && (
                  <div className="absolute top-14 right-6 flex gap-2">
                    <button onClick={handleCopy} className="bg-white/90 backdrop-blur border border-slate-200 p-2 rounded-md hover:bg-white shadow-sm transition-all hover:scale-110 active:scale-95">
                      <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    </button>
                    <button onClick={handleDownload} className="bg-white/90 backdrop-blur border border-slate-200 p-2 rounded-md hover:bg-white shadow-sm transition-all hover:scale-110 active:scale-95">
                      <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 md:mt-6 flex flex-shrink-0 items-center justify-between">
              <div className="hidden sm:flex items-center gap-4">
                {state.history.length > 0 && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">History ({state.history.length})</span>}
              </div>

              <button
                onClick={handleConvert}
                disabled={state.isConverting || !inputText}
                className={`px-10 py-3 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg transition-all transform active:scale-95 flex items-center gap-3 ${
                  state.isConverting || !inputText ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:-translate-y-0.5 shadow-indigo-200'
                }`}
              >
                {state.isConverting ? 'Processing...' : 'Run Conversion'}
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
          <span className="flex items-center gap-1"><span className={`w-1.5 h-1.5 rounded-full ${isKeySelected ? 'bg-green-500' : 'bg-amber-500'}`}></span> API: {isKeySelected ? 'Connected' : 'Setup Required'}</span>
        </div>
      </footer>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onKeyUpdate={() => {
          setIsKeySelected(true);
          setState(prev => ({ ...prev, error: null }));
        }}
      />
    </div>
  );
};

export default App;
