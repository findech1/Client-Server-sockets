# Java Socket Integer Addition — VS Code Guide

This project contains a TCP Client-Server program written strictly using Java Sockets (`java.net.ServerSocket` and `java.net.Socket`).

## Project Files
- `AdditionServer.java`: TCP Server listening on port 5000 using `DataInputStream` and `DataOutputStream`.
- `AdditionClient.java`: TCP Client connecting to server, sending two integers, receiving the sum.
- `TextAdditionServer.java` & `TextAdditionClient.java`: Alternative text-line based stream implementation (`BufferedReader` / `PrintWriter`).
- `MultiThreadedServer.java`: Concurrent multi-threaded server using `ExecutorService`.
- `.vscode/launch.json`: Pre-configured VS Code Run and Debug configurations.
- `.vscode/tasks.json`: Pre-configured VS Code build and run tasks.

---

## Method 1: Using the VS Code Integrated Terminal (Recommended & Fastest)

Because a socket server must remain running while the client connects, you need **two terminal tabs** in VS Code.

### Step 1: Open Terminal in VS Code
Press `` Ctrl + ` `` (Windows/Linux) or `` Cmd + ` `` (macOS) to open the Integrated Terminal.

### Step 2: Compile the Java Files
```bash
javac AdditionServer.java AdditionClient.java
```

### Step 3: Start the Server (Terminal 1)
```bash
java AdditionServer
```
You will see:
```text
[SERVER] ServerSocket bound to port 5000
[SERVER] Waiting for client connection...
```

### Step 4: Split Terminal or Open a 2nd Terminal Tab
- Click the **Split Terminal** icon (looks like two split panes `|`) in the top-right corner of the terminal window, OR press:
  - Windows/Linux: `Ctrl + Shift + 5` (or click `+` then split)
  - macOS: `Cmd + \`

### Step 5: Start the Client (Terminal 2)
In the second terminal, run:
```bash
java AdditionClient
```
Enter your two integers when prompted:
```text
Enter first integer: 35
Enter second integer: 65
```
Or pass them directly:
```bash
java AdditionClient 35 65
```

The server calculates the addition and immediately sends back the sum!

---

## Method 2: Using VS Code's "Run and Debug" (F5)

1. Install the **Extension Pack for Java** by Microsoft from the VS Code Extensions Marketplace (`Ctrl+Shift+X` or `Cmd+Shift+X`).
2. Open the **Run and Debug** view (`Ctrl+Shift+D` or `Cmd+Shift+D`).
3. In the top dropdown, select:
   **"🚀 Run Server & Client Together"** (Compound launch)
   OR run **"Run AdditionServer (Port 5000)"** first, then run **"Run AdditionClient with Args (25, 75)"**.
4. Both processes will launch in your integrated terminal side by side.

---

## Troubleshooting in VS Code
- **`java.net.BindException: Address already in use: 5000`**:
  An old instance of the server is still running in another terminal. Either:
  1. Go to the terminal running the server and press `Ctrl + C` to stop it.
  2. Or run on a custom port: `java AdditionServer 5005` and `java AdditionClient 20 30 localhost 5005`.
