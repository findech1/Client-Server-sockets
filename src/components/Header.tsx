import React from 'react';
import { Terminal, Play, Code2, BookOpen, Cpu, Laptop } from 'lucide-react';

export type TabType = 'studio' | 'code' | 'vscode' | 'terminal' | 'guide';

interface HeaderProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onQuickRun: () => void;
  isRunning: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onQuickRun,
  isRunning,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
          <Cpu className="w-4 h-4" />
        </div>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('studio');
          }}
          className="text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-sky-300 transition-colors"
        >
          Java Socket Addition
        </a>
      </div>

      {/* Zone 2: Exactly 5 single-line nav links with clean typography */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={() => onSelectTab('studio')}
          className={`flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'studio' ? 'text-sky-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          Interactive Studio
        </button>

        <button
          onClick={() => onSelectTab('code')}
          className={`flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'code' ? 'text-sky-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          Source Code
        </button>

        <button
          onClick={() => onSelectTab('vscode')}
          className={`flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'vscode' ? 'text-sky-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          VS Code Guide
        </button>

        <button
          onClick={() => onSelectTab('terminal')}
          className={`flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'terminal' ? 'text-sky-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          CLI Playground
        </button>

        <button
          onClick={() => onSelectTab('guide')}
          className={`flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'guide' ? 'text-sky-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Socket Theory
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onQuickRun}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0"
        >
          <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Running Sockets...' : 'Execute Java Sockets'}
        </button>
      </div>
    </header>
  );
};
