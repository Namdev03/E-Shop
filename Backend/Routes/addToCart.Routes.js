const Router = require('express').Router()
const {addTOCart,getCart} = require('../Controller/addToCart.Controller')
Router.post('/',addTOCart)
Router.get("/getcart/:_id",getCart)
module.exports = Router