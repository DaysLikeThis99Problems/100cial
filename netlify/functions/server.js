const express = require("express");
const serverless = require("serverless-http");
const app = require("../../app");

// Handle serverless function
module.exports.handler = serverless(app);
