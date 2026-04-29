const addToCartSchema = require('../Model/addToCart.model')
async function addTOCart(req, res) {
    try {
        const payload = req.body
        const finduser = await addToCartSchema.create(payload)
        if (!finduser) {
            return res.status(404).json({ message: "cart entry not found" });
        }
        if (!finduser.user) {
            return res.status(404).json({ message: "user not found" });
        }

        if (!finduser.product) {
            return res.status(404).json({ message: "product not found" });
        }
        const cart = await addToCartSchema.create(payload)
        const toSend = {
            user: payload.user,
            product: payload.product,
            quantity: payload.quantity

        }
        res.status(201).json({ message: "cart add successfully", Data: toSend })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
const Cart = require('../Model/addToCart.model');

async function getCart(req, res) {
    try {
        const { userid } = req.params;

        const cart = await addToCartSchema.find({userid })
            .populate('user', '_id name email')
            .populate('product', '_id name price category image');

        if (cart.length <= 0) {
            return res.status(404).json({
                message: "Cart is empty"
            });
        }
        const toSend = cart.map(item => ({
            user: {
                _id: item.user._id,
                name: item.user.name,
                email: item.user.email
            },
            product: {
                _id: item.product._id,
                name: item.product.name,
                price: item.product.price,
                category: item.product.category,
                image: item.product.image
            },
            quantity: item.quantity
        }));
        res.status(200).json({
            message: "Cart fetched successfully",
            data: toSend
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
module.exports = { addTOCart, getCart }