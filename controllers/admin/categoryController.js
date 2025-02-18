const Category = require("../../models/categorySchema");

// Fetch paginated categories
const categoryInfo = async (req, res) => {
    try {
        const currentPage = parseInt(req.query.page) || 1;
        const limit = 4;
        const skip = (currentPage - 1) * limit;

        const categoryData = await Category.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalCategories = await Category.countDocuments();
        const totalPages = Math.ceil(totalCategories / limit);

        res.render("category", {
            cat: categoryData,
            currentPage,
            totalPages,
            totalCategories,
        });

    } catch (error) {
        console.error("Error fetching categories:", error);
        res.redirect("/pageerror");
    }
};

// Add a new category
const addCategory = async (req, res) => {
    const { name, description } = req.body;
    try {
        if (!name || !description) {
            return res.status(400).json({ error: "Name and description are required." });
        }

        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ error: "Category already exists." });
        }

        const newCategory = new Category({ name, description });
        await newCategory.save();

        return res.status(201).json({ message: "Category added successfully!" });

    } catch (error) {
        console.error("Error adding category:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};


const addCategoryOffer = async (req, res) => {
    try {
        const { categoryId, offerPrice } = req.body;

        if (!categoryId || !offerPrice) {
            return res.status(400).json({ error: "Category ID and Offer Price are required." });
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ error: "Category not found." });
        }

        category.offerPrice = offerPrice;
        await category.save();

        res.status(200).json({ message: "Offer added successfully", category });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};


const removeCategoryOffer = async (req, res) => {
    try {
        const { categoryId } = req.body;

        if (!categoryId) {
            return res.status(400).json({ error: "Category ID is required." });
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ error: "Category not found." });
        }

        category.offerPrice = null;
        await category.save();

        res.status(200).json({ message: "Offer removed successfully", category });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const toggleCategoryStatus = async (req, res) => {
    try {
        const { categoryId, status } = req.body;
        const newStatus = status === "Listed" ? "Unlisted" : "Listed";

        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            { status: newStatus },
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.json({ success: true, message: `Category ${newStatus}`, status: newStatus });
    } catch (error) {
        console.error("Error updating category status:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


const getEditCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).render("admin/editCategory", { error: "Category not found" });
        }
        res.render("editCategory", { category });
    } catch (error) {
        console.error("Error fetching category for edit:", error);
        res.status(500).send("Internal Server Error");
    }
};

const updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        await Category.findByIdAndUpdate(req.params.id, { name, description });

        res.redirect("/admin/category"); // Redirect back to category list
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).send("Internal Server Error");
    }
};
module.exports = {
    categoryInfo,
    addCategory,
    addCategoryOffer,
    removeCategoryOffer,
    toggleCategoryStatus,
    getEditCategory,
    updateCategory
};
