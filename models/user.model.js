const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    notes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Note", default: [] }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
