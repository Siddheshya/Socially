const feedController = require("../controllers/feed");
const isAuth = require("../middleware/auth")
const { body } = require("express-validator/check");
const express = require("express");
const router = express.Router();
router.get("/posts",isAuth ,feedController.getPosts);
router.post(
  "/post",
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],isAuth,
  feedController.createPosts
);
router.get("/posts/:postId",isAuth, feedController.getPost)
router.put("/posts/:postId",isAuth,
[
  body("title").trim().isLength({ min: 5 }),
  body("content").trim().isLength({ min: 5 }),
],feedController.updatePost)
router.delete('/posts/:postId',isAuth,feedController.deletePost)
module.exports = router;
