const express = require("express");
const router = express.Router();

// Controllers
const { register, login } = require("../controllers/auth");
const {
  getUsers,
  editUser,
  deleteUser,
  getFollowers,
  getFollowing,
} = require("../controllers/user");
const {
  addFeed,
  getFeedByFollow,
  getFeeds,
  like,
  getComments,
  addComment,
} = require("../controllers/feed");

// Middlewares
const { auth } = require("../middlewares/auth");
const { uploadFile } = require("../middlewares/uploadFile");

// Routes
router.post("/register", register);
router.post("/login", login);

router.get("/users", getUsers);
router.patch("/user/:id", auth, editUser);
router.delete("/user/:id", deleteUser);
router.get("/followers/:id", getFollowers);
router.get("/following/:id", getFollowing);

router.post("/feed", auth, uploadFile("image"), addFeed);
router.get("/feed/:id", auth, getFeedByFollow);
router.get("/feeds", getFeeds);
router.post("/like", auth, like);
router.get("/comments/:id", auth, getComments);
router.post("/comment", auth, addComment);

module.exports = router;
