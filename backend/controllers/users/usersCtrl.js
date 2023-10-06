const expressAsyncHandler = require("express-async-handler");
const crypto = require("crypto");
const generateToken = require("../../config/token/generateToken");
const User = require("../../models/user/User");
const validateMongodbId = require("../../utils/validateMongodbID");
const sgMail = require("@sendgrid/mail");
const cloudinaryUploadImg = require("../../utils/cloudinary");
const fs = require("fs");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const blockUser = require("../../utils/blockUser");
//_______________________________
//register user
//_______________________________
const userRegisterCtrl = expressAsyncHandler(async (req, res) => {
  //check if user exist
  const userExists = await User.findOne({ email: req?.body?.email });
  if (userExists) throw new Error("User already exists");

  try {
    const user = await User.create({
      firstName: req?.body?.firstName,
      lastName: req?.body?.lastName,
      email: req?.body?.email,
      password: req?.body?.password,
    });
    res.json(user);
  } catch (err) {
    res.json(err);
  }
});

//_______________________________
//login user
//_______________________________
const loginUserCtrl = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  //check if user exists
  const userFound = await User.findOne({ email });
  //check if blocked
  if (userFound?.isBlocked)
    throw new Error("Access Denied You have been blocked");
  //Check if password is match
  if (userFound && (await userFound.isPasswordMatched(password))) {
    res.json({
      _id: userFound?._id,
      firstName: userFound?.firstName,
      lastName: userFound?.lastName,
      email: userFound?.email,
      profilePhoto: userFound?.profilePhoto,
      isAdmin: userFound?.isAdmin,
      token: generateToken(userFound?._id),
      isVerified: userFound?.isAccountVerified,
    });
  } else {
    res.status(401);
    throw new Error("Invalid Login Credentials");
  }
});

//------------------------------
//Users
//-------------------------------
const fetchUsersCtrl = expressAsyncHandler(async (req, res) => {
  console.log(req.headers);
  try {
    const users = await User.find({}).populate("posts");
    res.json(users);
  } catch (error) {
    res.json(error);
  }
});

//------------------------------
//Delete user
//------------------------------
const deleteUsersCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  //check if user id is valid
  validateMongodbId(id);
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    res.json(deletedUser);
  } catch (error) {
    res.json(error);
  }
});

//----------------
//user details
//----------------
const fetchUserDetailsCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  //check if user id is valid
  validateMongodbId(id);
  try {
    const user = await User.findById(id);
    res.json(user);
  } catch (error) {
    res.json(error);
  }
});

//------------------------------
//User profile
//------------------------------
const userProfileCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  //1.Find the login user
  //2. Check this particular if the login user exists in the array of viewedBy

  //Get the login user
  const loginUserId = req?.user?._id?.toString();
  console.log(typeof loginUserId);
  try {
    const myProfile = await User.findById(id)
      .populate("posts")
      .populate("viewedBy");
    const alreadyViewed = myProfile?.viewedBy?.find((user) => {
      console.log(user);
      return user?._id?.toString() === loginUserId;
    });
    if (alreadyViewed) {
      res.json(myProfile);
    } else {
      const profile = await User.findByIdAndUpdate(myProfile?._id, {
        $push: { viewedBy: loginUserId },
      });
      res.json(profile);
    }
  } catch (error) {
    res.json(error);
  }
});

//------------------------------
//Update profile
//------------------------------
const updateUserCtrl = expressAsyncHandler(async (req, res) => {
  const { _id } = req?.user;
  blockUser(req?.user);
  validateMongodbId(_id);
  const user = await User.findByIdAndUpdate(
    _id,
    {
      firstName: req?.body?.firstName,
      lastName: req?.body?.lastName,
      email: req?.body?.email,
      bio: req?.body?.bio,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.json(user);
});

//------------------------------
//Update password
//------------------------------
const updateUserPasswordCtrl = expressAsyncHandler(async (req, res) => {
  //destructure the login user
  const { _id } = req.user;
  const { password } = req.body;
  validateMongodbId(_id);
  //Find the user by _id
  const user = await User.findById(_id);

  if (password) {
    user.password = password;
    const updatedUser = await user.save();
    res.json(updatedUser);
  } else {
    res.json(user);
  }
});

//------------------------------
//following
//------------------------------
const followingUserCtrl = expressAsyncHandler(async (req, res) => {
  const { followId } = req.body;
  const loginUserId = req.user.id;
  //find the target user and check if the loginUserId  already exist in follwers array
  const targetUser = await User.findById(followId);
  const alreadyFollowing = targetUser?.followers?.find(
    (user) => user?.toString() === loginUserId.toString()
  );
  if (alreadyFollowing) throw new Error("You are following this user");

  //find the user you want to follow and updateits followers field
  await User.findByIdAndUpdate(
    followId,
    {
      $push: { followers: loginUserId },
      isFollowing: true,
    },
    { new: true }
  );

  //update the login user following field
  await User.findByIdAndUpdate(
    loginUserId,
    {
      $push: { following: followId },
    },
    { new: true }
  );

  res.json("You have succesfully followed this user");
});

//------------------------------
//unfollow
//------------------------------
const unfollowUserCtrl = expressAsyncHandler(async (req, res) => {
  const { unFollowId } = req.body;
  const loginUserId = req.user.id;

  //find the target user and check if the loginUserId  already exist in follwers array
  await User.findByIdAndUpdate(
    unFollowId,
    {
      $pull: { followers: loginUserId },
      isFollowing: false,
    },
    { new: true }
  );

  await User.findByIdAndUpdate(
    loginUserId,
    {
      $pull: { following: unFollowId },
    },
    { new: true }
  );
  res.json("You have unfollowed this user");
});

//------------------------------
//block user
//------------------------------
const blockUserCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);

  const user = await User.findByIdAndUpdate(
    id,
    {
      isBlocked: true,
    },
    { new: true }
  );
  res.json(user);
});

//------------------------------
//unblock user
//------------------------------
const unblockUserCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);

  const user = await User.findByIdAndUpdate(
    id,
    {
      isBlocked: false,
    },
    { new: true }
  );
  res.json(user);
});

//------------------------------
//generate verification token - send token by email
//------------------------------
const generateVerificationTokenCtrl = expressAsyncHandler(async (req, res) => {
  const loginUserId = req.user.id;

  const user = await User.findById(loginUserId);
  try {
    //generate a token
    const verificationToken = await user?.createAccountVerificationToken();

    //save the user
    await user.save();

    //build your message
    // const resetURL = `If you have requested to verify your account, verify now within 10 minutes, otherwise ignore this mail. <a href="http://localhost:3000/verify-account/${verificationToken}">verification link</a>`;
    const resetURL = `If you were requested to verify your account, verify now within 10 minutes, otherwise ignore this message <a href="http://localhost:3000/verify-account/${verificationToken}">Click to verify your account</a>`;
    const msg = {
      to: user?.email,
      from: "shivampatel.sp515@gmail.com",
      subject: "MERN DevKonnect - verify your account",
      html: resetURL,
    };
    await sgMail.send(msg);
    res.json(resetURL);
  } catch (error) {
    res.json(error);
  }
});

//------------------------------
//account verification done
//------------------------------
const accountVerificationCtrl = expressAsyncHandler(async (req, res) => {
  const { token } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  //find the user by token
  const userFound = await User.findOne({
    accountVerificationToken: hashedToken,
    accountVerificationTokenExpires: { $gt: new Date() },
  });
  if (!userFound) throw new Error("Token is expired, try again later");

  //update the property to true
  userFound.isAccountVerified = true;
  userFound.accountVerificationToken = undefined;
  userFound.accountVerificationTokenExpires = undefined;
  await userFound.save();

  res.json(userFound);
});

//------------------------------
//forget password token generator
//------------------------------
const forgetPasswordToken = expressAsyncHandler(async (req, res) => {
  //find the user by email
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  //if user is found
  try {
    const token = await user.crearePasswordToken();
    await user.save();

    //build your message
    const resetURL = `If you have requested to reset your password, reset now within 10 minutes, otherwise ignore this mail <a href="http://localhost:3000/reset-password/${token}">password reset link</a>`;
    const msg = {
      to: "shivampatel.sp515@gmail.com",
      from: "shivampatel.sp515@gmail.com",
      subject: "MERN DevKonnect password reset",
      html: resetURL,
    };

    const emailMsg = await sgMail.send(msg);
    res.json({
      msg: `password reset link is succesfully sent to ${user?.email}. Reset you password within 10 minutes, ${resetURL}`,
    });
  } catch (err) {
    res.json(err);
  }
});

//------------------------------
//password reset
//------------------------------
const passwrodResetCtrl = expressAsyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashedToken = crypto.createHashed("sha256").update(token).digest("hex");

  //find this user by Token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date.now() },
  });

  if (!user) throw new Error("Password reset token is expired. Try again");

  //reset the password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
});

//------------------------------
//profile photo upload
//------------------------------
const profilePhotoUploadCtrl = expressAsyncHandler(async (req, res) => {
  //find the logged in user
  const { _id } = req.user;

  //check if usre is blocked
  blockUser(req?.user);

  // get apath to the image
  const localPath = `public/images/profile/${req.file.filename}`;

  //upload to cloudinary
  const imageUploaded = await cloudinaryUploadImg(localPath);

  const foundUser = await User.findByIdAndUpdate(
    _id,
    {
      profilePhoto: imageUploaded?.url,
    },
    { new: true }
  );

  //remove the saved images from folder
  fs.unlinkSync(localPath);
  res.json(imageUploaded);
});

module.exports = {
  userRegisterCtrl,
  loginUserCtrl,
  fetchUsersCtrl,
  deleteUsersCtrl,
  fetchUserDetailsCtrl,
  userProfileCtrl,
  updateUserCtrl,
  updateUserPasswordCtrl,
  followingUserCtrl,
  unfollowUserCtrl,
  blockUserCtrl,
  unblockUserCtrl,
  generateVerificationTokenCtrl,
  accountVerificationCtrl,
  forgetPasswordToken,
  passwrodResetCtrl,
  profilePhotoUploadCtrl,
};
