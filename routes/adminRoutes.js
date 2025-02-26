const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin/adminController");
const categoryController = require("../controllers/admin/categoryController");
const customerController = require("../controllers/admin/customerController");
const productController = require("../controllers/admin/productController");
const { getBrands, addBrand, toggleBrandStatus, deleteBrand } = require('../controllers/admin/brandController');
const { adminAuth } = require("../middlewares/auth");
const { loadBannersPage } = require("../controllers/admin/bannerController.js ");
const upload = require('../middlewares/upload'); // Multer for image uploads
const bannerController = require("../controllers/admin/bannerController.js ");

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
router.get("/editCategory/:id",adminAuth,categoryController.getEditCategory)
router.post("/updateCategory/:id", categoryController.updateCategory);

// 🔹 Brand Management
router.get('/brands', getBrands);
router.post("/brands/add", upload.single("brandImage"), addBrand);
router.get('/brands/toggle-status/:id', toggleBrandStatus);
router.delete('/brands/delete/:id', deleteBrand);

// 🔹 Product Management
router.get("/products", adminAuth, productController.getProducts);
router.get("/addProduct", adminAuth, productController.getProductAddPage);
router.post("/addProduct", upload.array("productImages", 4), productController.addProduct);
router.get("/edit-product/:id", adminAuth, productController.getEditProductPage)
router.post("/update-product/:id", upload.single("productImage"), productController.updateProduct);
router.delete("/delete-product/:id", productController.deleteProduct);
router.post("/add-offer/:productId", productController.addOffer);
router.post("/remove-offer/:productId", productController.removeOffer);
router.post("/update-product-status/:productId/:action",productController.updateProductStatus);

router.get("/banners",adminAuth,bannerController.loadBannersPage);
router.get("/add-banner", adminAuth, bannerController.loadAddBannerPage);
router.post("/add-banner", upload.single("bannerImage"),bannerController.addBanner);
router.delete("/delete-banner/:id", adminAuth, bannerController.deleteBanner);



module.exports = router;
