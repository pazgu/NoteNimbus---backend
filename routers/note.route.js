const express = require("express");

const {
  getNoteById,
  deleteNote,
  createNote,
  editNote,
  getUserNotes,
  toggleIsPinned,
  deleteImage,
} = require("../controllers/note.controller");
const {
  authorizeNoteOwner,
  authorizeOwnerDetails,
} = require("../middleware/auth.middleware");

const { upload } = require("../config/upload");

const router = express.Router();

router.get("/:userId/:id", authorizeNoteOwner, getNoteById);
router.get("/:userId", authorizeOwnerDetails, getUserNotes);
router.post("/create", upload.single("image"), createNote);
router.put("/:userId/:id", authorizeNoteOwner, editNote);
router.delete("/:userId/:id", authorizeNoteOwner, deleteNote);
router.patch("/:userId/:id", authorizeNoteOwner, toggleIsPinned);
router.delete("/:id/image", authorizeNoteOwner, deleteImage);

module.exports = router;
