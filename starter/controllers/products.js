const Products = require('../models/product')

const getAllProductsStatic = async (req, res) => {
    const products = await Products.find({})
    res.status(200).json({ products })
}

const getAllProducts = async (req, res) => {

    res.status(200).json({ msg: "hehehe" })
}

module.exports = {
    getAllProducts,
    getAllProductsStatic
}