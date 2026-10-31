import { JavaFile } from '../types';

export const JAVA_FILES: JavaFile[] = [
  {
    fileName: 'AdditionServer.java',
    title: 'AdditionServer.java (Binary TCP)',
    description: 'Listens on port 5000, accepts incoming TCP client, reads two 32-bit integers via DataInputStream.readInt(), adds them, and replies with the sum via DataOutputStream.writeInt().',
    role: 'server',
    protocol: 'binary',
    content: `import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;

/**
 * AdditionServer
 * 
 * A TCP Server strictly utilizing Java Sockets (java.net.ServerSocket and java.net.Socket).
 * Accepts connections from clients, reads two 32-bit integers via DataInputStream,
 * calculates their sum, and replies with the sum via DataOutputStream.
 */
public class AdditionServer {
    public static final int DEFAULT_PORT = 5000;

    public static void main(String[] args) {
        int port = args.length > 0 ? Integer.parseInt(args[0]) : DEFAULT_PORT;

        System.out.println("==================================================");
        System.out.println("    JAVA SOCKET ADDITION SERVER (TCP PORT " + port + ")");
        System.out.println("==================================================");

        // 1. Create ServerSocket bound to the specified port
        try (ServerSocket serverSocket = new ServerSocket(port)) {
            System.out.println("[SERVER] ServerSocket bound to port " + port);
            System.out.println("[SERVER] Socket state: LISTEN. Awaiting incoming connections...");

            while (true) {
                // 2. serverSocket.accept() blocks until a client connects
                System.out.println("[SERVER] Waiting for client connection...");
                try (Socket clientSocket = serverSocket.accept()) {
                    String clientAddress = clientSocket.getRemoteSocketAddress().toString();
                    System.out.println("[SERVER] Connection accepted from: " + clientAddress);

                    // 3. Open DataInputStream and DataOutputStream on the socket streams
                    try (
                        DataInputStream in = new DataInputStream(clientSocket.getInputStream());
                        DataOutputStream out = new DataOutputStream(clientSocket.getOutputStream())
                    ) {
                        System.out.println("[SERVER] Streams open. Reading integers from client...");

                        // 4. Read two 32-bit signed integers (Big-Endian network order)
                        int num1 = in.readInt();
                        System.out.println("[SERVER] Received first integer:  " + num1);

                        int num2 = in.readInt();
                        System.out.println("[SERVER] Received second integer: " + num2);

                        // 5. Compute the sum
                        int sum = num1 + num2;
                        System.out.println("[SERVER] Calculated sum: " + num1 + " + " + num2 + " = " + sum);

                        // 6. Write the 4-byte sum back to the client
                        out.writeInt(sum);
                        out.flush(); // Ensure bytes are pushed out to the wire immediately
                        System.out.println("[SERVER] Sent sum (" + sum + ") back to client.");
                    } catch (IOException e) {
                        System.err.println("[SERVER-ERR] Error communicating with client: " + e.getMessage());
                    }
                    System.out.println("[SERVER] Client socket closed: " + clientAddress);
                } catch (IOException e) {
                    System.err.println("[SERVER-ERR] Error accepting client connection: " + e.getMessage());
                }
            }
        } catch (IOException e) {
            System.err.println("[SERVER-ERR] Server socket failure on port " + port + ": " + e.getMessage());
        }
    }
}`
  },
  {
    fileName: 'AdditionClient.java',
    title: 'AdditionClient.java (Binary TCP)',
    description: 'Establishes a TCP socket to AdditionServer, transmits two 32-bit integers via DataOutputStream.writeInt(), flushes the stream, and reads the returned sum via DataInputStream.readInt().',
    role: 'client',
    protocol: 'binary',
    content: `import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.net.Socket;
import java.net.UnknownHostException;
import java.util.Scanner;

/**
 * AdditionClient
 * 
 * A TCP Client strictly utilizing Java Sockets (java.net.Socket).
 * Connects to AdditionServer, transmits two 32-bit integers via DataOutputStream,
 * and receives the calculated sum via DataInputStream.
 */
public class AdditionClient {
    public static final String DEFAULT_HOST = "localhost";
    public static final int DEFAULT_PORT = 5000;

    public static void main(String[] args) {
        String host = DEFAULT_HOST;
        int port = DEFAULT_PORT;
        int num1 = 0;
        int num2 = 0;

        System.out.println("==================================================");
        System.out.println("         JAVA SOCKET ADDITION CLIENT");
        System.out.println("==================================================");

        // Parse CLI arguments if provided, otherwise prompt user interactively
        if (args.length >= 2) {
            try {
                num1 = Integer.parseInt(args[0]);
                num2 = Integer.parseInt(args[1]);
                if (args.length >= 3) host = args[2];
                if (args.length >= 4) port = Integer.parseInt(args[3]);
            } catch (NumberFormatException e) {
                System.err.println("[CLIENT-ERR] Invalid numbers provided in CLI.");
                return;
            }
        } else {
            Scanner scanner = new Scanner(System.in);
            System.out.print("Enter first integer: ");
            num1 = scanner.nextInt();
            System.out.print("Enter second integer: ");
            num2 = scanner.nextInt();
        }

        System.out.println("[CLIENT] Target Server: " + host + ":" + port);
        System.out.println("[CLIENT] Connecting via TCP socket...");

        // Connect to server using try-with-resources
        long startTime = System.currentTimeMillis();
        try (
            Socket socket = new Socket(host, port);
            DataOutputStream out = new DataOutputStream(socket.getOutputStream());
            DataInputStream in = new DataInputStream(socket.getInputStream())
        ) {
            System.out.println("[CLIENT] Connected! Socket local port: " + socket.getLocalPort());

            // 1. Send the first integer (4 bytes)
            System.out.println("[CLIENT] Transmitting integer 1: " + num1);
            out.writeInt(num1);

            // 2. Send the second integer (4 bytes)
            System.out.println("[CLIENT] Transmitting integer 2: " + num2);
            out.writeInt(num2);

            // 3. Flush the stream buffer to push data across the wire
            out.flush();
            System.out.println("[CLIENT] Data flushed. Awaiting reply from server...");

            // 4. Read the 4-byte sum replied by server
            int sum = in.readInt();
            long rtt = System.currentTimeMillis() - startTime;

            System.out.println("\n--------------------------------------------------");
            System.out.println("              SERVER RESPONSE RECEIVED             ");
            System.out.println("--------------------------------------------------");
            System.out.println("  Integer 1:      " + num1);
            System.out.println("  Integer 2:      " + num2);
            System.out.println("  Calculated Sum: " + sum);
            System.out.println("  Round-Trip Time:" + rtt + " ms");
            System.out.println("--------------------------------------------------");

            // 5. Verification
            if (sum == (num1 + num2)) {
                System.out.println("[CLIENT] Verification PASS: " + num1 + " + " + num2 + " == " + sum);
            }
        } catch (UnknownHostException e) {
            System.err.println("[CLIENT-ERR] Server host unresolved: " + host);
        } catch (IOException e) {
            System.err.println("[CLIENT-ERR] Network I/O failure: " + e.getMessage());
        }
        System.out.println("[CLIENT] Socket closed.");
    }
}`
  },
  {
    fileName: 'TextAdditionServer.java',
    title: 'TextAdditionServer.java (Text Line Stream)',
    description: 'Alternative approach using BufferedReader.readLine() and PrintWriter.println() for character-delimited communication.',
    role: 'server',
    protocol: 'text',
    content: `import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;

/**
 * TextAdditionServer
 * 
 * An alternative implementation using text line stream protocol
 * (BufferedReader and PrintWriter) over Java Sockets.
 */
public class TextAdditionServer {
    public static final int DEFAULT_PORT = 5001;

    public static void main(String[] args) {
        int port = args.length > 0 ? Integer.parseInt(args[0]) : DEFAULT_PORT;
        System.out.println("[TEXT-SERVER] Starting on port " + port);

        try (ServerSocket serverSocket = new ServerSocket(port)) {
            System.out.println("[TEXT-SERVER] Listening on port " + port + "...");

            while (true) {
                try (
                    Socket clientSocket = serverSocket.accept();
                    BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
                    PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true) // autoFlush = true
                ) {
                    System.out.println("[TEXT-SERVER] Connected: " + clientSocket.getRemoteSocketAddress());

                    // Read text lines containing integer strings
                    String line1 = in.readLine();
                    String line2 = in.readLine();

                    if (line1 != null && line2 != null) {
                        int num1 = Integer.parseInt(line1.trim());
                        int num2 = Integer.parseInt(line2.trim());
                        int sum = num1 + num2;

                        System.out.println("[TEXT-SERVER] Read: " + num1 + " & " + num2 + " -> Sum: " + sum);

                        // Reply with sum as newline-terminated text string
                        out.println(sum);
                    }
                } catch (Exception e) {
                    System.err.println("[TEXT-SERVER] Request error: " + e.getMessage());
                }
            }
        } catch (IOException e) {
            System.err.println("[TEXT-SERVER] Server error: " + e.getMessage());
        }
    }
}`
  },
  {
    fileName: 'TextAdditionClient.java',
    title: 'TextAdditionClient.java (Text Line Stream)',
    description: 'Client sending integers as string text lines with PrintWriter.println() and receiving sum with BufferedReader.readLine().',
    role: 'client',
    protocol: 'text',
    content: `import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

/**
 * TextAdditionClient
 * 
 * Client using text streams over Java Sockets.
 */
public class TextAdditionClient {
    public static final String DEFAULT_HOST = "localhost";
    public static final int DEFAULT_PORT = 5001;

    public static void main(String[] args) {
        String host = DEFAULT_HOST;
        int port = DEFAULT_PORT;
        int num1 = 15;
        int num2 = 30;

        if (args.length >= 2) {
            num1 = Integer.parseInt(args[0]);
            num2 = Integer.parseInt(args[1]);
            if (args.length >= 3) host = args[2];
            if (args.length >= 4) port = Integer.parseInt(args[3]);
        }

        try (
            Socket socket = new Socket(host, port);
            PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
            BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))
        ) {
            System.out.println("[TEXT-CLIENT] Connected to " + host + ":" + port);

            // Send integers formatted as text lines
            out.println(num1);
            out.println(num2);

            // Read the sum
            String response = in.readLine();
            System.out.println("[TEXT-CLIENT] Server replied sum: " + response);
        } catch (IOException e) {
            System.err.println("[TEXT-CLIENT] Error: " + e.getMessage());
        }
    }
}`
  },
  {
    fileName: 'MultiThreadedServer.java',
    title: 'MultiThreadedServer.java (Concurrent Thread Pool)',
    description: 'Production-pattern concurrent TCP server using ExecutorService thread pool to handle multiple concurrent clients simultaneously.',
    role: 'server',
    protocol: 'multithreaded',
    content: `import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * MultiThreadedServer
 * 
 * Concurrent Java Socket Server handling multiple concurrent clients
 * using a thread pool (ExecutorService).
 */
public class MultiThreadedServer {
    public static final int DEFAULT_PORT = 5002;
    private static final int THREAD_POOL_SIZE = 10;

    public static void main(String[] args) {
        int port = args.length > 0 ? Integer.parseInt(args[0]) : DEFAULT_PORT;
        ExecutorService threadPool = Executors.newFixedThreadPool(THREAD_POOL_SIZE);

        System.out.println("[THREADED-SERVER] Starting with " + THREAD_POOL_SIZE + " worker threads on port " + port);

        try (ServerSocket serverSocket = new ServerSocket(port)) {
            System.out.println("[THREADED-SERVER] Listening for incoming client connections...");

            while (true) {
                // Main thread blocks on accept()
                Socket clientSocket = serverSocket.accept();
                System.out.println("[THREADED-SERVER] Dispatched client " + clientSocket.getRemoteSocketAddress() + " to worker pool");

                // Immediately hand off connection to worker thread
                threadPool.execute(new ClientHandler(clientSocket));
            }
        } catch (IOException e) {
            System.err.println("[THREADED-SERVER] Server failure: " + e.getMessage());
        } finally {
            threadPool.shutdown();
        }
    }

    private static class ClientHandler implements Runnable {
        private final Socket socket;

        public ClientHandler(Socket socket) {
            this.socket = socket;
        }

        @Override
        public void run() {
            String clientInfo = socket.getRemoteSocketAddress().toString();
            try (
                socket;
                DataInputStream in = new DataInputStream(socket.getInputStream());
                DataOutputStream out = new DataOutputStream(socket.getOutputStream())
            ) {
                int a = in.readInt();
                int b = in.readInt();
                int sum = a + b;
                System.out.println("[WORKER-" + Thread.currentThread().getName() + "] Handled " + clientInfo + ": " + a + " + " + b + " = " + sum);
                out.writeInt(sum);
                out.flush();
            } catch (IOException e) {
                System.err.println("[WORKER-" + Thread.currentThread().getName() + "] I/O error with " + clientInfo + ": " + e.getMessage());
            }
        }
    }
}`
  }
];

export const SOCKET_ANNOTATIONS: Array<{
  keyword: string;
  category: 'core' | 'stream' | 'network' | 'best_practice';
  title: string;
  summary: string;
  detail: string;
}> = [
  {
    keyword: 'ServerSocket',
    category: 'core',
    title: 'java.net.ServerSocket',
    summary: 'Waits for incoming client requests over the TCP network.',
    detail: 'Under the hood, ServerSocket invokes the OS socket(), bind(), and listen() system calls. It does not transfer application payload directly; instead, it listens on a designated TCP port and spawns a connected Socket instance upon client connection.'
  },
  {
    keyword: 'serverSocket.accept()',
    category: 'core',
    title: 'Blocking accept() Call',
    summary: 'Blocks the calling thread until a client TCP handshake arrives.',
    detail: 'When accept() unblocks, the TCP 3-way handshake (SYN, SYN-ACK, ACK) has successfully completed. The method returns a new java.net.Socket object dedicated to bidirectional communication with that specific client.'
  },
  {
    keyword: 'Socket(host, port)',
    category: 'core',
    title: 'java.net.Socket Client Constructor',
    summary: 'Initiates a TCP connection to the destination host and port.',
    detail: 'Invokes the OS connect() system call, automatically selecting an ephemeral source port on the client machine and executing the TCP 3-way handshake with the server.'
  },
  {
    keyword: 'DataInputStream / readInt()',
    category: 'stream',
    title: 'Binary Stream: DataInputStream.readInt()',
    summary: 'Reads four input bytes and returns a signed 32-bit integer.',
    detail: 'Reads bytes in Network Byte Order (Big-Endian): (b1 << 24) + (b2 << 16) + (b3 << 8) + (b4 << 0). Blocks until all 4 bytes are available on the socket or end-of-stream is reached.'
  },
  {
    keyword: 'DataOutputStream / writeInt()',
    category: 'stream',
    title: 'Binary Stream: DataOutputStream.writeInt()',
    summary: 'Writes a signed 32-bit integer as four consecutive bytes.',
    detail: 'Pushes the high-order byte first followed by lower-order bytes (Big-Endian network order). This provides strict type safety and zero string-parsing overhead compared to text representations.'
  },
  {
    keyword: 'out.flush()',
    category: 'best_practice',
    title: 'OutputStream.flush() Necessity',
    summary: 'Forces buffered output bytes to be delivered immediately over TCP.',
    detail: 'Java output streams often buffer outgoing data. Without explicit flush(), bytes may remain in memory buffers waiting for more data, causing the client or server to hang indefinitely waiting for input.'
  },
  {
    keyword: 'try-with-resources',
    category: 'best_practice',
    title: 'Auto-Closing Sockets (try-with-resources)',
    summary: 'Guarantees close() is called even if exceptions are thrown.',
    detail: 'Both ServerSocket and Socket implement java.lang.AutoCloseable. Using try-with-resources ensures TCP FIN packets are transmitted and file descriptors are returned to the operating system, preventing port lockup.'
  }
];
