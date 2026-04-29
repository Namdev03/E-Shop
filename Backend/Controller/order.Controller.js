const orderSchema = require('../Model/oders.Model')
async function orderApi(req,res) {
    try {
        const payload = req.body
        const createorder =  await orderSchema.create(payload)
        // .populate('user',["name",'email']).populate('product',['name','price','descriptin','catagory'])
        res.status(201).json({message:"order successfully",data:createorder})
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}
async function getorder(req,res) {
    try {
        const{userid} =req.params
        const orders = await orderSchema.find({user:userid}).populate('user',"name email").populate('products',"name price descriptin catagory")
          res.status(200).json({message:"order fetch successfully",data:orders})
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}
module.exports = {orderApi,getorder}