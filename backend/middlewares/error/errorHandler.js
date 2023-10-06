//not found error handler 
const notFound = (req,res,next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
}

//error handler
const errorHandler = (err, req, res, next) => {
  const stausCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(stausCode);
  res.json({
    message: err?.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = { errorHandler, notFound };
