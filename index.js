const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const {
  verifyToken,
  authorizeNoteOwner,
} = require("./middleware/auth.middleware");

dotenv.config(); // Load config

async function main() {
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
  // auth routes
  const authRoutes = require("./routers/auth.route");
  // const protectedRoutes = require("./routers/protected.route");

  app.use("/api/auth", authRoutes);
  // app.use("/api/protected", verifyToken, protectedRoutes);

  app.use("/api/notes", verifyToken, notesRoutes);
  app.use("/api/users", verifyToken, authorizeNoteOwner, usersRoutes);
  app.get("/api/home", async (req, res) => {
    try {
      const someDummyNotes = await Note.find({}).limit(5); //first 5 are dummies and not belong to any users
      res.status(200).json(someDummyNotes);
    } catch (error) {
      console.error("Error occurred while filtering notes:", error);
      res
        .status(500)
        .json({ message: "An error occurred while filtering notes" });
    }
  });

  app.listen(PORT, () => console.log(`app runing on port ${PORT}`));
}

main();
