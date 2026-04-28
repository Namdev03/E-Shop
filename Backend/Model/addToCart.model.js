const { Schema, model, default: mongoose } = require('mongoose')
const { schema } = require('./product.model')

const addToCartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "products",
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
}
);

module.exports = model('carts',addToCartSchema)
