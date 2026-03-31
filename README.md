# QuickChat (Socket.IO)

A full-stack real-time chat application built with **Node.js**, **Express**, and **Socket.IO**.

## Quick start (run now)

From the project root (`/workspace/quickchat`):

```bash
npm install
npm start
```

Then open: `http://localhost:3000`

To test real-time chat, open the URL in **two browser tabs** and send messages in each tab.

If port `3000` is already in use, run:

```bash
PORT=4000 npm start
```

Then open: `http://localhost:4000`

---

## What this project includes

- Real-time messaging across all connected clients
- Join/leave system notifications
- Typing indicator updates
- Responsive single-page UI

---

## How to implement this from scratch

If you want to rebuild this app yourself, follow these steps.

### 1) Initialize a Node project

```bash
mkdir quickchat
cd quickchat
npm init -y
npm install express socket.io
```

Create this base structure:

```text
quickchat/
  package.json
  server.js
  public/
    index.html
    app.js
    styles.css
```

### 2) Build the backend (`server.js`)

Core setup:

1. Create an Express app.
2. Create an HTTP server from Express.
3. Attach Socket.IO to that HTTP server.
4. Serve static files from `public/`.
5. Listen on `PORT`.

Real-time events to implement:

- `connection`: runs whenever a client opens a Socket.IO connection.
- `join`: save username on `socket.data.username`, send welcome event to the user, and broadcast join event to others.
- `chat_message`: receive plain text, wrap it with metadata (`id`, `username`, `timestamp`), and `io.emit(...)` to everyone.
- `typing`: forward typing status to everyone else with `socket.broadcast.emit(...)`.
- `disconnect`: broadcast that the user left.

### 3) Build the frontend HTML (`public/index.html`)

Your page should include:

- A header (app title + connection status)
- A scrollable messages container
- A typing indicator area
- A form with input + send button
- Script tags for Socket.IO client (`/socket.io/socket.io.js`) and your local app script (`app.js`)

### 4) Build client socket logic (`public/app.js`)

Implementation flow:

1. Connect with `const socket = io()`.
2. Prompt for username and emit `join` once connected.
3. On submit:
   - prevent form default
   - emit `chat_message` with text
   - clear input
4. Listen for server events:
   - `chat_message` → render chat bubble
   - `system_message` → render centered system text
   - `typing` → update typing indicator
5. Track typing:
   - emit `typing: true` on input
   - debounce and emit `typing: false` after short inactivity

### 5) Style UI (`public/styles.css`)

Recommended minimum styles:

- App shell with fixed max width/height
- Messages list using column layout + vertical scrolling
- Distinct styles for own vs. other messages
- Subtle system/typing text style
- Clear input/button states

### 6) Add scripts (`package.json`)

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  }
}
```

### 7) Run the app

```bash
npm start
```

Open `http://localhost:3000` in two browser tabs/windows to validate real-time behavior.

---

## Event contract used in this app

### Client → Server

- `join` payload: `username: string`
- `chat_message` payload: `text: string`
- `typing` payload: `isTyping: boolean`

### Server → Client

- `system_message` payload: `{ text: string }`
- `chat_message` payload:

  ```ts
  {
    id: string;
    username: string;
    text: string;
    timestamp: string; // ISO date string
  }
  ```

- `typing` payload:

  ```ts
  {
    username: string;
    isTyping: boolean;
  }
  ```

---

## Next improvements (production-ready direction)

- Add rooms/channels and room-specific events.
- Persist messages with a database (PostgreSQL, MongoDB, etc.).
- Add user authentication and identity.
- Validate/sanitize user input on both client and server.
- Add rate limiting and anti-spam protection.
- Deploy behind HTTPS and reverse proxy (Nginx/Caddy).
