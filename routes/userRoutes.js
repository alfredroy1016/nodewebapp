const express = require('express');
const router = express.Router();
const userController = require("../controllers/user/userController");
const passport = require('passport');
const {userAuth} =require("../middlewares/auth")

const isAuthenticated = (req, res, next) => {

    // If user is authenticated with Passport, proceed
    if (req.isAuthenticated()) {
        return next();
    }
    
    // If Passport is not used, you can fallback to checking session data
    req.flash('error', 'Please log in to access this page');
    res.redirect('/login');
};

// Public routes
router.get("/", userController.loadHomePage);
router.get("/signup", userController.loadSignup);
router.post("/signup", userController.signup);
router.get("/login", (req, res) => {
    if (req.isAuthenticated() || req.session.userId) {
        return res.redirect('/');
    }
    res.render('login', { 
        error: req.flash('error'),
        success: req.flash('success')
    });
});
router.post("/login", userController.login);
router.get("/verify-otp", userController.loadVerifyOtp);
router.post("/verify-otp", userController.verifyOtp);
// Protected routes
router.get("/shop", userController.loadShopping);
router.get("/logout",  userController.logout);
// Google Auth routes
router.get('/auth/google',
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        prompt: 'select_account'
    })
);
router.get('/auth/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/login',
        failureFlash: true 
    }),
    (req, res) => {
        req.session.userId = req.user._id;
        req.flash('success', 'Successfully logged in with Google!');
        console.log('User ID:', req.user._id);

        // Call the controller method to handle loading the home page
        userController.loadHomePage(req, res);
    }
);

router.get("/forgot-password", userController.loadForgotPassword);
router.post("/forgot-password", userController.forgotPassword);
router.get("/reset-password/:email", userController.loadResetPassword);
router.post("/reset-password", userController.resetPassword);
router.get("/resend-otp", userController.resendOtp);




module.exports = router;