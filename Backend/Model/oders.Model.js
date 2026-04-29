const {Schema,model} = require("mongoose");

const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    products: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: "products",
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                default: 1
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],

    totalAmount: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
        default: "pending"
    },

    paymentMethod: {
        type: String,
        enum: ["cod", "card", "upi"],
        // required: true
    },

    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending"
    },

    shippingAddress: {
        address: String,
        city: String,
        state: String,
        pincode: String,
        country: String
    }

}, {
    timestamps: true
});

module.exports = model("Orders", orderSchema);