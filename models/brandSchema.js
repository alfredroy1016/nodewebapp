const mongoose = require("mongoose");
const { create } = require("./categorySchema");
const {Schema}=mongoose;



const brandSchema= new Schema({

    brandName:{
        type:String,
        required:true
    },
    breandImage:{
        type:[String],
        required:true
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})





const Brand =mongoose.model("Brand",brandSchema)
module.exports =Brand;