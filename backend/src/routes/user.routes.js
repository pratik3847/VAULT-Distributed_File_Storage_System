const express = require("express");
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/search", userController.searchUsers);

module.exports = router;
