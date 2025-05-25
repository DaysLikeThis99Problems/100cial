require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const passport = require("passport");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const session = require("express-session");
const User = require("./models/User");
const passportConfig = require("./config/passport");
const postRoutes = require("./routes/postRoutes");
const errorHandler = require("./middlewares/errorHandler");
const commentRoutes = require("./routes/commentRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const path = require("path");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected..."))
  .catch((err) => console.log("Database connection failed:", err));

//middlewares: passing form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

//session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URL,
      touchAfter: 24 * 3600,
      crypto: {
        secret: process.env.SESSION_SECRET || "keyboard cat",
      },
      autoRemove: "native",
      ttl: 14 * 24 * 60 * 60,
      mongoOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 14,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
    },
  })
);

// Method override middleware
app.use(methodOverride("_method"));

//passport
passportConfig(passport);
app.use(passport.initialize());
app.use(passport.session());

//EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Home route
app.get("/", (req, res) => {
  res.render("home", {
    user: req.user,
    error: "",
    title: "Home",
  });
});

//routes
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/", commentRoutes);
app.use("/user", userRoutes);

//error handler
app.use(errorHandler);

// Export the app instead of starting the server
module.exports = app;
