const User = require("../../models/userSchema");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const pageerror=async(req,res)=>{
    res.render("admin-error")
}
const loadLogin = (req, res) => {
    if (req.session.admin) {
        return res.redirect("/admin/dashboard");
    }
    res.render("admin-login", { message: null });
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Input validation
        if (!email || !password) {
            return res.render("admin-login", { 
                message: "Email and password are required" 
            });
        }

        const admin = await User.findOne({ email, isAdmin: true });
        
        if (!admin) {
            return res.render("admin-login", { 
                message: "Invalid credentials" 
            });
        }

        const passwordMatch = await bcrypt.compare(password, admin.password);
        
        if (passwordMatch) {
            req.session.admin = admin._id; // Store admin ID instead of boolean
            req.session.adminEmail = admin.email;
            return res.redirect("/admin/dashboard");
        } else {
            return res.render("admin-login", { 
                message: "Invalid credentials" 
            });
        }

    } catch (error) {
        console.error("Login error:", error);
        return res.render("admin-login", { 
            message: "An error occurred during login" 
        });
    }
};

const loadDashboard = async (req, res) => {
    try {
        if (!req.session.admin) {
            return res.redirect("/admin/login");
        }

        const admin = await User.findById(req.session.admin);
        if (!admin || !admin.isAdmin) {
            req.session.destroy();
            return res.redirect("/admin/login");
        }

        res.render("dashboard", { admin });

    } catch (error) {
        console.error("Dashboard error:", error);
        res.render("error", { 
            message: "An error occurred while loading the dashboard" 
        });
    }
};

const logout= async (req,res)=>{
    try{
        req.session.destroy(err=>{
            if(err){
                console.log("error destroying session",err)
                return res.redirect("/pageerror")
            }
            res.redirect("/admin/login")
        })
    }catch(error){
        console.log("unexpected error during logut",error);
        res.redirect("/pageerror")

    }
}





module.exports = {
    loadLogin,
    login,
    loadDashboard,
    pageerror,
    logout
};