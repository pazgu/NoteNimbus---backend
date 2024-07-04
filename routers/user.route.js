const express = require("express");
const router = express.Router();

const { getUserDetails } = require("../controllers/user.controller");
const { authorizeNoteOwner } = require("../middleware/auth.middleware");

router.get("/:userId", authorizeNoteOwner, getUserDetails);

module.exports = router;
