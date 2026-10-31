import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, Info, ExternalLink, Terminal } from 'lucide-react';
import { JAVA_FILES, SOCKET_ANNOTATIONS } from '../data/javaSource';

export const CodeViewer: React.FC = () => {
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState<number>(0);

  const currentFile = JAVA_FILES[selectedFileIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentFile.content], { type: 'text/x-java-source;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const lines = currentFile.content.split('\n');

  return (
    <div className="space-y-6">
      {/* Top Bar with file tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {JAVA_FILES.map((file, idx) => (
            <button
              key={file.fileName}
              onClick={() => setSelectedFileIndex(idx)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedFileIndex === idx
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              {file.fileName}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .java</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Code Editor Display + Interactive Socket Annotations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Code Block with line numbers (8 cols) */}
        <div className="lg:col-span-8 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col">
          {/* File Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="font-mono font-bold text-sky-400">{currentFile.fileName}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">{currentFile.title}</span>
            </div>
            <span className="text-slate-500 font-mono">{lines.length} lines</span>
          </div>

          {/* Description banner */}
          <div className="px-4 py-2 bg-slate-900/40 border-b border-slate-800/60 text-xs text-slate-400">
            {currentFile.description}
          </div>

          {/* Source Lines */}
          <div className="p-4 overflow-x-auto text-xs font-mono leading-relaxed max-h-[640px] overflow-y-auto">
            <table className="w-full border-collapse">
              <tbody>
                {lines.map((line, idx) => {
                  const lineNum = idx + 1;
                  const isImport = line.startsWith('import ');
                  const isComment = line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*');
                  const isSocketCall =
                    line.includes('ServerSocket') ||
                    line.includes('Socket ') ||
                    line.includes('accept()') ||
                    line.includes('readInt()') ||
                    line.includes('writeInt(') ||
                    line.includes('flush()');

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-900/60 ${isSocketCall ? 'bg-sky-950/20' : ''}`}
                    >
                      <td className="w-10 pr-4 text-right text-slate-600 select-none tabular-nums font-mono">
                        {lineNum}
                      </td>
                      <td
                        className={`whitespace-pre ${
                          isComment
                            ? 'text-slate-500 italic'
                            : isImport
                            ? 'text-purple-400'
                            : isSocketCall
                            ? 'text-sky-300 font-semibold'
                            : 'text-slate-200'
                        }`}
                      >
                        {line}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (4 cols): Socket Mechanics & Concept Reference */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Info className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-semibold text-white">Java Socket Mechanics</h3>
            </div>

            <p className="text-xs text-slate-400">
              Click any core socket primitive below to inspect how it interacts with the underlying TCP networking stack:
            </p>

            <div className="space-y-1.5">
              {SOCKET_ANNOTATIONS.map((anno, idx) => (
                <button
                  key={anno.keyword}
                  onClick={() => setSelectedAnnotation(idx)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors ${
                    selectedAnnotation === idx
                      ? 'bg-sky-500/10 border-sky-500/40 text-white'
                      : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-sky-400">{anno.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{anno.summary}</div>
                </button>
              ))}
            </div>

            {/* Selected Annotation Details */}
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="text-xs font-bold text-sky-300">
                {SOCKET_ANNOTATIONS[selectedAnnotation].title}
              </div>
              <div className="text-xs text-slate-300 leading-relaxed">
                {SOCKET_ANNOTATIONS[selectedAnnotation].detail}
              </div>
            </div>
          </div>

          {/* CLI Instructions Card */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Terminal className="w-4 h-4" />
              <span>How to Compile & Run in Terminal</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="text-[11px] text-slate-400">1. Compile both files:</div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-200">
                javac AdditionServer.java AdditionClient.java
              </div>

              <div className="text-[11px] text-slate-400 mt-2">2. In Terminal A (Server):</div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800 text-sky-300">
                java AdditionServer
              </div>

              <div className="text-[11px] text-slate-400 mt-2">3. In Terminal B (Client):</div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800 text-emerald-300">
                java AdditionClient 25 75
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
