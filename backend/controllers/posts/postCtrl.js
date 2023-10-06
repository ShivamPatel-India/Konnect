const expressAsyncHandler = require("express-async-handler");
const Post = require("../../models/post/Post");
const validateMongodbId = require("../../utils/validateMongodbID");
const Filter = require("bad-words");
const User = require("../../models/user/User");
const fs = require("fs");
const cloudinaryUploadImg = require("../../utils/cloudinary");
const blockUser = require("../../utils/blockUser");
//------------------------------------------------------------------------------
//create post
//------------------------------------------------------------------------------
const createPostCtrl = expressAsyncHandler(async (req, res) => {
  const { _id } = req.user;
  //check if user is blocked
  blockUser(req?.user);
  // validateMongodbId(req.body.user);

  //check for bad words
  const filter = new Filter();
  const isProfane = filter.isProfane(req.body.title, req.body.description);
  //block user
  if (isProfane) {
    const user = await User.findByIdAndUpdate(_id, {
      isBlocked: true,
    });
    throw new Error(
      "Creation failed because post contain profane words and your account is blocked"
    );
  }

  //Prevet user f his account is a starter account
  if (
    req?.user?.accountType === "Starter Account" &&
    req?.user?.postCount >= 2
  ) {
    throw new Error(
      "Starter account can create only two posts. Get more followers."
    );
  }

  // get apath to the image
  const localPath = `public/images/posts/${req.file.filename}`;

  //upload to cloudinary
  const imageUploaded = await cloudinaryUploadImg(localPath);

  try {
    const post = await Post.create({
      ...req.body,
      image: imageUploaded?.url,
      user: _id,
    });
    //update postCount
    await User.findByIdAndUpdate(
      _id,
      {
        $inc: { postCount: 1 },
      },
      { new: true }
    );
    //remove uploaded images
    fs.unlinkSync(localPath);
    res.json(post);
  } catch (err) {
    res.json(err);
  }
});

//------------------------------------------------------------------------------
//fetch all post
//------------------------------------------------------------------------------
const fetchPostsCtrl = expressAsyncHandler(async (req, res) => {
  const hasCategory = req.query.category;
  try {
    //check if category exists
    if (hasCategory) {
      const posts = await Post.find({ category: hasCategory })
        .populate("user")
        .populate("comments")
        .sort("-createdAt");
      res.json(posts);
    } else {
      const posts = await Post.find({})
        .populate("user")
        .populate("comments")
        .sort("-createdAt");
      res.json(posts);
    }
  } catch (err) {
    res.json(err);
  }
});

//------------------------------------------------------------------------------
//fetch a post
//------------------------------------------------------------------------------
const fetchPostCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const post = await Post.findById(id)
      .populate("user")
      .populate("disLikes")
      .populate("likes")
      .populate("comments");

    //update number of views
    await Post.findByIdAndUpdate(
      id,
      {
        $inc: { numViews: 1 },
      },
      { new: true }
    );
    res.json(post);
  } catch (err) {
    res.json(err);
  }
});

//------------------------------------------------------------------------------
//update post
//------------------------------------------------------------------------------
const updatePostCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);

  try {
    const post = await Post.findByIdAndUpdate(
      id,
      {
        ...req.body,
        user: req.user?.id,
      },
      { new: true }
    );

    res.json(post);
  } catch (err) {
    res.json(err);
  }
});

//------------------------------------------------------------------------------
//update post
//------------------------------------------------------------------------------
const deletePostCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);

  try {
    const post = await Post.findOneAndDelete(id);
    res.json(post);
  } catch (err) {
    res.json(err);
  }
});

//------------------------------------------------------------------------------
//likes
//------------------------------------------------------------------------------
const toggleAddLikeToPostCtrl = expressAsyncHandler(async (req, res) => {
  //1.Find the post to be liked
  const { postId } = req.body;
  const post = await Post.findById(postId);
  //2. Find the login user
  const loginUserId = req?.user?._id;
  //3. Find is this user has liked this post?
  const isLiked = post?.isLiked;
  //4.Chech if this user has dislikes this post
  const alreadyDisliked = post?.disLikes?.find(
    (userId) => userId?.toString() === loginUserId?.toString()
  );
  //5.remove the user from dislikes array if exists
  if (alreadyDisliked) {
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { disLikes: loginUserId },
        isDisLiked: false,
      },
      { new: true }
    );
    res.json(post);
  }
  //Toggle
  //Remove the user if he has liked the post
  if (isLiked) {
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      { new: true }
    );
    res.json(post);
  } else {
    //add to likes
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { likes: loginUserId },
        isLiked: true,
      },
      { new: true }
    );
    res.json(post);
  }
});

//------------------------------------------------------------------------------
//dislikes
//------------------------------------------------------------------------------

const toggleAddDislikeToPostCtrl = expressAsyncHandler(async (req, res) => {
  //1.Find the post to be disLiked
  const { postId } = req.body;
  const post = await Post.findById(postId);
  //2.Find the login user
  const loginUserId = req?.user?._id;
  //3.Check if this user has already disLikes
  const isDisLiked = post?.isDisLiked;
  //4. Check if already like this post
  const alreadyLiked = post?.likes?.find(
    (userId) => userId.toString() === loginUserId?.toString()
  );
  //Remove this user from likes array if it exists
  if (alreadyLiked) {
    const post = await Post.findOneAndUpdate(
      postId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      { new: true }
    );
    res.json(post);
  }
  //Toggling
  //Remove this user from dislikes if already disliked
  if (isDisLiked) {
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { disLikes: loginUserId },
        isDisLiked: false,
      },
      { new: true }
    );
    res.json(post);
  } else {
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { disLikes: loginUserId },
        isDisLiked: true,
      },
      { new: true }
    );
    res.json(post);
  }
});

module.exports = {
  toggleAddDislikeToPostCtrl,
  toggleAddLikeToPostCtrl,
  deletePostCtrl,
  updatePostCtrl,
  fetchPostCtrl,
  fetchPostsCtrl,
  createPostCtrl,
};
