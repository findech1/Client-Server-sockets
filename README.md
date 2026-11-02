# Java Client–Server Sockets Playground

An interactive learning project for exploring TCP client–server communication with Java sockets. It combines a React/Vite web interface with an Express/Node.js server that compiles and runs the Java examples locally.

## Features

- Run real Java client/server exchanges over localhost TCP from the web app.
- Choose between binary integer streams, text-line streams, and a multithreaded server.
- Step through an animated TCP communication flow and inspect integer bytes in hexadecimal.
- View the Java source files and guides for the architecture, terminal, and VS Code.
- Try preset input values, including negative numbers and 32-bit boundary cases.

## Requirements

- Node.js and npm (use a version compatible with Vite 8).
- A Java Development Kit (JDK), with both `java` and `javac` available on your `PATH`.
- A free local HTTP port (default: `3000`) and local TCP ports for the Java examples.

Check that Java is available with `java -version` and `javac -version`.

## Run the web app

From the project root, install the npm dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser. Keep the terminal running while you use the app. The interactive studio compiles the selected Java source and launches its server and client when you run an example. The app also runs one binary example with the default values on initial load.

Stop the development server with **Ctrl+C** in its terminal.

> Run npm commands from the project root, not from `src/` or `java_source/`.

## Run Java examples directly

To run the binary socket example without the web app, use two terminals. In both, change to `java_source/` first.

**Terminal 1 — compile and start the server:**

```bash
javac AdditionServer.java AdditionClient.java
java AdditionServer
```

**Terminal 2 — start the client:**

```bash
java AdditionClient 35 65
```

The client prints the server's reply. If no numbers are provided, it prompts for them. The binary server listens on port `5000` by default and continues accepting clients until stopped with **Ctrl+C**. You can pass a different port to the server and specify the host and port for the client, for example `java AdditionServer 5005` and `java AdditionClient 35 65 localhost 5005`.

### Other Java implementations

- **Text-line protocol:** `TextAdditionServer` and `TextAdditionClient` use newline-delimited numbers; their default port is `5001`.
- **Multithreaded server:** `MultiThreadedServer` uses a fixed thread pool and listens on port `5002` by default. It uses the binary protocol, so connect with `AdditionClient` and pass the server port, for example `java AdditionClient 35 65 localhost 5002`.

Compile each implementation before starting it. For example:

```bash
javac TextAdditionServer.java TextAdditionClient.java
```

or:

```bash
javac MultiThreadedServer.java AdditionClient.java
```

Run the matching server and client in separate terminals. Stop long-running servers with **Ctrl+C**.

For the detailed VS Code walkthrough, see [java_source/README.md](java_source/README.md).

## Project scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Express server with Vite development middleware. |
| `npm run build` | Create the production frontend build in `dist/`. |
| `npm run preview` | Preview the production frontend with Vite. |
| `npm run lint` | Run TypeScript checks (`tsc --noEmit`). |
| `npm start` | Start the app server (same script as `npm run dev`). |

## Project structure

```text
.
├── java_source/             # Java TCP clients and servers
├── public/                  # Static assets
├── src/
│   ├── components/           # React interface and learning guides
│   ├── data/                 # Java source content for the UI
│   ├── App.tsx               # Main application and interactive tabs
│   └── main.tsx              # React entry point
├── index.html
├── server.ts                 # Express API and Vite development/production hosting
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Troubleshooting

- **`tsx: not found`:** Run `npm install` from the project root, then run `npm run dev` there.
- **Java or compiler not found:** Install a JDK and ensure `java` and `javac` are on `PATH`; restart the terminal after changing environment settings.
- **Port already in use:** Stop the other process using the port, or configure a different HTTP port with the `PORT` environment variable. The standalone binary Java server also accepts a port argument.
- **Java client cannot connect:** Start the matching server first, confirm that both programs use the same host and port, and check that local firewall settings allow loopback connections.
