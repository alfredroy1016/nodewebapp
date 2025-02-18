const Brand = require('../../models/Brand');

// Fetch all brands
const getBrands = async (req, res) => {
    try {
        const brands = await Brand.find();
        res.render('brands', { brands });
    } catch (err) {
        console.error("Error fetching brands:", err);
        res.status(500).send('Server Error');
    }
};

const addBrand = async (req, res) => {
    try {
        const { name } = req.body;
        const image = req.file ? `/uploads/brands/${req.file.filename}` : null;

        if (!name || !image) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        await Brand.create({ name, image });
        res.status(200).json({ success: true, message: 'Brand added successfully' });
    } catch (err) {
        console.error("Error adding brand:", err);
        res.status(500).json({ success: false, message: 'Error adding brand' });
    }
};

const toggleBrandStatus = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.redirect('/admin/brands?error=Brand not found');
        }

        brand.status = brand.status === 'Active' ? 'Blocked' : 'Active';
        await brand.save();
        res.redirect(`/admin/brands?success=Brand status changed to ${brand.status}`);
    } catch (err) {
        console.error("Error updating brand status:", err);
        res.redirect('/admin/brands?error=Error updating brand status');
    }
};


const deleteBrand = async (req, res) => {
    try {
        await Brand.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Brand deleted successfully' });
    } catch (err) {
        console.error("Error deleting brand:", err);
        res.status(500).json({ success: false, message: 'Error deleting brand' });
    }
};


module.exports = {
    getBrands,
    addBrand,
    toggleBrandStatus,
    deleteBrand
};
