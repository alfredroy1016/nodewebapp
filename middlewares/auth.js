const User = require("../models/userSchema");

const userAuth = async (req, res, next) => {
    try {
        if (!req.session.user) {
            console.log('no usser')
            return res.redirect("/login");
        }

        const user = await User.findById(req.session.user);
        if (user && !user.isBlocked) {
            console.log("user",user)
            return next();
        } else {
            
            return res.redirect("/login");
        }
    } catch (error) {
        console.log("Error in user auth middleware:", error);
        return res.status(500).send("Internal server error");
    }
};

const adminAuth = async (req, res, next) => {
    try {
        if (!req.session.admin) {
            return res.redirect("/admin/login");
        }

        const admin = await User.findOne({ _id: req.session.admin, isAdmin: true });

        if (admin && !admin.isBlocked) {
            return next();
        } else {
            return res.redirect("/admin/login");
        }
    } catch (error) {
        console.log("Error in admin auth middleware:", error);
        return res.status(500).send("Internal server error");
    }
};

module.exports = { userAuth, adminAuth };
