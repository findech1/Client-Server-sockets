import java.io.DataInputStream;
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
        int port = DEFAULT_PORT;
        if (args.length > 0) {
            try {
                port = Integer.parseInt(args[0]);
            } catch (NumberFormatException e) {
                System.err.println("[SERVER-ERR] Invalid port number. Using default: " + DEFAULT_PORT);
            }
        }

        System.out.println("==================================================");
        System.out.println("    JAVA SOCKET ADDITION SERVER (TCP PORT " + port + ")");
        System.out.println("==================================================");

        // Create the ServerSocket bound to the specified port
        try (ServerSocket serverSocket = new ServerSocket(port)) {
            System.out.println("[SERVER] ServerSocket initialized and bound to port " + port);
            System.out.println("[SERVER] Socket state: LISTEN. Awaiting incoming connections...");

            // Process requests
            boolean singleRun = args.length > 1 && "--once".equals(args[1]);

            do {
                // accept() blocks until a client connects
                System.out.println("[SERVER] Ready and listening for client on port " + port + "...");
                try (Socket clientSocket = serverSocket.accept()) {
                    String clientAddress = clientSocket.getRemoteSocketAddress().toString();
                    System.out.println("[SERVER] Connection accepted from: " + clientAddress);

                    // Open DataInputStream and DataOutputStream on the socket streams
                    try (
                        DataInputStream in = new DataInputStream(clientSocket.getInputStream());
                        DataOutputStream out = new DataOutputStream(clientSocket.getOutputStream())
                    ) {
                        System.out.println("[SERVER] Streams established. Waiting for integers from client...");

                        // Read the two integers sent by client
                        int num1 = in.readInt();
                        System.out.println("[SERVER] Received first integer:  " + num1);

                        int num2 = in.readInt();
                        System.out.println("[SERVER] Received second integer: " + num2);

                        // Compute the addition
                        int sum = num1 + num2;
                        long exactSum = (long) num1 + (long) num2;
                        System.out.println("[SERVER] Computing: " + num1 + " + " + num2 + " = " + sum);
                        if (exactSum != sum) {
                            System.out.println("[SERVER-WARN] Integer overflow detected! Exact: " + exactSum + ", 32-bit: " + sum);
                        }

                        // Reply with the sum to the client
                        System.out.println("[SERVER] Sending sum (" + sum + ") back to client...");
                        out.writeInt(sum);
                        out.flush(); // Flush buffer to ensure bytes are transmitted immediately

                        System.out.println("[SERVER] Successfully sent sum (" + sum + ") to " + clientAddress);
                    } catch (IOException e) {
                        System.err.println("[SERVER-ERR] Error communicating with client: " + e.getMessage());
                    }
                    System.out.println("[SERVER] Client socket closed: " + clientAddress);
                } catch (IOException e) {
                    System.err.println("[SERVER-ERR] Error accepting client connection: " + e.getMessage());
                }
            } while (!singleRun);

            System.out.println("[SERVER] Server process completed.");
        } catch (IOException e) {
            System.err.println("[SERVER-ERR] Server socket failure on port " + port + ": " + e.getMessage());
        }
    }
}
