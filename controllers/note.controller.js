const { default: mongoose } = require("mongoose");
const Note = require("../models/note.model");
const User = require("../models/user.model");
const { cloudinary } = require("../config/upload");

async function getNoteById(req, res) {
  let note = null;
  try {
    const { id } = req.params;
    note = await Note.findById(id).exec();
    res.status(200).json(note);
  } catch (error) {
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(500).json({ message: error.message });
  }
}

async function deleteNote(req, res) {
  let product = null;
  try {
    const { id } = req.params;
    product = await Note.findByIdAndDelete(id).exec();
    res.status(200).json({ message: "Note was deleted" });
  } catch (error) {
    if (!product) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(500).json({ message: error.message });
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
    const user = await User.findById(userId).populate("notes");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.notes.length === 0) {
      return res.status(404).json({ message: "User has no notes" });
    }
    res.status(200).json({ notes: user.notes });
  } catch (error) {
    console.error("Error fetching user notes:", error);
    res.status(500).json({ message: "Server error while fetching user notes" });
  }
}

async function toggleIsPinned(req, res) {
  const { id } = req.params;
  const { userId } = req;
  const { isPinned } = req.body;

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
  const { id, userId } = req.params;
  const { email } = req.body;
  try {
    let note = await Note.findById(id);
    if (note.collaborators.includes(email)) {
      return res.status(400).json({ message: "Collaborator already invited" });
    }
    note.collaborators.push(email);
    await note.save();
    res
      .status(200)
      .json({ message: "Collaborator invited successfully", note });
  } catch (error) {
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
