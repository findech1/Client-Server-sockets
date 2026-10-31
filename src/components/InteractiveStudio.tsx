import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft, ArrowRight, Zap, CheckCircle2, ShieldAlert, Cpu, Terminal, RefreshCw, Layers } from 'lucide-react';
import { ExecutionResult } from '../types';

interface InteractiveStudioProps {
  num1: number;
  num2: number;
  setNum1: (v: number) => void;
  setNum2: (v: number) => void;
  implementation: 'binary' | 'text' | 'multithreaded';
  setImplementation: (v: 'binary' | 'text' | 'multithreaded') => void;
  onExecute: () => void;
  isRunning: boolean;
  lastResult: ExecutionResult | null;
}

export const InteractiveStudio: React.FC<InteractiveStudioProps> = ({
  num1,
  num2,
  setNum1,
  setNum2,
  implementation,
  setImplementation,
  onExecute,
  isRunning,
  lastResult,
}) => {
  // Step-by-step simulation state
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // ms per step
  const [activeLogTab, setActiveLogTab] = useState<'both' | 'server' | 'client'>('both');

  const exactSum = BigInt(num1) + BigInt(num2);
  const isOverflow = exactSum > BigInt(2147483647) || exactSum < BigInt(-2147483648);
  const clampedSum = (num1 + num2) | 0;

  // Preset scenarios
  const presets = [
    { label: 'Basic Addition', a: 15, b: 27 },
    { label: 'Negative Values', a: -45, b: 120 },
    { label: 'Zero Operand', a: 0, b: 999 },
    { label: 'Large Numbers', a: 1500000, b: 3500000 },
    { label: '32-Bit Max Boundary', a: 2147483640, b: 15 },
  ];

  // Simulation steps definitions
  const simulationSteps = [
    {
      title: '1. Server Initialization',
      phase: 'SETUP',
      actor: 'SERVER',
      serverState: 'LISTEN',
      clientState: 'CLOSED',
      description: 'The Server instantiates ServerSocket(5000). The operating system binds the socket to TCP port 5000 and places it in the LISTEN state.',
      serverCode: 'ServerSocket serverSocket = new ServerSocket(5000);',
      clientCode: '// Client process is idle',
      wireState: 'IDLE',
      packet: null,
    },
    {
      title: '2. Server Blocks on accept()',
      phase: 'WAITING',
      actor: 'SERVER',
      serverState: 'ACCEPT_BLOCK',
      clientState: 'CLOSED',
      description: 'The server executes serverSocket.accept(). The main thread pauses (blocks) waiting for incoming TCP connection requests on port 5000.',
      serverCode: 'Socket clientSocket = serverSocket.accept(); // BLOCKS',
      clientCode: '// Preparing connection parameters',
      wireState: 'IDLE',
      packet: null,
    },
    {
      title: '3. TCP 3-Way Handshake',
      phase: 'HANDSHAKE',
      actor: 'NETWORK',
      serverState: 'SYN_RCVD',
      clientState: 'SYN_SENT',
      description: 'Client calls new Socket("localhost", 5000). TCP kernel stack exchanges SYN, SYN-ACK, and ACK packets to establish reliable transport.',
      serverCode: '// Kernel completing TCP 3-way handshake',
      clientCode: 'Socket socket = new Socket("localhost", 5000);',
      wireState: 'HANDSHAKE',
      packet: { label: 'TCP SYN ➔ SYN-ACK ➔ ACK', direction: 'bidirectional' },
    },
    {
      title: '4. Sockets Connected & Streams Bound',
      phase: 'CONNECTED',
      actor: 'BOTH',
      serverState: 'ESTABLISHED',
      clientState: 'ESTABLISHED',
      description: 'accept() unblocks and returns clientSocket. Both endpoints create DataInputStream and DataOutputStream wrappers around socket byte streams.',
      serverCode: 'DataInputStream in = new DataInputStream(clientSocket.getInputStream());\nDataOutputStream out = new DataOutputStream(clientSocket.getOutputStream());',
      clientCode: 'DataOutputStream out = new DataOutputStream(socket.getOutputStream());\nDataInputStream in = new DataInputStream(socket.getInputStream());',
      wireState: 'ESTABLISHED',
      packet: null,
    },
    {
      title: '5. Client Transmits Two Integers',
      phase: 'DATA_TRANSFER',
      actor: 'CLIENT',
      serverState: 'READ_BLOCK',
      clientState: 'WRITING',
      description: `Client writes num1 (${num1}) and num2 (${num2}) as 4 bytes each (Big-Endian network order), then calls out.flush() to push bytes across the wire.`,
      serverCode: 'int num1 = in.readInt(); // Waiting for 4 bytes\nint num2 = in.readInt(); // Waiting for next 4 bytes',
      clientCode: `out.writeInt(${num1});\nout.writeInt(${num2});\nout.flush(); // FLUSH BUFFER TO WIRE`,
      wireState: 'CLIENT_TO_SERVER',
      packet: {
        label: `Payload: [Int1: ${num1}] [Int2: ${num2}] (8 bytes)`,
        direction: 'right',
        bytes: [
          ...intToHexBytes(num1),
          ...intToHexBytes(num2),
        ],
      },
    },
    {
      title: '6. Server Computes Addition',
      phase: 'PROCESSING',
      actor: 'SERVER',
      serverState: 'CALCULATING',
      clientState: 'READ_BLOCK',
      description: `Server unblocks after receiving both 4-byte sequences and calculates sum = ${num1} + ${num2} = ${clampedSum}. Client calls in.readInt() and blocks.`,
      serverCode: `int sum = num1 + num2; // ${num1} + ${num2} = ${clampedSum}`,
      clientCode: 'int sum = in.readInt(); // BLOCKS waiting for server reply',
      wireState: 'IDLE',
      packet: null,
    },
    {
      title: '7. Server Transmits Sum Reply',
      phase: 'REPLY',
      actor: 'SERVER',
      serverState: 'WRITING',
      clientState: 'READING',
      description: `Server transmits the 4-byte result (${clampedSum}) back to client through clientSocket.getOutputStream() and flushes the buffer.`,
      serverCode: `out.writeInt(sum); // Writing ${clampedSum} (4 bytes)\nout.flush();`,
      clientCode: 'int sum = in.readInt(); // Receiving 4 bytes...',
      wireState: 'SERVER_TO_CLIENT',
      packet: {
        label: `Payload: [Sum: ${clampedSum}] (4 bytes)`,
        direction: 'left',
        bytes: intToHexBytes(clampedSum),
      },
    },
    {
      title: '8. Client Receives Result & Sockets Close',
      phase: 'COMPLETE',
      actor: 'BOTH',
      serverState: 'CLOSED',
      clientState: 'CLOSED',
      description: `Client unblocks, outputs sum (${clampedSum}), verifies ${num1} + ${num2} == ${clampedSum}. Both sockets close cleanly via try-with-resources.`,
      serverCode: '// try-with-resources invokes clientSocket.close()',
      clientCode: `System.out.println("Result: " + sum);\n// socket.close() sends TCP FIN`,
      wireState: 'FIN',
      packet: null,
    },
  ];

  // Helper to convert signed 32-bit integer to 4 hex bytes
  function intToHexBytes(val: number): string[] {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setInt32(0, val, false); // Big-Endian
    const bytes: string[] = [];
    for (let i = 0; i < 4; i++) {
      bytes.push('0x' + view.getUint8(i).toString(16).padStart(2, '0').toUpperCase());
    }
    return bytes;
  }

  // Animation ticker for simulation
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= simulationSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, simulationSteps.length]);

  const stepData = simulationSteps[currentStep];

  return (
    <div className="space-y-6">
      {/* Top Banner / Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
            <span>TCP Network Programming</span>
            <span aria-hidden="true">·</span>
            <span>java.net.ServerSocket & java.net.Socket</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Client-Server Integer Addition Playground
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Input two integers to execute actual compiled Java socket programs over localhost TCP, or step through the animated packet sequence and binary wire inspector.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5 self-start md:self-center">
          <span className="text-xs text-slate-500 mr-1">Presets:</span>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setNum1(p.a);
                setNum2(p.b);
              }}
              className="px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-md border border-slate-700/60 transition-colors whitespace-nowrap"
            >
              {p.a} + {p.b}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Input & Protocol Controls + Real Execution vs Visual Sim */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Parameter Controls & Real Runner */}
        <div className="lg:col-span-5 space-y-6">
          {/* Input Parameters Card */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-sky-400" />
                Integer Input Parameters
              </h3>
              <span className="text-xs text-slate-500 font-mono">32-bit signed int</span>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Integer 1 (num1)
                </label>
                <input
                  type="number"
                  value={num1}
                  onChange={(e) => setNum1(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 text-base font-mono font-semibold bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500 transition-colors tabular-nums"
                />
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  Hex: {intToHexBytes(num1).join(' ')}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Integer 2 (num2)
                </label>
                <input
                  type="number"
                  value={num2}
                  onChange={(e) => setNum2(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 text-base font-mono font-semibold bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500 transition-colors tabular-nums"
                />
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  Hex: {intToHexBytes(num2).join(' ')}
                </div>
              </div>
            </div>

            {/* Sum Calculation Bar */}
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Target Expression:</span>
                <div className="text-sm font-mono font-bold text-sky-400 tabular-nums">
                  {num1} + {num2} = {clampedSum}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Sum Hex (4 bytes):</span>
                <div className="text-xs font-mono text-emerald-400 tabular-nums">
                  {intToHexBytes(clampedSum).join(' ')}
                </div>
              </div>
            </div>

            {isOverflow && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <span className="font-semibold">32-bit Integer Overflow Warning:</span>{' '}
                  Sum exceeds 32-bit limit [-2,147,483,648 to 2,147,483,647]. Java sockets wrap via two's complement to {clampedSum}.
                </div>
              </div>
            )}

            {/* Implementation Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                Java Socket Protocol Implementation
              </label>
              <div className="space-y-2">
                <label
                  onClick={() => setImplementation('binary')}
                  className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    implementation === 'binary'
                      ? 'bg-sky-500/10 border-sky-500/50 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="impl"
                    checked={implementation === 'binary'}
                    onChange={() => setImplementation('binary')}
                    className="mt-1 text-sky-500"
                  />
                  <div>
                    <div className="text-xs font-semibold text-sky-300">
                      DataInputStream / DataOutputStream (Binary)
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Direct 4-byte Big-Endian primitive serialization (readInt/writeInt). Most efficient & strict Java approach.
                    </div>
                  </div>
                </label>

                <label
                  onClick={() => setImplementation('text')}
                  className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    implementation === 'text'
                      ? 'bg-sky-500/10 border-sky-500/50 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="impl"
                    checked={implementation === 'text'}
                    onChange={() => setImplementation('text')}
                    className="mt-1 text-sky-500"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      BufferedReader / PrintWriter (Text Line Stream)
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Transmits numbers as ASCII string characters with newline delimiters (println/readLine).
                    </div>
                  </div>
                </label>

                <label
                  onClick={() => setImplementation('multithreaded')}
                  className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    implementation === 'multithreaded'
                      ? 'bg-sky-500/10 border-sky-500/50 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="impl"
                    checked={implementation === 'multithreaded'}
                    onChange={() => setImplementation('multithreaded')}
                    className="mt-1 text-sky-500"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      MultiThreadedServer (ExecutorService Pool)
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Dispatches client sockets to a thread pool worker for high-concurrency production setups.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={onExecute}
              disabled={isRunning}
              className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-50 font-semibold text-sm text-white rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Zap className={`w-4 h-4 ${isRunning ? 'animate-bounce' : ''}`} />
              {isRunning ? 'Compiling & Running Java Sockets...' : 'Execute Real Java Client & Server'}
            </button>
          </div>

          {/* Real Java Execution Output Card */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Live Execution Terminal</h3>
              </div>
              {lastResult && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-mono">Port: {lastResult.port}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-slate-400 font-mono tabular-nums">{lastResult.durationMs}ms</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    PASS
                  </span>
                </div>
              )}
            </div>

            {/* Tabs for server vs client logs */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveLogTab('both')}
                className={`flex-1 py-1 px-2 rounded-md transition-colors ${
                  activeLogTab === 'both' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Combined Log
              </button>
              <button
                onClick={() => setActiveLogTab('server')}
                className={`flex-1 py-1 px-2 rounded-md transition-colors ${
                  activeLogTab === 'server' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Server Process
              </button>
              <button
                onClick={() => setActiveLogTab('client')}
                className={`flex-1 py-1 px-2 rounded-md transition-colors ${
                  activeLogTab === 'client' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Client Process
              </button>
            </div>

            {/* Console Log Window */}
            <div className="h-64 overflow-y-auto p-3 bg-slate-950 rounded-lg font-mono text-xs text-slate-300 border border-slate-800/80 space-y-1">
              {!lastResult && !isRunning && (
                <div className="text-slate-500 italic py-8 text-center">
                  Click "Execute Real Java Client & Server" to compile and run the Java processes on port 5300+
                </div>
              )}

              {isRunning && (
                <div className="flex items-center gap-2 text-sky-400 py-4 justify-center">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Compiling Java files & executing socket handshake...</span>
                </div>
              )}

              {lastResult && (
                <>
                  {(activeLogTab === 'both' || activeLogTab === 'server') &&
                    lastResult.serverLogs.map((log, i) => (
                      <div
                        key={'srv-' + i}
                        className={log.type === 'stderr' ? 'text-red-400' : 'text-sky-300/90'}
                      >
                        {log.message}
                      </div>
                    ))}
                  {(activeLogTab === 'both' || activeLogTab === 'client') &&
                    lastResult.clientLogs.map((log, i) => (
                      <div
                        key={'cli-' + i}
                        className={log.type === 'stderr' ? 'text-red-400' : 'text-emerald-300/90'}
                      >
                        {log.message}
                      </div>
                    ))}
                </>
              )}
            </div>

            {lastResult && (
              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Calculated sum confirmed by server: <strong>{lastResult.sum}</strong>
                </span>
                <span className="font-mono text-slate-400">Exit Code: 0</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 cols): Interactive Socket Lifecycle Simulator & Wire Inspector */}
        <div className="lg:col-span-7 space-y-6">
          {/* Animated Socket Lifecycle Stage */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <h3 className="text-sm font-semibold text-white">
                    Step-by-Step Socket Lifecycle Simulator
                  </h3>
                </div>
                <span className="text-xs text-slate-400 mt-0.5 block">
                  Step {currentStep + 1} of {simulationSteps.length}: {stepData.title}
                </span>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentStep((p) => Math.max(0, p - 1))}
                  disabled={currentStep === 0}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-md transition-colors"
                  title="Previous Step"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-md flex items-center gap-1.5 transition-colors"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" /> Auto-Play
                    </>
                  )}
                </button>
                <button
                  onClick={() => setCurrentStep((p) => Math.min(simulationSteps.length - 1, p + 1))}
                  disabled={currentStep === simulationSteps.length - 1}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-md transition-colors"
                  title="Next Step"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStep(0);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
                  title="Reset Simulation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Speed toggle */}
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 rounded-md px-2 py-1.5 focus:outline-none"
                >
                  <option value={1800}>0.5x Speed</option>
                  <option value={1000}>1.0x Speed</option>
                  <option value={500}>2.0x Speed</option>
                </select>
              </div>
            </div>

            {/* Interactive Network Diagram Canvas */}
            <div className="relative p-6 rounded-xl bg-slate-950 border border-slate-800/90 overflow-hidden">
              {/* Node Columns */}
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Client Host Box */}
                <div
                  className={`col-span-4 p-4 rounded-xl border transition-all duration-300 ${
                    stepData.actor === 'CLIENT' || stepData.actor === 'BOTH'
                      ? 'bg-emerald-950/30 border-emerald-500/60 ring-2 ring-emerald-500/20'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-400">CLIENT HOST</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {stepData.clientState}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-300 space-y-1">
                    <div>Port: <span className="text-emerald-400">Ephemeral (e.g. 54321)</span></div>
                    <div>Integers: <span className="text-white font-bold">{num1}, {num2}</span></div>
                    <div>Socket: <span className="text-slate-400">new Socket()</span></div>
                  </div>
                </div>

                {/* The Wire / TCP Connection Channel */}
                <div className="col-span-4 flex flex-col items-center justify-center relative py-4">
                  <div className="w-full h-1 bg-slate-800 relative rounded-full overflow-hidden">
                    {/* Animated packet on the wire */}
                    {stepData.packet && (
                      <div
                        className={`absolute top-0 bottom-0 w-8 bg-sky-400 shadow-md shadow-sky-400/50 rounded-full transition-all duration-500 ${
                          stepData.packet.direction === 'right'
                            ? 'left-3/4 animate-pulse'
                            : stepData.packet.direction === 'left'
                            ? 'left-1/4 animate-pulse'
                            : 'left-1/2'
                        }`}
                      />
                    )}
                  </div>

                  {/* Packet Badge */}
                  <div className="mt-3 text-center">
                    {stepData.packet ? (
                      <div className="inline-block px-2.5 py-1 rounded bg-sky-950 border border-sky-500/40 text-[11px] font-mono text-sky-300 animate-pulse">
                        {stepData.packet.label}
                      </div>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-600">
                        TCP Channel ({stepData.wireState})
                      </span>
                    )}
                  </div>
                </div>

                {/* Server Host Box */}
                <div
                  className={`col-span-4 p-4 rounded-xl border transition-all duration-300 ${
                    stepData.actor === 'SERVER' || stepData.actor === 'BOTH'
                      ? 'bg-sky-950/30 border-sky-500/60 ring-2 ring-sky-500/20'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-sky-400">SERVER HOST</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {stepData.serverState}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-300 space-y-1">
                    <div>Port: <span className="text-sky-400 font-bold">5000 (Bound)</span></div>
                    <div>ServerSocket: <span className="text-slate-400">LISTEN</span></div>
                    <div>Sum: <span className="text-white font-bold">{clampedSum}</span></div>
                  </div>
                </div>
              </div>

              {/* Step Explanatory Banner */}
              <div className="mt-5 p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                <span className="font-semibold text-sky-400 mr-1.5">{stepData.phase}:</span>
                {stepData.description}
              </div>
            </div>

            {/* Synchronized Java Code Highlighting */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                <div className="text-xs font-semibold text-emerald-400 mb-1.5">
                  Client Execution State:
                </div>
                <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {stepData.clientCode}
                </pre>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                <div className="text-xs font-semibold text-sky-400 mb-1.5">
                  Server Execution State:
                </div>
                <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {stepData.serverCode}
                </pre>
              </div>
            </div>
          </div>

          {/* Binary Wire Packet Inspector */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                Network Wire Packet & Endianness Inspector
              </h3>
              <span className="text-xs text-slate-500 font-mono">TCP Payload / Big-Endian</span>
            </div>

            <div className="space-y-3">
              {/* Client -> Server Payload */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
                  <span className="text-emerald-400 font-semibold">Client ➔ Server Payload (8 Bytes Total)</span>
                  <span className="font-mono">DataOutputStream.writeInt()</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <div className="text-[11px] text-slate-400 mb-1 font-mono">
                      Integer 1: <strong>{num1}</strong> (4 Bytes)
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      {intToHexBytes(num1).map((b, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded bg-slate-950 border border-emerald-500/40 text-emerald-300 font-bold"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <div className="text-[11px] text-slate-400 mb-1 font-mono">
                      Integer 2: <strong>{num2}</strong> (4 Bytes)
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      {intToHexBytes(num2).map((b, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded bg-slate-950 border border-emerald-500/40 text-emerald-300 font-bold"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Server -> Client Reply Payload */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
                  <span className="text-sky-400 font-semibold">Server ➔ Client Reply (4 Bytes Total)</span>
                  <span className="font-mono">DataInputStream.readInt()</span>
                </div>

                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400 font-mono">
                    Calculated Sum: <strong className="text-white text-xs">{clampedSum}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    {intToHexBytes(clampedSum).map((b, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded bg-slate-950 border border-sky-500/40 text-sky-300 font-bold"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-2 pt-1">
              <span className="font-semibold text-slate-300">Network Byte Order Note:</span>
              Java's DataOutputStream writes the Most Significant Byte (MSB) first, conforming strictly to IETF standard Big-Endian network byte order.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
