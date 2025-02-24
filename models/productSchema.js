const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    regularPrice: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    color: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
    image: { type: String, required: false }, // Image path (optional)
    offerPrice: Number, // Add offer price field
    quantity: Number,
    status: { type: String, enum: ['Active', 'Blocked'], default: 'Active' }
});

module.exports = mongoose.model("Product", productSchema);
