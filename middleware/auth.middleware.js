const jwt = require("jsonwebtoken");
const Note = require("../models/note.model");

const { JWT_SECRET } = process.env;

function verifyToken(req, res, next) {
  // Get token from header, the client should be responsible for sending the token
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ error: "Access denied" });
  // Extract the token from the header
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Verify token
    req.userId = decoded.userId; // Add userId to request object
    next(); // Call next middleware
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}

async function authorizeNoteOwner(req, res, next) {
  const { id: noteId } = req.params;
  const note = await Note.findById(noteId);
  if (!note) {
    return res.status(404).json({ message: "Note not found" });
  }

  if (note.user.toString() !== req.userId) {
    return res.status(403).json({ message: "User not authorized" });
  }

  next();
}

module.exports = { verifyToken, authorizeNoteOwner };
