const express = require("express");
const serverless = require("serverless-http");
const app = require("../../app");

// Error handling for serverless environment
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

// Handle serverless function
const handler = serverless(app);

module.exports.handler = async (event, context) => {
  // Make context available to routes
  context.callbackWaitsForEmptyEventLoop = false;
  return await handler(event, context);
};
