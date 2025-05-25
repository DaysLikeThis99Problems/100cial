const express = require("express");
const serverless = require("serverless-http");
const path = require("path");
const app = require("../../app");

// Set views directory for EJS templates
app.set("views", path.join(__dirname, "../../views"));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "../../public")));

// Error handling for serverless environment
app.use((err, req, res, next) => {
  console.error(err);
  if (req.accepts("html")) {
    res.status(err.status || 500).render("error", {
      title: "Error",
      error: err.message || "Internal Server Error",
      user: req.user,
    });
  } else {
    res.status(err.status || 500).json({
      message: err.message || "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? err : {},
    });
  }
});

// Handle serverless function
const handler = serverless(app, {
  binary: ["image/*", "font/*", "application/pdf"],
});

module.exports.handler = async (event, context) => {
  // Make context available to routes
  context.callbackWaitsForEmptyEventLoop = false;

  // Handle binary files
  const response = await handler(event, context);

  // Ensure proper content type for HTML responses
  if (
    response.headers &&
    response.headers["content-type"] &&
    response.headers["content-type"].includes("text/html")
  ) {
    response.headers["content-type"] = "text/html; charset=utf-8";
  }

  return response;
};
