const express = require("express");
const authController = require("../controllers/auth.controller");
const validate = require("../middleware/validate.middleware");
const { signupSchema } = require("../validations/auth.validation");

const router = express.Router();



console.log("Validate:", validate);
console.log("Type:", typeof validate);

router.post(
  "/signup",
  validate(signupSchema),
  authController.signup
);

module.exports = router;



