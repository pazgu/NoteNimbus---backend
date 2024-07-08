const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { verifyToken } = require("./middleware/auth.middleware");

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
  app.use(express.static("public"));

  const notesRoutes = require("./routers/note.route");
  const usersRoutes = require("./routers/user.route");
  const authRoutes = require("./routers/auth.route");

  app.use("/api/auth", authRoutes);
  app.use("/api/notes", verifyToken, notesRoutes);
  app.use("/api/users", verifyToken, usersRoutes);

  // const upload = require("./uploadMiddleware");

  // router.post("/upload", upload.single("image"), async (req, res) => {
  //   try {
  //     const imageUrl = req.file.path; // Path to uploaded file
  //     // Save imageUrl to the note or use it as needed
  //     res.json({ imageUrl: imageUrl });
  //   } catch (error) {
  //     console.error("Error uploading file:", error);
  //     res.status(500).json({ error: "Server error" });
  //   }
  // });

  app.listen(PORT, () => console.log(`app runing on port ${PORT}`));
}

main();
