const express = require("express");
const postRoute = express.Router();
const { createPostCtrl, fetchPostsCtrl,fetchPostCtrl, updatePostCtrl, deletePostCtrl, toggleAddLikeToPostCtrl, toggleAddDislikeToPostCtrl } = require("../../controllers/posts/postCtrl");
const authMiddleware = require("../../middlewares/auth/authMiddleware");
const { photoUpload,postImageResize } = require("../../middlewares/uploads/photoUpload");

postRoute.post(
  "/",
  authMiddleware,
  photoUpload.single("image"),
  postImageResize,
  createPostCtrl
);
postRoute.put('/likes', authMiddleware, toggleAddLikeToPostCtrl);
postRoute.put('/dislikes', authMiddleware, toggleAddDislikeToPostCtrl);
postRoute.get("/", fetchPostsCtrl);
postRoute.get("/:id",fetchPostCtrl);
postRoute.put("/:id",authMiddleware, updatePostCtrl);
postRoute.delete("/:id",authMiddleware, deletePostCtrl);

module.exports = postRoute;
