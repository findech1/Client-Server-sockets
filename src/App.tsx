import React, { useState, useEffect } from 'react';
import { Header, TabType } from './components/Header';
import { InteractiveStudio } from './components/InteractiveStudio';
import { CodeViewer } from './components/CodeViewer';
import { VSCodeGuide } from './components/VSCodeGuide';
import { TerminalView } from './components/TerminalView';
import { ArchitectureGuide } from './components/ArchitectureGuide';
import { ExecutionResult } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('vscode');
  const [num1, setNum1] = useState<number>(15);
  const [num2, setNum2] = useState<number>(27);
  const [implementation, setImplementation] = useState<'binary' | 'text' | 'multithreaded'>('binary');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<ExecutionResult | null>(null);

  // Auto-run once on initial load with default numbers so the user immediately sees working real Java outputs
  useEffect(() => {
    runJavaSockets(15, 27, 'binary');
  }, []);

  const runJavaSockets = async (
    n1: number = num1,
    n2: number = num2,
    impl: 'binary' | 'text' | 'multithreaded' = implementation
  ) => {
    setIsRunning(true);
    try {
      const response = await fetch('/api/run-java', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ num1: n1, num2: n2, implementation: impl }),
      });
      const data = await response.json();
      setLastResult(data);
    } catch (err) {
      console.error('Failed to execute Java sockets:', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar adhering to Top Bar Contract */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onQuickRun={() => {
          if (activeTab !== 'studio') setActiveTab('studio');
          runJavaSockets(num1, num2, implementation);
        }}
        isRunning={isRunning}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'studio' && (
          <InteractiveStudio
            num1={num1}
            num2={num2}
            setNum1={setNum1}
            setNum2={setNum2}
            implementation={implementation}
            setImplementation={setImplementation}
            onExecute={() => runJavaSockets(num1, num2, implementation)}
            isRunning={isRunning}
            lastResult={lastResult}
          />
        )}

        {activeTab === 'code' && <CodeViewer />}

        {activeTab === 'vscode' && <VSCodeGuide />}

        {activeTab === 'terminal' && <TerminalView />}

        {activeTab === 'guide' && <ArchitectureGuide />}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-5 px-6 text-center text-xs text-slate-500">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
          <span>Java Socket Communication Specification · RFC 793 Transmission Control Protocol</span>
          <div className="flex items-center gap-3">
            <span>ServerSocket</span>
            <span aria-hidden="true">·</span>
            <span>Socket</span>
            <span aria-hidden="true">·</span>
            <span>DataInputStream</span>
            <span aria-hidden="true">·</span>
            <span>DataOutputStream</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
