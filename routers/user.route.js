const express = require("express");
const router = express.Router();

const { getUserDetails } = require("../controllers/user.controller");
const { authorizeOwnerDetails } = require("../middleware/auth.middleware");

router.get("/:userId", authorizeOwnerDetails, getUserDetails);

module.exports = router;
