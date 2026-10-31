import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { spawn, execSync } from 'child_process';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JAVA_DIR = path.resolve(__dirname, 'java_source');

app.use(express.json());

// Helper to find an available port for socket communication
function getAvailablePort(startPort = 5200): Promise<number> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      const port = (server.address() as net.AddressInfo).port;
      server.close(() => resolve(port));
    });
    server.on('error', () => {
      resolve(getAvailablePort(startPort + 1));
    });
  });
}

// System info endpoint
app.get('/api/system-info', (req, res) => {
  try {
    const javaVersion = execSync('java -version 2>&1').toString().split('\n')[0];
    const javacVersion = execSync('javac -version 2>&1').toString().trim();
    res.json({
      available: true,
      javaVersion,
      javacVersion,
      platform: process.platform,
      arch: process.arch,
    });
  } catch (error: any) {
    res.json({
      available: false,
      error: error.message,
    });
  }
});

// Source code list and content endpoint
app.get('/api/source-code', (req, res) => {
  try {
    const files = [
      {
        fileName: 'AdditionServer.java',
        title: 'Binary TCP Server (DataInputStream)',
        description: 'Primary server using ServerSocket, DataInputStream.readInt(), and DataOutputStream.writeInt().',
        content: fs.readFileSync(path.join(JAVA_DIR, 'AdditionServer.java'), 'utf-8'),
        role: 'server',
        protocol: 'binary',
      },
      {
        fileName: 'AdditionClient.java',
        title: 'Binary TCP Client (DataOutputStream)',
        description: 'Client connecting via Socket, sending two 32-bit integers, and reading the replied sum.',
        content: fs.readFileSync(path.join(JAVA_DIR, 'AdditionClient.java'), 'utf-8'),
        role: 'client',
        protocol: 'binary',
      },
      {
        fileName: 'TextAdditionServer.java',
        title: 'Text Line TCP Server (BufferedReader)',
        description: 'Alternative server using line-based streams with BufferedReader and PrintWriter.',
        content: fs.readFileSync(path.join(JAVA_DIR, 'TextAdditionServer.java'), 'utf-8'),
        role: 'server',
        protocol: 'text',
      },
      {
        fileName: 'TextAdditionClient.java',
        title: 'Text Line TCP Client (PrintWriter)',
        description: 'Alternative client sending integers as string lines with newline delimiters.',
        content: fs.readFileSync(path.join(JAVA_DIR, 'TextAdditionClient.java'), 'utf-8'),
        role: 'client',
        protocol: 'text',
      },
      {
        fileName: 'MultiThreadedServer.java',
        title: 'Concurrent Multi-Threaded Server (ThreadPool)',
        description: 'Production-ready concurrent server using ExecutorService to serve multiple clients simultaneously.',
        content: fs.readFileSync(path.join(JAVA_DIR, 'MultiThreadedServer.java'), 'utf-8'),
        role: 'server',
        protocol: 'multithreaded',
      },
    ];
    res.json({ success: true, files });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Download full VS Code project ZIP
app.get('/api/download-vscode-zip', (req, res) => {
  const zipPath = path.resolve(__dirname, 'public', 'vscode-java-socket-project.zip');
  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Disposition', 'attachment; filename="vscode-java-socket-project.zip"');
    res.setHeader('Content-Type', 'application/zip');
    res.sendFile(zipPath);
  } else {
    res.status(404).send('Zip file not found');
  }
});

// Download endpoint
app.get('/api/download/:fileName', (req, res) => {
  const fileName = path.basename(req.params.fileName);
  const filePath = path.join(JAVA_DIR, fileName);

  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'text/x-java-source');
    res.sendFile(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

// Execute real Java Client-Server communication
app.post('/api/run-java', async (req, res) => {
  const { num1 = 15, num2 = 27, implementation = 'binary' } = req.body;
  const n1 = parseInt(num1, 10);
  const n2 = parseInt(num2, 10);

  if (isNaN(n1) || isNaN(n2)) {
    return res.status(400).json({ error: 'Both arguments must be valid integers' });
  }

  const port = await getAvailablePort(5300 + Math.floor(Math.random() * 500));

  let serverClass = 'AdditionServer';
  let clientClass = 'AdditionClient';

  if (implementation === 'text') {
    serverClass = 'TextAdditionServer';
    clientClass = 'TextAdditionClient';
  } else if (implementation === 'multithreaded') {
    serverClass = 'MultiThreadedServer';
    clientClass = 'AdditionClient';
  }

  // Compile classes if not compiled
  try {
    execSync(`javac -cp "${JAVA_DIR}" "${JAVA_DIR}/${serverClass}.java" "${JAVA_DIR}/${clientClass}.java"`);
  } catch (compileErr: any) {
    return res.status(500).json({
      error: 'Compilation failed: ' + compileErr.message,
    });
  }

  const serverLogs: Array<{ type: 'stdout' | 'stderr'; message: string; timestamp: number }> = [];
  const clientLogs: Array<{ type: 'stdout' | 'stderr'; message: string; timestamp: number }> = [];

  const startTime = Date.now();

  // Launch Server process
  const serverProcess = spawn('java', ['-cp', JAVA_DIR, serverClass, String(port), '--once']);

  serverProcess.stdout.on('data', (data) => {
    const text = data.toString();
    text.split('\n').filter(Boolean).forEach((line: string) => {
      serverLogs.push({ type: 'stdout', message: line, timestamp: Date.now() });
    });
  });

  serverProcess.stderr.on('data', (data) => {
    const text = data.toString();
    text.split('\n').filter(Boolean).forEach((line: string) => {
      serverLogs.push({ type: 'stderr', message: line, timestamp: Date.now() });
    });
  });

  // Wait 300ms for server to bind port and start listening
  await new Promise((r) => setTimeout(r, 300));

  // Launch Client process
  const clientProcess = spawn('java', ['-cp', JAVA_DIR, clientClass, String(n1), String(n2), 'localhost', String(port)]);

  clientProcess.stdout.on('data', (data) => {
    const text = data.toString();
    text.split('\n').filter(Boolean).forEach((line: string) => {
      clientLogs.push({ type: 'stdout', message: line, timestamp: Date.now() });
    });
  });

  clientProcess.stderr.on('data', (data) => {
    const text = data.toString();
    text.split('\n').filter(Boolean).forEach((line: string) => {
      clientLogs.push({ type: 'stderr', message: line, timestamp: Date.now() });
    });
  });

  // Await client completion or timeout after 5 seconds
  const clientExitPromise = new Promise<{ code: number | null }>((resolve) => {
    clientProcess.on('close', (code) => resolve({ code }));
  });

  const timeoutPromise = new Promise<{ code: number | null }>((resolve) => {
    setTimeout(() => {
      try {
        clientProcess.kill();
        serverProcess.kill();
      } catch (_) {}
      resolve({ code: -1 });
    }, 6000);
  });

  const result = await Promise.race([clientExitPromise, timeoutPromise]);
  const durationMs = Date.now() - startTime;

  // Make sure server process is terminated if still running
  setTimeout(() => {
    try {
      serverProcess.kill();
    } catch (_) {}
  }, 500);

  const calculatedSum = n1 + n2;

  res.json({
    success: result.code === 0,
    exitCode: result.code,
    num1: n1,
    num2: n2,
    sum: calculatedSum,
    port,
    implementation,
    durationMs,
    serverLogs,
    clientLogs,
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HTTP Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
