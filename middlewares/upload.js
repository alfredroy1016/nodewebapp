const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'public/uploads/';

        if (file.fieldname === "productImage") {
            uploadPath += "products/";
        } else if (file.fieldname === "brandImage") {
            uploadPath += "brands/";
        } else if (file.fieldname === "document") {
            uploadPath += "documents/";  // New folder for documents
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedImageTypes = /jpeg|jpg|png/;
    const allowedDocTypes = /pdf|docx|doc/;
    const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase()) ||
                    allowedDocTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedImageTypes.test(file.mimetype) || 
                     allowedDocTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error("Only images (jpeg, jpg, png) and documents (pdf, doc, docx) are allowed"));
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
