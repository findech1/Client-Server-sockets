import React from 'react';
import { BookOpen, Network, CheckCircle2, AlertTriangle, ArrowRight, Layers, ShieldCheck, Zap } from 'lucide-react';

export const ArchitectureGuide: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Overview Intro */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider">
          <Network className="w-4 h-4" />
          <span>Computer Networking Concepts</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Java Socket Architecture: How Client & Server Add Integers
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Java provides low-level network communication via the <code className="text-sky-300 bg-slate-950 px-1.5 py-0.5 rounded font-mono">java.net</code> package.
          Communication strictly uses TCP (Transmission Control Protocol), which guarantees ordered, reliable, and error-checked delivery of byte streams between two end hosts.
        </p>
      </div>

      {/* 1. ServerSocket vs Socket Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-sm font-bold text-sky-400 font-mono">java.net.ServerSocket</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300">Server Side</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Acts as a connection listener bound to a specific TCP port (e.g., 5000). It does not transfer integer data itself.
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
            <li>Binds to OS port via <code className="text-slate-200">bind()</code> system call.</li>
            <li>Enters <code className="text-slate-200">LISTEN</code> state with a backlogged queue.</li>
            <li>Calls <code className="text-slate-200">accept()</code> which blocks until a client connects.</li>
            <li>Returns a separate <code className="text-slate-200">Socket</code> for each accepted client.</li>
          </ul>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-sm font-bold text-emerald-400 font-mono">java.net.Socket</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300">Both Endpoints</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Represents an active, bidirectional communication channel between two IP:Port endpoints.
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
            <li>On client: <code className="text-slate-200">new Socket(host, port)</code> connects to server.</li>
            <li>On server: Returned by <code className="text-slate-200">serverSocket.accept()</code>.</li>
            <li>Provides <code className="text-slate-200">getInputStream()</code> for receiving incoming bytes.</li>
            <li>Provides <code className="text-slate-200">getOutputStream()</code> for sending outgoing bytes.</li>
          </ul>
        </div>
      </div>

      {/* 2. Step-by-Step Socket Protocol Sequence */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          The Exact Integer Addition Protocol Sequence
        </h3>

        <div className="space-y-4 text-xs">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-mono font-bold flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <div className="font-semibold text-white">Server Starts & Binds</div>
              <p className="text-slate-400 mt-0.5">
                <code className="text-sky-300 font-mono">ServerSocket ss = new ServerSocket(5000);</code> allocates the port.
                Calling <code className="text-sky-300 font-mono">ss.accept()</code> blocks the server execution thread until a client arrives.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-mono font-bold flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <div className="font-semibold text-white">Client Connects & TCP 3-Way Handshake</div>
              <p className="text-slate-400 mt-0.5">
                <code className="text-emerald-300 font-mono">Socket socket = new Socket("localhost", 5000);</code> initiates connection.
                TCP kernel stack exchanges SYN, SYN-ACK, ACK. Once complete, server’s <code className="text-sky-300 font-mono">accept()</code> returns a dedicated client socket.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-mono font-bold flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <div className="font-semibold text-white">Client Sends Integers via DataOutputStream</div>
              <p className="text-slate-400 mt-0.5">
                Client wraps output stream in <code className="text-sky-300 font-mono">DataOutputStream</code> and invokes:
                <code className="text-emerald-300 font-mono block mt-1">out.writeInt(num1); out.writeInt(num2); out.flush();</code>
                Each <code className="font-mono text-slate-300">writeInt()</code> emits 4 bytes (32 bits) in Big-Endian order. Calling <code className="font-mono text-amber-300">flush()</code> forces the internal buffer onto the network wire.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-mono font-bold flex items-center justify-center shrink-0">
              4
            </div>
            <div>
              <div className="font-semibold text-white">Server Reads Integers, Computes Sum & Replies</div>
              <p className="text-slate-400 mt-0.5">
                Server executes <code className="text-sky-300 font-mono">int num1 = in.readInt(); int num2 = in.readInt();</code>.
                Calculates <code className="text-sky-300 font-mono">int sum = num1 + num2;</code>.
                Then writes <code className="text-sky-300 font-mono">out.writeInt(sum); out.flush();</code> back into client socket.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-mono font-bold flex items-center justify-center shrink-0">
              5
            </div>
            <div>
              <div className="font-semibold text-white">Client Reads Sum & Clean Shutdown</div>
              <p className="text-slate-400 mt-0.5">
                Client’s blocked <code className="text-emerald-300 font-mono">int sum = in.readInt();</code> unblocks upon receiving 4 bytes.
                Both sides exit their <code className="text-slate-300 font-mono">try-with-resources</code> blocks, sending TCP FIN packets to close the connection gracefully.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Stream Comparison: Binary vs Text */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400" />
          Binary Streams vs Text Line Streams Comparison
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="py-2.5 px-3">Feature</th>
                <th className="py-2.5 px-3 text-sky-400">DataInputStream / DataOutputStream</th>
                <th className="py-2.5 px-3 text-emerald-400">BufferedReader / PrintWriter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold text-white">Data Format</td>
                <td className="py-2.5 px-3">Raw 4-byte 32-bit binary integers</td>
                <td className="py-2.5 px-3">ASCII/UTF-8 character strings + newline (\\n)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold text-white">Bandwidth per Int</td>
                <td className="py-2.5 px-3">Fixed 4 bytes (always)</td>
                <td className="py-2.5 px-3">Variable (e.g. "2147483647\\n" = 11 bytes)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold text-white">Parsing Overhead</td>
                <td className="py-2.5 px-3">Zero (direct bit shifts)</td>
                <td className="py-2.5 px-3">Requires Integer.parseInt(line.trim())</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold text-white">Human Debugging</td>
                <td className="py-2.5 px-3">Requires hex/byte viewer</td>
                <td className="py-2.5 px-3">Can test via telnet or netcat (nc localhost 5001)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold text-white">Best Used For</td>
                <td className="py-2.5 px-3">High performance, strict Java-to-Java communication</td>
                <td className="py-2.5 px-3">Polyglot protocols (Python, JS, CLI telnet)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Common Socket Traps & Best Practices */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          Critical Socket Programming Best Practices
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-semibold text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Always call out.flush()
            </div>
            <p className="text-slate-400 leading-relaxed">
              Output streams buffer outgoing bytes to minimize network packet fragmentation (Nagle's algorithm). If you forget <code className="text-slate-200">flush()</code>, the bytes will sit in local RAM and the remote reader will hang forever waiting.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-semibold text-sky-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              Use Try-With-Resources
            </div>
            <p className="text-slate-400 leading-relaxed">
              Always wrap both <code className="text-slate-200">ServerSocket</code> and <code className="text-slate-200">Socket</code> in Java's try-with-resources statement. This guarantees socket descriptors are released back to the kernel even if network I/O exceptions occur.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-semibold text-sky-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              Handle BindException
            </div>
            <p className="text-slate-400 leading-relaxed">
              If another process is using port 5000, Java throws <code className="text-slate-200">java.net.BindException: Address already in use</code>. Allow port configuration via command-line arguments (<code className="text-slate-200">args[0]</code>).
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-semibold text-sky-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              Thread Pool for Concurrency
            </div>
            <p className="text-slate-400 leading-relaxed">
              A single-threaded server blocks all other clients while handling one request. In multi-user environments, immediately dispatch accepted sockets to an <code className="text-slate-200">ExecutorService</code> thread pool.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
