import React, { useState, useRef, useEffect } from 'react';
import { Terminal, CornerDownLeft, Trash2, HelpCircle, Play } from 'lucide-react';

interface TerminalEntry {
  type: 'input' | 'output' | 'error' | 'system';
  text: string;
}

export const TerminalView: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [entries, setEntries] = useState<TerminalEntry[]>([
    { type: 'system', text: 'Java SE 17 Network Socket Environment [Debian GNU/Linux]' },
    { type: 'system', text: 'Compiled Java files available in current directory:' },
    { type: 'system', text: '  - AdditionServer.java   (TCP port 5000)' },
    { type: 'system', text: '  - AdditionClient.java   (Client socket)' },
    { type: 'system', text: 'Type "help" for a list of commands, or click quick command buttons.' },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  const executeCommand = async (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    const newEntries: TerminalEntry[] = [...entries, { type: 'input', text: `$ ${trimmed}` }];

    if (trimmed === 'clear') {
      setEntries([]);
      return;
    }

    if (trimmed === 'help') {
      newEntries.push({
        type: 'output',
        text: `Available Commands:
  javac <files>                  Compile Java source files (e.g. javac AdditionServer.java AdditionClient.java)
  java AdditionServer [port]     Start TCP Server
  java AdditionClient <a ><b>    Start TCP Client with two integers (e.g. java AdditionClient 40 60)
  ls                             List source files in directory
  cat <file>                     View file content
  clear                          Clear terminal screen
  help                           Show this guide`,
      });
      setEntries(newEntries);
      return;
    }

    if (trimmed === 'ls' || trimmed === 'ls -l' || trimmed === 'ls -la') {
      newEntries.push({
        type: 'output',
        text: `-rw-r--r-- 1 student dev 2480 Oct 31 12:30 AdditionServer.java
-rw-r--r-- 1 student dev 2610 Oct 31 12:30 AdditionClient.java
-rw-r--r-- 1 student dev 1850 Oct 31 12:30 TextAdditionServer.java
-rw-r--r-- 1 student dev 1590 Oct 31 12:30 TextAdditionClient.java
-rw-r--r-- 1 student dev 2300 Oct 31 12:30 MultiThreadedServer.java`,
      });
      setEntries(newEntries);
      return;
    }

    if (trimmed.startsWith('javac')) {
      newEntries.push({
        type: 'output',
        text: '[javac] Compiling Java classes with javac 17.0.21...\n[javac] Compilation finished with 0 errors.',
      });
      setEntries(newEntries);
      return;
    }

    if (trimmed.startsWith('java AdditionClient')) {
      const parts = trimmed.split(/\s+/);
      const a = parseInt(parts[2], 10) || 15;
      const b = parseInt(parts[3], 10) || 27;

      try {
        const response = await fetch('/api/run-java', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ num1: a, num2: b, implementation: 'binary' }),
        });
        const data = await response.json();
        if (data.success) {
          data.serverLogs.forEach((log: any) => {
            newEntries.push({ type: 'output', text: `[SERVER] ${log.message}` });
          });
          data.clientLogs.forEach((log: any) => {
            newEntries.push({ type: 'output', text: `[CLIENT] ${log.message}` });
          });
          newEntries.push({
            type: 'system',
            text: `Socket transaction complete: ${a} + ${b} = ${data.sum} in ${data.durationMs}ms`,
          });
        } else {
          newEntries.push({ type: 'error', text: data.error || 'Execution failed' });
        }
      } catch (err: any) {
        newEntries.push({ type: 'error', text: 'Error connecting to backend runner: ' + err.message });
      }
      setEntries(newEntries);
      return;
    }

    if (trimmed.startsWith('java AdditionServer')) {
      newEntries.push({
        type: 'output',
        text: `==================================================
    JAVA SOCKET ADDITION SERVER (TCP PORT 5000)
==================================================
[SERVER] ServerSocket initialized and bound to port 5000
[SERVER] Socket state: LISTEN. Awaiting incoming connections...
[SERVER] Ready and listening for client on port 5000...`,
      });
      setEntries(newEntries);
      return;
    }

    if (trimmed.startsWith('cat AdditionServer.java')) {
      newEntries.push({
        type: 'output',
        text: `// Excerpt from AdditionServer.java:
try (ServerSocket serverSocket = new ServerSocket(5000)) {
    Socket clientSocket = serverSocket.accept();
    DataInputStream in = new DataInputStream(clientSocket.getInputStream());
    DataOutputStream out = new DataOutputStream(clientSocket.getOutputStream());
    int num1 = in.readInt();
    int num2 = in.readInt();
    out.writeInt(num1 + num2);
    out.flush();
}`,
      });
      setEntries(newEntries);
      return;
    }

    newEntries.push({
      type: 'error',
      text: `bash: ${trimmed}: command not found. Type "help" for available commands.`,
    });
    setEntries(newEntries);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const nextIndex = historyIndex + 1;
        if (nextIndex >= history.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(nextIndex);
          setInput(history[nextIndex]);
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Action Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Quick Commands:</span>
          <button
            onClick={() => executeCommand('javac AdditionServer.java AdditionClient.java')}
            className="px-2.5 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700"
          >
            javac *.java
          </button>
          <button
            onClick={() => executeCommand('java AdditionClient 42 58')}
            className="px-2.5 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-md border border-slate-700"
          >
            java AdditionClient 42 58
          </button>
          <button
            onClick={() => executeCommand('java AdditionClient -15 85')}
            className="px-2.5 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-md border border-slate-700"
          >
            java AdditionClient -15 85
          </button>
          <button
            onClick={() => executeCommand('ls -l')}
            className="px-2.5 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700"
          >
            ls -l
          </button>
          <button
            onClick={() => executeCommand('help')}
            className="px-2.5 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700 flex items-center gap-1"
          >
            <HelpCircle className="w-3 h-3" />
            help
          </button>
        </div>

        <button
          onClick={() => setEntries([])}
          className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-400 hover:text-white bg-slate-800/60 rounded-md"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      {/* Terminal Window */}
      <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl flex flex-col h-[520px]">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="font-mono text-slate-400 ml-2">bash ~ java_socket_addition</span>
          </div>
          <span className="text-slate-500 font-mono text-[11px]">OpenJDK 17 Headless</span>
        </div>

        {/* Scrollable Output */}
        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1 leading-relaxed">
          {entries.map((entry, idx) => (
            <div
              key={idx}
              className={`whitespace-pre-wrap ${
                entry.type === 'input'
                  ? 'text-sky-400 font-bold'
                  : entry.type === 'system'
                  ? 'text-slate-500'
                  : entry.type === 'error'
                  ? 'text-red-400'
                  : 'text-slate-300'
              }`}
            >
              {entry.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Command Input Box */}
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/90 border-t border-slate-800">
          <span className="text-sky-400 font-mono font-bold">$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type command (e.g. java AdditionClient 20 40) and press Enter..."
            className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none placeholder:text-slate-600"
            autoFocus
          />
          <button
            onClick={() => {
              executeCommand(input);
              setInput('');
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded transition-colors"
          >
            <CornerDownLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
