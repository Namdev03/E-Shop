const router = require('express').Router()
const {registerUser,loginUser, logoutuser} = require('../Controller/User.Controller')
//=======end point ======
router.post('/',registerUser)
router.post('/login',loginUser)
router.get('/logout',logoutuser)
module.exports = router