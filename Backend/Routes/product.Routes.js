const Router = require('express').Router()
const upload = require('../Config/Multer.Config')
const {addProduct,getProduct} = require('../Controller/Product.controller')
//=======end points ========
Router.post('/',upload.single('productImage'),addProduct)
Router.get('/getproduct/:_id',getProduct)
module.exports = Router