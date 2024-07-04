const express = require("express");

const {
  getUserNotes,
  getNoteById,
  createNote,
  deleteNote,
  editNote,
} = require("../controllers/note.controller");
const { authorizeNoteOwner } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/myNotes", authorizeNoteOwner, getUserNotes);
router.post("/create", createNote);
router.put("/:id", authorizeNoteOwner, editNote);
router.get("/:id", authorizeNoteOwner, getNoteById);
router.delete("/:id", authorizeNoteOwner, deleteNote);

module.exports = router;
