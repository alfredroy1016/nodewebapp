const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const Brand = require("../../models/Brand");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// ✅ Get Add Product Page
const getProductAddPage = async (req, res) => {
    try {
        const categories = await Category.find();
        const brands = await Brand.find();
        res.render("product-add", { categories, brands });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Get All Products
const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const searchQuery = req.query.search || '';

        const query = searchQuery
            ? { name: { $regex: searchQuery, $options: 'i' } }
            : {};

        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        const products = await Product.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('brand category');

        res.render('products', {
            products,
            totalPages,
            currentPage: page,
            searchQuery
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

// ✅ Add New Product
const addProduct = async (req, res) => {
    try {
        console.log("🔹 Add Product Request Body:", req.body);
        console.log("🔹 Uploaded Files:", req.files);

        const { name, description, regularPrice, salePrice, brand, category, quantity, color } = req.body;

        // Check required fields
        if (!name || !description || !regularPrice || !brand || !category || !quantity || !color) {
            return res.status(400).json({ error: "All required fields must be filled" });
        }

        // Handle images
        let imagePaths = req.files?.map(file => `/uploads/products/${file.filename}`) || [];

        // Create product
        const newProduct = new Product({
            name,
            description,
            regularPrice,
            salePrice: salePrice || null,
            brand,
            category,
            quantity,
            color,
            images: imagePaths,
        });

        await newProduct.save();
        console.log("✅ Product added successfully!");
        res.json({ success: true, message: "Product added successfully!" });
    } catch (error) {
        console.error("❌ Backend Error:", error);
        res.status(500).json({ error: error.message });
    }
};


// ✅ Get Edit Product Page
const getEditProductPage = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch product details
        const product = await Product.findById(id).populate('brand category');

        if (!product) {
            return res.status(404).send("Product not found");
        }

        // Fetch all brands and categories for dropdowns
        const categories = await Category.find();
        const brands = await Brand.find();

        res.render("edit-product", { product, categories, brands });
    } catch (error) {
        console.error("Error fetching edit page:", error);
        res.status(500).send("Internal Server Error");
    }
};

        

// ✅ Update Product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        let { productName, descriptionData, salePrice, quantity, brand } = req.body;

        // 🛑 Ensure brand is not empty
        if (!brand || brand.trim() === "") {
            return res.status(400).json({ error: "Brand selection is required" });
        }

        // 🛑 Ensure brand is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(brand)) {
            return res.status(400).json({ error: "Invalid Brand ID" });
        }

        const updateData = { 
            name: productName, 
            description: descriptionData, 
            price: salePrice, 
            quantity, 
            brand: new mongoose.Types.ObjectId(brand) // ✅ Convert to ObjectId
        };

        if (req.file) {
            updateData.image = `/uploads/products/${req.file.filename}`;
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.redirect("/admin/products");
    } catch (error) {
        console.error("❌ Update Error:", error);
        res.status(500).json({ error: error.message });
    }
};


// ✅ Delete Product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (product?.images?.length) {
            product.images.forEach(image => {
                const imagePath = path.join(__dirname, "../public", image);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            });
        }

        await Product.findByIdAndDelete(id);
        res.redirect("/admin/products");
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ Add Offer
const addOffer = async (req, res) => {
    try {
        const { productId } = req.params;
        const { offerPrice } = req.body;

        if (!offerPrice || isNaN(offerPrice) || offerPrice <= 0) {
            return res.status(400).json({ message: 'Invalid offer price' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (offerPrice >= product.salePrice) {
            return res.status(400).json({ message: 'Offer price must be less than the sale price' });
        }

        product.offerPrice = offerPrice;
        await product.save();

        res.redirect('/admin/products');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// ✅ Remove Offer
const removeOffer = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // ✅ Only remove offerPrice, don't change salePrice/regularPrice
        product.offerPrice = null;
        await product.save();

        res.redirect("/admin/products");
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
module.exports = { getProductAddPage, getProducts, addProduct, updateProduct, deleteProduct, addOffer, removeOffer ,getEditProductPage};
