
import React, { useState } from 'react';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  label: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, placeholder, readOnly, label }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    if (!isFullScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  };

  const containerClasses = isFullScreen
    ? "fixed inset-0 z-[100] bg-white flex flex-col p-4 animate-in fade-in zoom-in duration-200"
    : "flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition-all";

  return (
    <div className={containerClasses}>
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">{label}</span>
          {!readOnly && (
            <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded font-bold uppercase tracking-wider">Oracle</span>
          )}
          {readOnly && (
            <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded font-bold uppercase tracking-wider">PostgreSQL</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullScreen}
            className="p-1.5 hover:bg-slate-200 rounded-md transition-colors text-slate-500"
            title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
          >
            {isFullScreen ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L4 4m0 0l5 0M4 4l0 5m11 0l5-5m0 0h-5m5 0v5m-5 11l5 5m0 0h-5m5 0v-5m-11 0l-5 5m0 0h5m-5 0v-5" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5M20 8V4m0 0h-4M20 4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        placeholder={placeholder}
        spellCheck={false}
        className={`flex-grow p-6 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
          readOnly ? 'bg-slate-50/50 text-slate-700' : 'bg-white text-slate-900'
        } ${isFullScreen ? 'text-base leading-relaxed' : ''}`}
      />
      {isFullScreen && (
        <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 text-[10px] text-slate-400 flex justify-between">
          <span>{value.length} characters</span>
          <span>Press Esc or click the icon to exit full screen</span>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
