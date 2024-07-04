const express = require("express");
const {
  verifyToken,
  authorizeProductOwner,
  authorizeNoteOwner,
} = require("../middleware/auth.middleware");

const {
  getUserNotes,
  getNoteById,
  createNote,
  deleteNote,
  editNote,
  getDummyNotes,
} = require("../controllers/note.controller");

const router = express.Router();

router.get("/", getDummyNotes);
router.get("/myNotes", verifyToken, getUserNotes);
router.get("/:id", verifyToken, getNoteById);
router.post("/create", verifyToken, createNote);
router.delete("/:id", verifyToken, authorizeNoteOwner, deleteNote);
router.put("/:id", verifyToken, authorizeNoteOwner, editNote);

module.exports = router;
