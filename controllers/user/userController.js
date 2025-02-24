const User = require("../../models/userSchema");
const env = require("dotenv").config();
const nodemailer = require("nodemailer");
const bcrypt = require('bcrypt');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Constants
const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes
const SALT_ROUNDS = 10;
const OTP_LENGTH = 6; // Length of the numeric OTP

// Generate numeric OTP
function generateOtp() {
    let otp = '';
    for (let i = 0; i < OTP_LENGTH; i++) {
        // Generate a random digit (0-9)
        otp += Math.floor(Math.random() * 10);
    }
    console.log("otp",otp)
    return otp;
}

// Send Verification Email
async function sendVerificationEmail(email, otp) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: "Verify Your Account",
            html: `
                <h2>Account Verification</h2>
                <p>Your verification code is: <strong>${otp}</strong></p>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this verification, please ignore this email.</p>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        return info.accepted.length > 0;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
}

// Load Home Page
const loadHomePage = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        console.log(user)
        return res.render("home",{user:user||null});
    } catch (error) {
        console.error("Error loading home page:", error);
        return res.status(500).render("error", { message: "Internal server error" });
    }
};

// Load Signup Page
const loadSignup = async (req, res) => {
    try {
        res.render("signup", { errors: [] });
    } catch (error) {
        console.error("Error loading signup page:", error);
        res.status(500).render("error", { message: "Internal server error" });
    }
};

// Load Shopping Page
const loadShopping = async (req, res) => {
    try {
       
        res.render("shop");
    } catch (error) {
        console.error("Error loading shopping page:", error);
        res.status(500).render("error", { message: "Internal server error" });
    }
};

// Signup Function
const signup = async (req, res) => {
    try {
    
        const { name, email, phone, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.render("signup", { 
                errors: [{ msg: "Passwords do not match" }],
                oldInput: req.body
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render("signup", { 
                errors: [{ msg: "Email already registered" }],
                oldInput: req.body
            });
        }

        const otp = generateOtp();
        const emailSent = await sendVerificationEmail(email, otp);

        if (!emailSent) {
            return res.render("signup", { 
                errors: [{ msg: "Failed to send verification email" }],
                oldInput: req.body
            });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        req.session.signupData = {
            name,
            email,
            phone,
            hashedPassword,
            otp,
            otpExpiry: Date.now() + OTP_EXPIRY_TIME
        };
        res.status(200).json({ 
            message: `verify otp now ${req.session.signupData.email}   `
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).render("error", { message: "Error during signup" });
    }
};

// Verify OTP
const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        const signupData = req.session.signupData;

        if (!signupData || !signupData.otp || Date.now() > signupData.otpExpiry) {
            return res.render("verify-otp", { 
                error: "OTP expired. Please try again",
                email: signupData?.email
            });
        }

        if (otp !== signupData.otp) {
            return res.render("verify-otp", { 
                error: "Invalid OTP",
                email: signupData.email
            });
        }

        const newUser = new User({
            name: signupData.name,
            email: signupData.email,
            phone: signupData.phone,
            password: signupData.hashedPassword,
            isVerified: true
        });

        await newUser.save();
        delete req.session.signupData;
        req.session.userId = newUser._id;
        res.redirect('/shop');
    } catch (error) {
        console.error("OTP verification error:", error);
        res.status(500).render("error", { message: "Error during verification" });
    }
};

// Login Function
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find the user by email
        const user = await User.findOne({ email });
        // console.log('user',user)
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }
        if (user.isBlocked) {
            return res.status(400).json({ message: 'User is blocked' });
        }


        // Store user information in session
        req.session.user = {
            id: user._id,
            name: user.name, // Assuming the user model has a 'name' field
            email: user.email,
            phone: user.phone // Optional, if you want to store phone as well
        };
     
        // Redirect to the shop page after successful login
        res.render('home',{user}); // Change this to the correct route for the shop page
    } catch (error) {
        console.error("Login e+rror:", error);
        res.status(500).json({ message: 'Error during login' });
    }
};

// Logout Function
const logout = async (req, res) => {
    try {
        req.session.destroy();
        console.log("logout successfully")
        res.redirect('/');
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).render("error", { message: "Error during logout" });
    }
};

// Load Verify OTP Page
const loadVerifyOtp = async (req, res) => {
    try {
        const signupData = req.session.signupData;
        if (!signupData || !signupData.email) {
            return res.redirect('/signup');
        }
        res.render('verify-otp', { email: signupData.email });
    } catch (error) {
        console.error("Error loading OTP page:", error);
        res.status(500).render("error", { message: "Internal server error" });
    }
};



passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback: true
},
async function(req, accessToken, refreshToken, profile, done) {
    try {
        // Check if user already exists
        let user = await User.findOne({ email: profile.emails[0].value });
        console.log(user,'fb')
        if (user) {
            // If user exists, return user
            return done(null, user);
        } else {
            // Create new user with Google profile data
            const newUser = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                password: 'google-auth-' + Math.random().toString(36).slice(-8), // Random password for Google users
                isVerified: true, // Google users are already verified
                googleId: profile.id
            });

            await newUser.save();

            return done(null, newUser);
        }

    } catch (error) {
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});




// Load Forgot Password Page
const loadForgotPassword = async (req, res) => {
    res.render("forgot-password", { errors: [], success: "" });
};

// Forgot Password: Send OTP to Email
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.render("forgot-password", { 
                errors: [{ msg: "Email not registered" }], 
                success: "" 
            });
        }

        const otp = generateOtp();
        const emailSent = await sendVerificationEmail(email, otp);

        if (!emailSent) {
            return res.render("forgot-password", { 
                errors: [{ msg: "Failed to send verification email" }], 
                success: "" 
            });
        }

        // Store OTP in session
        req.session.passwordReset = {
            email,
            otp,
            otpExpiry: Date.now() + OTP_EXPIRY_TIME,
        };

        res.redirect(`/reset-password/${email}`);
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).render("error", { message: "Error sending OTP" });
    }
};

// Load Reset Password Page
const loadResetPassword = async (req, res) => {
    res.render("reset-password", { email: req.params.email, errors: [] });
};

// Reset Password: Verify OTP and Update Password
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;
        const resetData = req.session.passwordReset;

        if (!resetData || resetData.email !== email || Date.now() > resetData.otpExpiry) {
            return res.render("reset-password", { 
                email, 
                errors: [{ msg: "OTP expired. Request a new one." }] 
            });
        }

        if (otp !== resetData.otp) {
            return res.render("reset-password", { 
                email, 
                errors: [{ msg: "Invalid OTP" }] 
            });
        }

        if (newPassword !== confirmPassword) {
            return res.render("reset-password", { 
                email, 
                errors: [{ msg: "Passwords do not match" }] 
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await User.updateOne({ email }, { password: hashedPassword });

        delete req.session.passwordReset;
        res.redirect("/login");
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).render("error", { message: "Error resetting password" });
    }
};

// Resend OTP for Forgot Password
const resendOtp = async (req, res) => {
    try {
        const resetData = req.session.passwordReset;

        if (!resetData || !resetData.email) {
            return res.status(400).json({ 
                success: false, 
                message: "Session expired. Please try again." 
            });
        }

        const newOtp = generateOtp();
        const emailSent = await sendVerificationEmail(resetData.email, newOtp);

        if (!emailSent) {
            return res.status(500).json({ 
                success: false, 
                message: "Failed to send verification email" 
            });
        }

        req.session.passwordReset.otp = newOtp;
        req.session.passwordReset.otpExpiry = Date.now() + OTP_EXPIRY_TIME;

        res.json({ success: true, message: "OTP resent successfully" });
    } catch (error) {
        console.error("Resend OTP error:", error);
        res.status(500).json({ success: false, message: "Error resending OTP" });
    }
};

module.exports = {
    loadHomePage,
    loadSignup,
    loadShopping,
    signup,
    verifyOtp,
    login,
    logout,
    loadVerifyOtp,
    resendOtp,
    loadForgotPassword,
    forgotPassword,
    loadResetPassword,
    resetPassword
};
