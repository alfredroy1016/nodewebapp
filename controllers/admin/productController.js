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
        const limit = 10; // Set the number of products per page
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
            totalPages,  // Ensure this is passed
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
        console.log(req.body)
        const { name, description, price, brand, category, quantity, color } = req.body;


        if (!name || !description || !price || !brand || !category || !quantity || !color) {
            return res.status(400).json({ error: "All fields are required" });
        }

        let imagePath = "";
        if (req.file) {
            imagePath = `/uploads/products/${req.file.filename}`;
        }

        const newProduct = new Product({
            name,
            description,
            price,
            brand,
            category,
            quantity,
            color,
            image: imagePath
        });

        await newProduct.save();
        res.redirect("/admin/products");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Update Product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, brand, category, quantity, color } = req.body;
        let updateData = { name, description, price, brand, category, quantity, color };

        if (req.file) {
            const filename = `product-${Date.now()}.jpg`;
            const outputPath = path.join(__dirname, "../public/uploads/products/", filename);
            
            // Delete the old image
            const product = await Product.findById(id);
            if (product.image) {
                const oldImagePath = path.join(__dirname, "../public", product.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            updateData.image = `/uploads/products/${filename}`;
        }

        await Product.findByIdAndUpdate(id, updateData, { new: true });
        res.redirect("/products");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Delete Product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (product.image) {
            const imagePath = path.join(__dirname, "../public", product.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Product.findByIdAndDelete(id);
        res.redirect("/products");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const addOffer = async (req, res) => {
    try {
        const { productId, offerPrice } = req.params;

        // Validate offer price
        if (!offerPrice || isNaN(offerPrice) || offerPrice <= 0) {
            return res.status(400).json({ message: 'Invalid offer price' });
        }

        // Find and update the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (offerPrice >= product.price) {
            return res.status(400).json({ message: 'Offer price must be less than sale price' });
        }

        product.offerPrice = offerPrice;
        await product.save();

        res.redirect('/admin/products'); // Redirect back to the products page
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Controller to remove an offer from a product
const removeOffer = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.offerPrice = null; // Remove the offer price
        await product.save();

        res.redirect('/admin/products');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { getProductAddPage, getProducts, addProduct, updateProduct, deleteProduct,addOffer,removeOffer };
