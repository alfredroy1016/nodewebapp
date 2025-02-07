const express =require("express")
const router= express.Router()
const customerController=require("../controllers/admin/customerController")
const adminController =require("../controllers/admin/adminController")
const categoryController=require("../controllers/admin/categoryController")
const {userAuth,adminAuth}=require("../middlewares/auth")


router.get("/login",adminController.loadLogin)
router.post("/login",adminController.login);
router.get("/dashboard",adminAuth,adminController.loadDashboard)
router.get("/pageerror",adminController.pageerror)
router.get("/logout",adminController.logout)

router.get("/users",adminAuth,customerController.customerInfo)
router.get("/blockCustomer/:id",adminAuth,customerController.customerBlocked)
router.get("/unblockCustomer/:id",adminAuth,customerController.customerUnblocked)

//ategory management
router.get("/category",adminAuth,categoryController.categoryInfo)
router.post("/addCategory",adminAuth,categoryController.addCategory)

router.post("/addCategoryOffer", categoryController.addCategoryOffer);
router.post("/removeCategoryOffer", categoryController.removeCategoryOffer);

module.exports=router