const { default: mongoose } = require("mongoose");
const Note = require("../models/note.model");
const User = require("../models/user.model");

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
  const newNote = new Note({
    ...note,
    user,
  });
  if (!mongoose.Types.ObjectId.isValid(user)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }
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
    console.log(id);
    const { _id, title, description, body, todoList, isPinned, user } =
      req.body;
    note = await Note.findByIdAndUpdate(
      id,
      { title, description, body, todoList, isPinned, user },
      { new: true, runValidators: true }
    );
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
    res.status(200).json({ notes: user.notes });
  } catch (error) {
    console.error("Error fetching user notes:", error);
    res.status(500).json({ message: "Server error while fetching user notes" });
  }
}

module.exports = {
  getNoteById,
  deleteNote,
  createNote,
  editNote,
  getUserNotes,
};
