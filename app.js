const express = require('express');
const app = express();
const env = require('dotenv').config();
const db = require("./config/db");
const path = require('path');
const session = require("express-session");
const flash = require('connect-flash');
const passport = require('passport');


const userRouter = require("./routes/userRoutes");
db();


// Middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET, // Secure secret for signing session cookies
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',  // Secure cookies only in production
        httpOnly: true,  // Prevents client-side JS from accessing the cookie
        maxAge: 72 * 60 * 60 * 1000,  // 3 days in milliseconds
        sameSite: 'strict'  // Prevents cross-site cookie sending
    }
}));
app.use(passport.initialize());

// // Flash middleware
app.use(flash());

// EJS setup
app.set('view engine', 'ejs');
app.set('views', [path.join(__dirname, 'views/user'), path.join(__dirname, 'views/admin')]);

// Static file serving
app.use('/public', express.static('public'));
app.use(express.static('public'));
// Routes
app.use("/", userRouter);

// 404 error handling
app.use((req, res, next) => {
  res.status(404).render('pageNotFound'); // Make sure pageNotFound.ejs exists
});

// Start server
app.listen(process.env.PORT, () => {
  console.log(`Server Running on port  http://localhost:${process.env.PORT}`);
}); 
