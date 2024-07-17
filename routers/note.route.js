const express = require("express");

const {
  getNoteById,
  deleteNote,
  createNote,
  editNote,
  getUserNotes,
  toggleIsPinned,
  deleteImage,
  inviteCollaborator,
} = require("../controllers/note.controller");
const {
  authorizeNoteOwner,
  authorizeOwnerDetails,
} = require("../middleware/auth.middleware");

const { upload } = require("../config/upload");

const router = express.Router();

router.get("/:userId/:id", getNoteById);
router.get("/:userId", authorizeOwnerDetails, getUserNotes);
router.post("/create", upload.single("image"), createNote); //middleware used for handling single image upload
router.put("/:userId/:id", editNote);
router.delete("/:id/image", deleteImage);
router.delete("/:userId/:id", deleteNote);
router.patch("/:userId/:id", toggleIsPinned);
router.post("/:userId/:id/invite", authorizeNoteOwner, inviteCollaborator);

module.exports = router;
