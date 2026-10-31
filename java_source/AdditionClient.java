import java.io.DataInputStream;
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
                if (args.length >= 3) {
                    host = args[2];
                }
                if (args.length >= 4) {
                    port = Integer.parseInt(args[3]);
                }
                System.out.println("[CLIENT] Input received from command line:");
                System.out.println("         Integer 1: " + num1);
                System.out.println("         Integer 2: " + num2);
            } catch (NumberFormatException e) {
                System.err.println("[CLIENT-ERR] Invalid numbers provided in CLI. Switching to interactive mode.");
                promptForInputs(new Scanner(System.in));
            }
        } else {
            Scanner scanner = new Scanner(System.in);
            System.out.print("Enter first integer: ");
            while (!scanner.hasNextInt()) {
                System.out.print("Please enter a valid integer: ");
                scanner.next();
            }
            num1 = scanner.nextInt();

            System.out.print("Enter second integer: ");
            while (!scanner.hasNextInt()) {
                System.out.print("Please enter a valid integer: ");
                scanner.next();
            }
            num2 = scanner.nextInt();
        }

        System.out.println("[CLIENT] Target Server: " + host + ":" + port);
        System.out.println("[CLIENT] Initiating TCP connection to server...");

        // Connect to the server socket using try-with-resources
        long startTime = System.currentTimeMillis();
        try (
            Socket socket = new Socket(host, port);
            DataOutputStream out = new DataOutputStream(socket.getOutputStream());
            DataInputStream in = new DataInputStream(socket.getInputStream())
        ) {
            System.out.println("[CLIENT] Connected successfully to " + socket.getRemoteSocketAddress());
            System.out.println("[CLIENT] Local socket endpoint: " + socket.getLocalSocketAddress());

            // Send the two integers across the TCP stream
            System.out.println("[CLIENT] Transmitting first integer:  " + num1 + " (4 bytes)");
            out.writeInt(num1);

            System.out.println("[CLIENT] Transmitting second integer: " + num2 + " (4 bytes)");
            out.writeInt(num2);

            // Flush the output stream so bytes are pushed through TCP stack immediately
            out.flush();
            System.out.println("[CLIENT] Integers flushed to socket. Awaiting reply from server...");

            // Read the sum replied by the server
            int sum = in.readInt();
            long duration = System.currentTimeMillis() - startTime;

            System.out.println("\n--------------------------------------------------");
            System.out.println("              SERVER RESPONSE RECEIVED             ");
            System.out.println("--------------------------------------------------");
            System.out.println("  First Integer:  " + num1);
            System.out.println("  Second Integer: " + num2);
            System.out.println("  Calculated Sum: " + sum);
            System.out.println("  Round-Trip Time:" + duration + " ms");
            System.out.println("--------------------------------------------------");

            // Verification check
            if (sum == (num1 + num2)) {
                System.out.println("[CLIENT] Verification PASS: " + num1 + " + " + num2 + " == " + sum);
            } else {
                System.out.println("[CLIENT-WARN] Discrepancy observed (possible 32-bit overflow).");
            }
        } catch (UnknownHostException e) {
            System.err.println("[CLIENT-ERR] Server host could not be resolved: " + host);
        } catch (IOException e) {
            System.err.println("[CLIENT-ERR] Network I/O failure: " + e.getMessage());
            System.err.println("[CLIENT-ERR] Is AdditionServer running and listening on port " + port + "?");
        }
        System.out.println("[CLIENT] Client socket closed.");
    }

    private static void promptForInputs(Scanner scanner) {
        System.out.print("Enter first integer: ");
        int num1 = scanner.nextInt();
        System.out.print("Enter second integer: ");
        int num2 = scanner.nextInt();
    }
}
