const User = require("../../models/userSchema");

const customerInfo = async (req, res) => {
    try {
        let search = "";
        if (req.query.search) {
            search = req.query.search;
        }
        
        let page = 1;
        if (req.query.page) {
            page = req.query.page;
        }

        const limit = 3; // Number of users per page
        const userData = await User.find({
            isAdmin: false,
            $or: [
                { name: { $regex: ".*" + search + ".*", $options: "i" } },
                { email: { $regex: ".*" + search + ".*", $options: "i" } }
            ]
        })
        .limit(limit)
        .skip((page - 1) * limit)
        .exec();

        const count = await User.find({
            isAdmin: false,
            $or: [
                { name: { $regex: ".*" + search + ".*", $options: "i" } },
                { email: { $regex: ".*" + search + ".*", $options: "i" } }
            ]
        }).countDocuments();
      

        const totalPages = Math.ceil(count / limit); // Calculate total pages

        res.render('customers', {
            users: userData,
            totalCount: count,
            totalPages: totalPages,
            search: search,
            currentPage: page
        });

    } catch (error) {
        console.log(error);
        res.status(500).send("Error fetching customers.");
    }
}


const customerBlocked=async(req,res)=>{
    try{
        let id=req.params.id;

        const block = await User.updateOne({_id:id},{$set:{isBlocked:true}})
        console.log(id,block,"aa")
        res.redirect("/admin/users")
    }catch{
        res.redirect("/pageerror")
    }

}
 const customerUnblocked=async(req,res)=>{
    try {
        let id =req.params.id;
        await User.updateOne({_id:id},{$set:{isBlocked:false}})
        res.redirect("/admin/users")
    } catch (error) {
        res.redirect("/pageerror")
        
    }

 }

module.exports = {
    customerInfo,
    customerBlocked,
    customerUnblocked
}
