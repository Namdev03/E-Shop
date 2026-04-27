require('dotenv').config()
const userSchema = require('../Model/User.Model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookie = require('cookie-parser')
async function registerUser(req, res) {
    try {
        const payload = req.body;
        const emailMatch = await userSchema.findOne({ email: payload.email });
        if (emailMatch) {
            return res.status(409).json({ message: "user already registerd" })
        }
        const hashpassword = await bcrypt.hash(payload.password, 10)
        const toSend = {
            ...payload,
            password: hashpassword
        };
        const userData = await userSchema.create(toSend)
        res.status(201).json({ message: "register successfully", Data: toSend })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
async function loginUser(req, res) {
    try {
        const payload = req.body;
        const emailMatch = await userSchema.findOne({ email: payload.email });
        if (!emailMatch) {
            return res.status(404).json({ message: "user not register" })
        }
        const comaparePassword = await bcrypt.compare(payload.password, emailMatch.password)
        if (!comaparePassword) {
            return res.status(401).json({ message: "invalid credential" })
        }
        const toSend = {
            ...payload,
            role:emailMatch.role,
            password: emailMatch.password
        }
        const token = jwt.sign(toSend, process.env.SECRET_KEY,{
            expiresIn:60*60*1000
        })
        res.cookie("token", token, {
            httpOnly: true,      
            secure: false,       
            sameSite: "lax",     
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });      
        res.status(200).json({ message: "login successfully", Data: toSend, token })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
module.exports = { registerUser, loginUser }