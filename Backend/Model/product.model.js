const { Schema, model } = require('mongoose');

const productSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            //   required: true,
            trim: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        category: {
            type: String,
            required: true
        },

        stock: {
            type: Number,
            //   required: true,
            default: 0
        },

        brand: {
            type: String,
            trim: true
        },

        image: {
            type: String
        },
        images: [{
            type: String
        }],

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = model('products', productSchema);