const router = require('express').Router()
const {registerUser,loginUser} = require('../Controller/User.Controller')
//=======end point ======
router.post('/',registerUser)
router.post('/login',loginUser)
module.exports = router