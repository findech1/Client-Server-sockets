import java.io.DataInputStream;
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

        System.out.println("[THREADED-SERVER] Starting with pool of " + THREAD_POOL_SIZE + " worker threads on port " + port);

        try (ServerSocket serverSocket = new ServerSocket(port)) {
            System.out.println("[THREADED-SERVER] Listening for clients...");

            while (true) {
                Socket clientSocket = serverSocket.accept();
                System.out.println("[THREADED-SERVER] Dispatching client " + clientSocket.getRemoteSocketAddress() + " to thread pool");

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
}
