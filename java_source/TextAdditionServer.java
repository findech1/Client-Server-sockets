import java.io.BufferedReader;
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
        boolean singleRun = args.length > 1 && "--once".equals(args[1]);

        System.out.println("[TEXT-SERVER] Starting on port " + port);

        try (ServerSocket serverSocket = new ServerSocket(port)) {
            System.out.println("[TEXT-SERVER] Listening on port " + port + "...");

            do {
                try (
                    Socket clientSocket = serverSocket.accept();
                    BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
                    PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true) // autoFlush = true
                ) {
                    System.out.println("[TEXT-SERVER] Connected: " + clientSocket.getRemoteSocketAddress());

                    // Read lines containing the integers
                    String line1 = in.readLine();
                    String line2 = in.readLine();

                    if (line1 != null && line2 != null) {
                        int num1 = Integer.parseInt(line1.trim());
                        int num2 = Integer.parseInt(line2.trim());
                        int sum = num1 + num2;

                        System.out.println("[TEXT-SERVER] Received: " + num1 + " and " + num2 + " -> Sum: " + sum);

                        // Send sum as text line
                        out.println(sum);
                    }
                } catch (Exception e) {
                    System.err.println("[TEXT-SERVER] Request error: " + e.getMessage());
                }
            } while (!singleRun);
        } catch (IOException e) {
            System.err.println("[TEXT-SERVER] Server error: " + e.getMessage());
        }
    }
}
