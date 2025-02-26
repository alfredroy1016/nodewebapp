const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directories exist
const createFolder = (folderPath) => {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = "public/uploads/";

        if (file.fieldname === "productImages") {
            uploadPath += "products/";
        } else if (file.fieldname === "brandImage") {
            uploadPath += "brands/";
        } else if (file.fieldname === "document") {
            uploadPath += "documents/";
        }else if (file.fieldname === "bannerImage") {  // ✅ Added Banner Support
            uploadPath += "banners/";
        }


        createFolder(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const fileFilter = (req, file, cb) => {
    const allowedImageTypes = /jpeg|jpg|png/;
    const allowedDocTypes = /pdf|docx|doc/;
    const isValidExt = allowedImageTypes.test(path.extname(file.originalname).toLowerCase()) || 
                       allowedDocTypes.test(path.extname(file.originalname).toLowerCase());
    const isValidMime = allowedImageTypes.test(file.mimetype) || 
                        allowedDocTypes.test(file.mimetype);

    if (isValidExt && isValidMime) {
        cb(null, true);
    } else {
        cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Invalid file type"));
    }
};

const upload = multer({ 
    storage, 
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB per file
});

module.exports = upload;
