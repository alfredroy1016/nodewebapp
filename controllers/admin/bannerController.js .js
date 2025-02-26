const Banner = require("../../models/BannerSchema");
// Adjust path as needed

const loadBannersPage = async (req, res) => {
    try {
        const banners = await Banner.find(); // Fetch all banners
        return res.render("banners", { banners }); // Pass banners to EJS
    } catch (error) {
        console.error("Error fetching banners:", error);
        return res.status(500).render("error", { message: "Internal server error" });
    }
};

const loadAddBannerPage = async (req, res) => {
    try {
        return res.render("addBanner"); // Ensure the correct EJS path
    } catch (error) {
        console.error("Error rendering Add Banner page:", error);
        return res.status(500).render("error", { message: "Internal Server Error" });
    }
};





const addBanner = async (req, res) => {
    try {
        // console.log("Uploaded File:", req.file); // Debugging
        // console.log("Request Body:", req.body);

        if (!req.file) {
            console.error("Multer did not process the file!");
            return res.status(400).json({ error: "Image is required" });
        }

        // ✅ Assign correct image path
        const imagePath = `uploads/banners/${req.file.filename}`;
        // console.log("Image Path:", imagePath);

        // ✅ Create banner object
        const newBanner = new Banner({
            title: req.body.title,
            description: req.body.description,
            image: imagePath, // ✅ Fix: Assign image path
            active: req.body.active !== undefined ? req.body.active : true
        });

        await newBanner.save();
      
        res.redirect("/admin/banners");
    } catch (error) {
        console.error("Error adding banner:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const deleteBanner = async (req, res) => {
    try {
        const deletedBanner = await Banner.findByIdAndDelete(req.params.id);
        
        if (!deletedBanner) {
            console.log("Banner not found in database!");
            return res.status(404).json({ message: "Banner not found" });
        }
        res.status(200).json({ message: "Banner deleted successfully" });
    } catch (error) {
        console.error("Error deleting banner:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


module.exports = { loadBannersPage,addBanner,deleteBanner,loadAddBannerPage};
