const express = require("express");
const authController = require("../controllers/auth.controller");
const validate = require("../middleware/validate.middleware");
const {
  signupSchema,
  loginSchema,
  updateProfileSchema,
} = require("../validations/auth.validation");

const authenticate = require("../middleware/auth.middleware");

const router = express.Router();


router.post(
  "/signup",
  validate(signupSchema),
  authController.signup
);

router.post(
  "/login",
  validate(loginSchema),
  authController.login
);

router.get(
  "/profile",
  authenticate,
  authController.getProfile
);

router.patch(
  "/profile",
  authenticate,
  validate(updateProfileSchema),
  authController.updateProfile
);

module.exports = router;



