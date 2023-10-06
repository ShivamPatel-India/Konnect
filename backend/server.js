const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const dbConnect = require("./config/db/dbConnect");
const { errorHandler, notFound } = require("./middlewares/error/errorHandler");
const app = express();
const userRoutes = require("./route/users/usersRoute");
const postRoute = require("./route/posts/postRoute");
const commentRoutes = require("./route/comments/commentRoute");
const emailMsgRoute = require("./route/emailMsg/emailMsgRoute");
const categoryRoute = require("./route/category/categoryRoute");

dbConnect();

//middleware
app.use(express.json());

//cors
app.use(cors());

//users routes
app.use("/api/users", userRoutes);

//post routes
app.use("/api/posts", postRoute);

//comment routes
app.use("/api/comments", commentRoutes);

//email msg
app.use("/api/email", emailMsgRoute);

//category route
app.use("/api/category", categoryRoute);

//error handler
app.use(notFound);
app.use(errorHandler);

//server
const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log("server is running on ", PORT));

// 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
