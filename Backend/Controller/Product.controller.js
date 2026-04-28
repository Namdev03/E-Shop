const productSchema = require('../Model/product.model')
async function addProduct(req, res) {
  try {
    const payload = req.body;

    if (req.file) {
      const imageUrl = `http://localhost:9000/${req.file.destination}/${req.file.filename}`;
      payload.image = imageUrl;
    }
    const addproduct = await productSchema.create(payload)
    res.status(201).json({
      message: "product added successfully",
      data: payload
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
async function getProduct(req, res) {
  try {
    const { _id } = req.params;

    const findProduct = await productSchema.findById(_id);

    if (!findProduct) {
      return res.status(404).json({
        message: "Product not found"
      });
    }
    const toSend = {
      _id: findProduct._id,
      name: findProduct.name,
      image: findProduct.image,
      price: findProduct.price,
      category: findProduct.category,
      stock: findProduct.stock
    };
    res.status(200).json({
      message: "product fetch successfully",
      data: toSend
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
module.exports = { addProduct, getProduct }