import React, { useState } from 'react';
import { Download, Terminal, Play, FolderTree, CheckCircle2, AlertCircle, Copy, Check, ExternalLink, Laptop } from 'lucide-react';

export const VSCodeGuide: React.FC = () => {
  const [copiedConfig, setCopiedConfig] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedConfig(id);
    setTimeout(() => setCopiedConfig(null), 2000);
  };

  const launchJsonContent = `{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "java",
      "name": "Run AdditionServer (Port 5000)",
      "request": "launch",
      "mainClass": "AdditionServer",
      "console": "integratedTerminal"
    },
    {
      "type": "java",
      "name": "Run AdditionClient (Interactive / Prompt)",
      "request": "launch",
      "mainClass": "AdditionClient",
      "console": "integratedTerminal"
    },
    {
      "type": "java",
      "name": "Run AdditionClient with Args (25, 75)",
      "request": "launch",
      "mainClass": "AdditionClient",
      "args": "25 75",
      "console": "integratedTerminal"
    }
  ],
  "compounds": [
    {
      "name": "Run Server & Client Together",
      "configurations": [
        "Run AdditionServer (Port 5000)",
        "Run AdditionClient with Args (25, 75)"
      ]
    }
  ]
}`;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
            <Laptop className="w-4 h-4" />
            <span>Developer Environment Setup</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Running Java Sockets in Visual Studio Code
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Because a TCP server blocks and listens indefinitely, running client-server socket programs in VS Code requires running two separate terminal sessions simultaneously.
          </p>
        </div>

        {/* Download VS Code Ready Project ZIP */}
        <a
          href="/api/download-vscode-zip"
          download="vscode-java-socket-project.zip"
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all whitespace-nowrap self-start md:self-center shrink-0"
        >
          <Download className="w-4 h-4" />
          Download VS Code Project (.ZIP)
        </a>
      </div>

      {/* Two Core Methods Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Method 1: VS Code Integrated Terminal (Recommended) */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Method 1: Split Integrated Terminals (Recommended)
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Universal
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Works instantly on Windows PowerShell, macOS zsh, or Linux Bash without requiring any special VS Code extensions.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="font-semibold text-slate-200">1. Open VS Code Terminal</div>
                <div className="text-slate-400">
                  Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">Ctrl + `</kbd> (or <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">Cmd + `</kbd> on macOS).
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="font-semibold text-slate-200">2. Compile Source Files</div>
                <div className="p-2 bg-slate-900 rounded font-mono text-slate-200 text-[11px]">
                  javac AdditionServer.java AdditionClient.java
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="font-semibold text-slate-200">3. Start Server in Terminal 1</div>
                <div className="p-2 bg-slate-900 rounded font-mono text-sky-300 text-[11px]">
                  java AdditionServer
                </div>
                <div className="text-slate-500 text-[11px]">Server will output: "Waiting for client connection..."</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="font-semibold text-slate-200">4. Split Terminal (Crucial Step!)</div>
                <div className="text-slate-400">
                  Click the <strong>Split Terminal</strong> icon (two vertical panels) in the top-right of the terminal bar, or press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">Ctrl + Shift + 5</kbd> (<kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">Cmd + \</kbd> on Mac).
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="font-semibold text-slate-200">5. Run Client in Terminal 2</div>
                <div className="p-2 bg-slate-900 rounded font-mono text-emerald-300 text-[11px]">
                  java AdditionClient 25 75
                </div>
                <div className="text-slate-500 text-[11px]">The server immediately computes and replies: <strong>100</strong>!</div>
              </div>
            </div>
          </div>
        </div>

        {/* Method 2: F5 Debugging with .vscode/launch.json */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-sky-400" />
                Method 2: One-Click F5 (Extension Pack for Java)
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                GUI / Debugger
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Use Microsoft's official <strong>Extension Pack for Java</strong> to run or debug with breakpoints.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200">1. Install Java Extension Pack</div>
                <div className="text-slate-400">
                  Search <code className="text-sky-300 font-mono">Extension Pack for Java</code> in Extensions tab (<kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">Ctrl+Shift+X</kbd>) and click Install.
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">2. Pre-configured .vscode/launch.json</span>
                  <button
                    onClick={() => copyToClipboard(launchJsonContent, 'launch')}
                    className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300"
                  >
                    {copiedConfig === 'launch' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy launch.json</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2 bg-slate-900 rounded font-mono text-[11px] text-slate-300 max-h-32 overflow-y-auto">
                  <pre>{launchJsonContent}</pre>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200">3. Compound Launch</div>
                <div className="text-slate-400">
                  Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">F5</kbd> or open <strong>Run & Debug</strong> panel. Select <strong>"Run Server & Client Together"</strong> to launch both at once!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Split Terminal Layout Representation */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-sky-400" />
          What Your VS Code Split Terminal Looks Like
        </h3>

        <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden text-xs font-mono">
          {/* Mock VS Code Terminal Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-slate-400">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-white">TERMINAL</span>
              <span className="text-slate-500">PORTS</span>
              <span className="text-slate-500">OUTPUT</span>
              <span className="text-slate-500">DEBUG CONSOLE</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">1: bash (Server)</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">2: bash (Client)</span>
            </div>
          </div>

          {/* Split Panes */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 p-4 gap-4 bg-slate-950">
            {/* Left Pane (Server) */}
            <div className="space-y-1 text-slate-300">
              <div className="text-sky-400 font-bold">$ java AdditionServer</div>
              <div className="text-slate-400">==================================================</div>
              <div className="text-slate-400">    JAVA SOCKET ADDITION SERVER (TCP PORT 5000)</div>
              <div className="text-slate-400">==================================================</div>
              <div className="text-slate-400">[SERVER] ServerSocket bound to port 5000</div>
              <div className="text-slate-400">[SERVER] Socket state: LISTEN</div>
              <div className="text-sky-300">[SERVER] Connection accepted from: 127.0.0.1:54912</div>
              <div className="text-slate-400">[SERVER] Received first integer:  35</div>
              <div className="text-slate-400">[SERVER] Received second integer: 65</div>
              <div className="text-emerald-400">[SERVER] Computing: 35 + 65 = 100</div>
              <div className="text-sky-400">[SERVER] Sent sum (100) back to client.</div>
            </div>

            {/* Right Pane (Client) */}
            <div className="space-y-1 text-slate-300 pt-3 md:pt-0">
              <div className="text-emerald-400 font-bold">$ java AdditionClient 35 65</div>
              <div className="text-slate-400">==================================================</div>
              <div className="text-slate-400">         JAVA SOCKET ADDITION CLIENT</div>
              <div className="text-slate-400">==================================================</div>
              <div className="text-slate-400">[CLIENT] Target Server: localhost:5000</div>
              <div className="text-slate-400">[CLIENT] Transmitting first integer:  35</div>
              <div className="text-slate-400">[CLIENT] Transmitting second integer: 65</div>
              <div className="text-slate-400">[CLIENT] Integers flushed. Awaiting reply...</div>
              <div className="text-emerald-300 font-bold">  Calculated Sum: 100</div>
              <div className="text-emerald-400">[CLIENT] Verification PASS: 35 + 65 == 100</div>
              <div className="text-slate-500">[CLIENT] Client socket closed.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Common VS Code Pitfalls & Fixes */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          Common Issues When Running in VS Code
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-semibold text-amber-400">
              1. "Address already in use: bind" (Port 5000 Busy)
            </div>
            <p className="text-slate-400 leading-relaxed">
              <strong>Cause:</strong> An earlier instance of <code className="text-slate-200">AdditionServer</code> is still running in a background terminal.
              <br />
              <strong>Fix:</strong> Switch to that terminal tab and press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">Ctrl + C</kbd> to stop it, or run on another port:
              <code className="text-sky-300 font-mono block mt-1">java AdditionServer 5050</code>
              <code className="text-emerald-300 font-mono block">java AdditionClient 10 20 localhost 5050</code>
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-semibold text-sky-400">
              2. "Connection refused: connect"
            </div>
            <p className="text-slate-400 leading-relaxed">
              <strong>Cause:</strong> The client ran before the server had finished binding to the port.
              <br />
              <strong>Fix:</strong> Always start <code className="text-slate-200 font-mono">AdditionServer</code> first. Wait until it displays <em className="text-slate-300">"Waiting for client connection..."</em>, then execute <code className="text-slate-200 font-mono">AdditionClient</code> in the other terminal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
