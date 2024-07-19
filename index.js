const express = require("express");
const PORT = process.env.PORT || 3000;
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { verifyToken } = require("./middleware/auth.middleware");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");

dotenv.config(); // Load config

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors:
    process.env.NODE_ENV === "production"
      ? {} // No CORS needed in production as client is served from same origin
      : {
          origin: "http://localhost:5173",
          methods: ["GET", "POST"],
        },
});

app.set("io", io);

async function main() {
  try {
    await connectDB();

    //Middleware - run this for every request
    app.use(express.json());
    app.use(
      cors({
        origin: "http://localhost:5173",
      })
    );

    const notesRoutes = require("./routers/note.route");
    const usersRoutes = require("./routers/user.route");
    const authRoutes = require("./routers/auth.route");

    app.use("/api/auth", authRoutes);
    app.use("/api/notes", verifyToken, notesRoutes);
    app.use("/api/users", verifyToken, usersRoutes);

    if (process.env.NODE_ENV === "production") {
      // Serve static files from the React app
      app.use(express.static(path.join(__dirname, "client/build")));

      // The "catchall" handler: for any request that doesn't
      // match one above, send back React's index.html file.
      app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "client/build", "index.html"));
      });
    } else {
      app.use(express.static("public"));
      // Catch-all route
      app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "public", "index.html"));
      });
    }

    io.on("connection", (socket) => {
      console.log("New client connected");

      socket.on("join_note", (noteId) => {
        socket.join(noteId);
      });

      socket.on("leave_note", (noteId) => {
        socket.leave(noteId);
      });

      socket.on("note_updated", (noteId, updatedNote) => {
        socket.to(noteId).emit("note_updated", updatedNote);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });

    server.listen(PORT, () => console.log(`app running on port ${PORT}`));

    process.on("SIGTERM", () => {
      console.log("SIGTERM signal received: closing HTTP server");
      server.close(() => {
        console.log("HTTP server closed");
      });
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
}

main();
