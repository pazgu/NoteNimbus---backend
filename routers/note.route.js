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
router.post("/create", upload.single("image"), createNote); //middleware used for handling single image upload
router.put("/:userId/:id", authorizeNoteOwner, editNote);
router.delete("/:id/image", authorizeNoteOwner, deleteImage);
router.delete("/:userId/:id", authorizeNoteOwner, deleteNote);
router.patch("/:userId/:id", authorizeNoteOwner, toggleIsPinned);

module.exports = router;
