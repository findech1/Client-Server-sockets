export interface JavaFile {
  fileName: string;
  title: string;
  description: string;
  content: string;
  role: 'server' | 'client';
  protocol: 'binary' | 'text' | 'multithreaded';
}

export interface ExecutionLog {
  type: 'stdout' | 'stderr';
  message: string;
  timestamp: number;
}

export interface ExecutionResult {
  success: boolean;
  exitCode: number | null;
  num1: number;
  num2: number;
  sum: number;
  port: number;
  implementation: 'binary' | 'text' | 'multithreaded';
  durationMs: number;
  serverLogs: ExecutionLog[];
  clientLogs: ExecutionLog[];
}

export interface SimulationStep {
  step: number;
  title: string;
  actor: 'server' | 'client' | 'network';
  description: string;
  serverState: string;
  clientState: string;
  packetInfo?: {
    type: 'SYN' | 'SYN-ACK' | 'ACK' | 'DATA_INTS' | 'DATA_SUM' | 'FIN' | 'FIN-ACK';
    payload: string;
    bytesHex: string[];
    direction: 'client-to-server' | 'server-to-client';
  };
  highlightedServerCode?: string;
  highlightedClientCode?: string;
}
