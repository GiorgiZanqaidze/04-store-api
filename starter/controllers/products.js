const Products = require('../models/product')

const getAllProductsStatic = async (req, res) => {

    const products = await Products.find({}).select('name price')
    res.status(200).json({ nbHints: products.length, products })
}

const getAllProducts = async (req, res) => {
    const {featured, company, name, sort} = req.query

    const queryObject = {}

    if (featured) {
        queryObject.featured = featured === "true" ? true : false
    }

    if (company) {
        queryObject.company = company 
    }

    if (name) {
        queryObject.name = { $regex: name, $options: 'i'}
    }

    let result = Products.find(queryObject)
    
    if (sort) {
        const sortList = sort.split(',').join(' ');
        result = result.sort(sortList);
    } else {
        result = result.sort('createdAt');
    }
    console.log(queryObject)
    
    const products = await result

    res.status(200).json({ nbHints: products.length, products })
}

module.exports = {
    getAllProducts,
    getAllProductsStatic
}