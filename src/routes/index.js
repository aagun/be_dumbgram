const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/auth");
const {
  getUsers,
  editUser,
  deleteUser,
  getFollowers,
  getFollowing,
} = require("../controllers/user");
const { auth } = require("../middlewares/auth");

// Routes
router.post("/register", register);
router.post("/login", login);

router.get("/users", getUsers);
router.patch("/user/:id", auth, editUser);
router.delete("/user/:id", deleteUser);
router.get("/followers/:id", getFollowers);
router.get("/following/:id", getFollowing);

module.exports = router;
