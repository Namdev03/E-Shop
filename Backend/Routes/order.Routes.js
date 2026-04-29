const router =require('express').Router()
const {orderApi,getorder} = require('../Controller/order.Controller')
router.post('/',orderApi)
router.get('/get/:_id',getorder)

module.exports = router