const router =require('express').Router()
const {orderApi,getorder} = require('../Controller/order.Controller')
router.post('/',orderApi)
router.get('/get/:userid',getorder)

module.exports = router