const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: "http://localhost:3006" } });

io.on("connection", async (socket) => {
  try {
    // Retrieve the last 200 messages from the FastAPI server
    const fetch = await import("node-fetch");
    const response = await fetch.default("http://localhost:8002/messages");
    const messages = await response.json();

    // Emit the messages to the connected user
    messages.forEach((message) => {
      const { username, content, created_at } = message;
      const options = {
        day: "2-digit",
        month: "short", // or 'short' for abbreviated month name
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      const formattedDate = new Date(created_at).toLocaleString(
        "en-UK",
        options
      );
      const formattedMessage = `${username} (${formattedDate}): ${content}`;
      socket.emit("chat message", {
        username: username,
        date: formattedDate,
        message: content,
      });
    });
  } catch (error) {
    console.error("Error retrieving messages:", error);
  }
  socket.on("set username", (username) => {
    socket.username = username;
  });

  socket.on("chat message", async (msg) => {
    const username = socket.username;
    const options = {
      day: "2-digit",
      month: "short", // or 'short' for abbreviated month name
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    const formattedDate = new Date().toLocaleString("en-UK", options);

    const formattedMessage = `${username} (${formattedDate}): ${msg}`;
    // io.emit("chat message", formattedMessage);
    io.emit("chat message", {
      username: username,
      date: formattedDate,
      message: msg,
    });
    content = msg;
    try {
      const fetch = await import("node-fetch");
      const response = await fetch.default("http://localhost:8002/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, content }),
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error:", error);
    }
  });
});

server.listen(3020, () => {
  console.log("listening on *:3020");
});
