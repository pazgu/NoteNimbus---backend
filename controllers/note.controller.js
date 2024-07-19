const { default: mongoose } = require("mongoose");
const Note = require("../models/note.model");
const User = require("../models/user.model");
const { cloudinary } = require("../config/upload");

async function getNoteById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const note = await Note.findById(id).populate("collaborators").exec();
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    // Check if the user is the owner or a collaborator
    if (
      note.user.toString() !== userId &&
      !note.collaborators.includes(user.email)
    ) {
      return res
        .status(403)
        .json({ message: "You don't have permission to view this note" });
    }
    res.status(200).json(note);
  } catch (error) {
    console.error("Error fetching note by id:", error);
    res.status(500).json({ message: "Server error while fetching note" });
  }
}

async function deleteNote(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is the owner or a collaborator
    if (
      note.user.toString() !== userId &&
      !note.collaborators.includes(user.email)
    ) {
      return res.status(403).json({
        message: "You don't have permission to delete this note",
      });
    }

    // If the user is a collaborator, remove them from the collaborators list
    if (note.collaborators.includes(user.email)) {
      note.collaborators = note.collaborators.filter(
        (email) => email !== user.email
      );
      await note.save();

      // Emit a Socket.IO event to update other users
      req.app.get("io").to(id).emit("note_updated", note);

      return res
        .status(200)
        .json({ message: "Removed from shared note successfully" });
    }

    // If the user is the owner, delete the note
    await Note.findByIdAndDelete(id);

    // Remove the note reference from the user's notes array
    await User.findByIdAndUpdate(userId, {
      $pull: { notes: id },
    });

    // Emit a Socket.IO event to notify collaborators
    req.app.get("io").to(id).emit("note_deleted", id);

    res.status(200).json({ message: "Note was deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ message: "Server error while deleting note" });
  }
}

async function createNote(req, res) {
  const { user, ...note } = req.body;

  if (!mongoose.Types.ObjectId.isValid(user)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  let imageUrl = "";

  // Handle image upload
  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
    } catch (error) {
      console.log("Error uploading image to Cloudinary", error);
      return res
        .status(500)
        .json({ message: "Server error while uploading image" });
    }
  }

  const newNote = new Note({
    ...note,
    user,
    imageUrl,
  });

  try {
    const savedNote = await newNote.save();
    // Update the user's notes array
    await User.findByIdAndUpdate(
      user,
      { $push: { notes: savedNote._id } },
      { new: true, useFindAndModify: false }
    );
    res.status(201).json({ message: "Note created successfully", savedNote });
  } catch (error) {
    console.log(
      "note.controller, createNote. Error while creating note",
      error
    );
    if (error.name === "ValidationError") {
      console.log(`note.controller, createNote. ${error.message}`);
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Server error while creating note" });
    }
  }
}

async function editNote(req, res) {
  let note = null;
  try {
    const { id } = req.params;
    const updatedNote = req.body;
    note = await Note.findByIdAndUpdate(id, updatedNote, {
      new: true,
      runValidators: true,
    });
    // Emit Socket.IO event for real-time update
    req.app.get("io").to(id).emit("note_updated", note);
    res.status(200).json({ message: "Note was updated" });
  } catch (error) {
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(500).json({ message: error.message });
  }
}

async function getUserNotes(req, res) {
  try {
    const userId = req.userId;
    const userNotes = await Note.find({ user: userId });
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find notes where the user is a collaborator
    const sharedNotes = await Note.find({ collaborators: user.email });

    const allNotes = [...userNotes, ...sharedNotes];

    if (allNotes.length === 0) {
      return res.status(404).json({ message: "No notes found" });
    }

    res.status(200).json({ notes: allNotes });
  } catch (error) {
    console.error("Error fetching user notes:", error);
    res.status(500).json({ message: "Server error while fetching user notes" });
  }
}

async function toggleIsPinned(req, res) {
  const { id } = req.params;
  const { userId } = req;
  const { isPinned } = req.body;

  console.log("userId:", userId);
  console.log("id:", id);

  try {
    const note = await Note.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: { isPinned } },
      { new: true }
    );

    console.log("Updated note:", note); // Log the updated note to check if it's null

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json(note);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

async function deleteImage(req, res) {
  const { id } = req.params;
  try {
    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    note.imageUrl = null;
    await note.save();

    res.status(200).json({ message: "Image deleted successfully", note });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ error: "Server error" });
  }
}

const inviteCollaborator = async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  const userId = req.userId;
  try {
    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    // Check if the user is the owner of the note
    if (note.user.toString() !== userId) {
      return res.status(403).json({
        message:
          "You do not have permission to invite collaborators to this note",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is already a collaborator
    if (note.collaborators.includes(email)) {
      return res.status(400).json({
        message: "This user is already a collaborator on this note",
        collaborators: note.collaborators,
      });
    }

    // If not already a collaborator, add them
    note.collaborators.push(email);
    await note.save();
    res.status(200).json({
      message: "Collaborator invited successfully",
      collaborators: note.collaborators,
    });
  } catch (error) {
    console.error("Error inviting collaborator:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  getNoteById,
  deleteNote,
  createNote,
  editNote,
  getUserNotes,
  toggleIsPinned,
  deleteImage,
  inviteCollaborator,
};
