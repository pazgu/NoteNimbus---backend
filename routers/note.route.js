const express = require("express");
const {
  verifyToken,
  authorizeProductOwner,
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
router.get("/:id", getNoteById);
router.post("/create", verifyToken, createNote);
router.delete("/:id", verifyToken, authorizeProductOwner, deleteNote);
router.put("/:id", verifyToken, authorizeProductOwner, editNote);

module.exports = router;
