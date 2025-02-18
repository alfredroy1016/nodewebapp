const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin/adminController");
const categoryController = require("../controllers/admin/categoryController");
const customerController = require("../controllers/admin/customerController");
const productController = require("../controllers/admin/productController");
const { getBrands, addBrand, toggleBrandStatus, deleteBrand } = require('../controllers/admin/brandController');
const { adminAuth } = require("../middlewares/auth");
const upload = require('../middlewares/upload'); // Multer for image uploads

// 🔹 Admin Authentication
router.get("/login", adminController.loadLogin);
router.post("/login", adminController.login);
router.get("/dashboard", adminAuth, adminController.loadDashboard);
router.get("/logout", adminController.logout);

// 🔹 User Management
router.get("/users", adminAuth, customerController.customerInfo);
router.get("/blockCustomer/:id", adminAuth, customerController.customerBlocked);
router.get("/unblockCustomer/:id", adminAuth, customerController.customerUnblocked);

// 🔹 Category Management
router.get("/category", adminAuth, categoryController.categoryInfo);
router.post("/addCategory", adminAuth, categoryController.addCategory);
router.post("/toggleCategoryStatus", categoryController.toggleCategoryStatus);
router.post("/updateCategory/:id", categoryController.updateCategory);

// 🔹 Brand Management
router.get('/brands', getBrands);
router.post('/brands/add', upload.single('brandImage'), addBrand);
router.get('/brands/toggle-status/:id', toggleBrandStatus);
router.delete('/brands/delete/:id', deleteBrand);

// 🔹 Product Management
router.get("/products", adminAuth, productController.getProducts);
router.get("/addProduct", adminAuth, productController.getProductAddPage);
router.post("/addProduct", upload.single("productImage"), productController.addProduct);
router.post("/edit-product/:id", upload.single("productImage"), productController.updateProduct);
router.post("/delete-product/:id", productController.deleteProduct);
router.get('/add-offer/:productId/:offerPrice',productController.addOffer);
router.get('/remove-offer/:productId', productController.removeOffer);



module.exports = router;
