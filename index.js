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
const Note = require("./models/note.model");

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
  const authRoutes = require("./routers/auth.route");

  app.use("/api/auth", authRoutes);
  app.use("/api/notes", verifyToken, notesRoutes);
  app.use("/api/users", verifyToken, usersRoutes);
  app.get("/api/home", async (req, res) => {
    try {
      const someDummyNotes = await Note.find({}).limit(6); //first 6 are dummies and not belong to any users
      res.status(200).json(someDummyNotes);
    } catch (error) {
      console.error("Error occurred while generating notes:", error);
      res
        .status(500)
        .json({ message: "An error occurred while generating notes" });
    }
  });

  app.listen(PORT, () => console.log(`app runing on port ${PORT}`));
}

main();
