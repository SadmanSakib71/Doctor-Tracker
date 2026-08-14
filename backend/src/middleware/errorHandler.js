function errorHandler(err, req, res, _next) {
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ");

    return res.status(400).json({
      success: false,
      message: message || "Validation failed",
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID",
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid request body",
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message =
    statusCode === 500 ? "Internal server error" : err.message || "Internal server error";

  if (statusCode >= 500) {
    console.error("Server error:", err.name || "Error");
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = errorHandler;
