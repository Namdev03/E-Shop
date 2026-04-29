const { Schema, model } = require('mongoose')

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role:{
        type:String,
        default:"Customer"
    }
}, {
    timestamps: true
});
module.exports = model('users',userSchema);