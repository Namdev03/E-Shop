const Router = require('express').Router()
const {addTOCart,getCart} = require('../Controller/addToCart.Controller')
Router.post('/',addTOCart)
Router.get("/getcart/:userid",getCart)
module.exports = Router