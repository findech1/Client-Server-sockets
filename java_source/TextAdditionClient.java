import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import java.util.Scanner;

/**
 * TextAdditionClient
 * 
 * An alternative implementation using text line stream protocol
 * (BufferedReader and PrintWriter) over Java Sockets.
 */
public class TextAdditionClient {
    public static final String DEFAULT_HOST = "localhost";
    public static final int DEFAULT_PORT = 5001;

    public static void main(String[] args) {
        String host = DEFAULT_HOST;
        int port = DEFAULT_PORT;
        int num1 = 12;
        int num2 = 34;

        if (args.length >= 2) {
            num1 = Integer.parseInt(args[0]);
            num2 = Integer.parseInt(args[1]);
            if (args.length >= 3) host = args[2];
            if (args.length >= 4) port = Integer.parseInt(args[3]);
        } else {
            Scanner sc = new Scanner(System.in);
            System.out.print("Enter first integer: ");
            num1 = sc.nextInt();
            System.out.print("Enter second integer: ");
            num2 = sc.nextInt();
        }

        try (
            Socket socket = new Socket(host, port);
            PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
            BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))
        ) {
            System.out.println("[TEXT-CLIENT] Connected to server: " + host + ":" + port);

            // Send integers formatted as text lines
            out.println(num1);
            out.println(num2);

            // Read the sum
            String response = in.readLine();
            System.out.println("[TEXT-CLIENT] Response sum received: " + response);
        } catch (IOException e) {
            System.err.println("[TEXT-CLIENT] Error: " + e.getMessage());
        }
    }
}
