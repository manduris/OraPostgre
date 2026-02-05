
import React from 'react';
import { ConversionType } from '../types';

interface HeaderProps {
  activeTab: ConversionType;
  onTabChange: (tab: ConversionType) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7c0-2-1.5-3-3.5-3h-9C5.5 4 4 5 4 7zM4 10h16M4 14h16" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Ora<span className="text-indigo-600">Postgre</span>
            </h1>
          </div>
          
          <nav className="hidden sm:flex space-x-1">
            <TabButton 
              active={activeTab === ConversionType.MYBATIS} 
              onClick={() => onTabChange(ConversionType.MYBATIS)}
              label="MyBatis Mapper"
            />
            <TabButton 
              active={activeTab === ConversionType.FUNCTION} 
              onClick={() => onTabChange(ConversionType.FUNCTION)}
              label="Function / Procedure"
            />
            <TabButton 
              active={activeTab === ConversionType.SQL} 
              onClick={() => onTabChange(ConversionType.SQL)}
              label="SQL Query"
            />
          </nav>
          
          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Gemini 3 Pro Powered
            </span>
          </div>
        </div>
      </div>
      
      {/* Mobile Nav */}
      <div className="sm:hidden flex justify-around p-2 bg-slate-50 border-t border-slate-200">
        <MobileTabButton 
          active={activeTab === ConversionType.MYBATIS} 
          onClick={() => onTabChange(ConversionType.MYBATIS)}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <MobileTabButton 
          active={activeTab === ConversionType.FUNCTION} 
          onClick={() => onTabChange(ConversionType.FUNCTION)}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>}
        />
        <MobileTabButton 
          active={activeTab === ConversionType.SQL} 
          onClick={() => onTabChange(ConversionType.SQL)}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
        />
      </div>
    </header>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      active 
        ? 'bg-indigo-50 text-indigo-700' 
        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
    }`}
  >
    {label}
  </button>
);

const MobileTabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode }> = ({ active, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-lg transition-colors ${
      active ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400'
    }`}
  >
    {icon}
  </button>
);

export default Header;
