const Products = require('../models/product')

const BOOL_TRUE = ['true', '1', 'yes']
const NUMERIC_FILTER_FIELDS = ['price', 'rating']
const NUMERIC_OPERATORS = Object.freeze({
  '>': '$gt',
  '>=': '$gte',
  '=': '$eq',
  '<': '$lt',
  '<=': '$lte',
})

const STATIC_CACHE_TTL = 60 * 1000
const staticCache = {
  data: null,
  expiresAt: 0,
}

const getAllProductsStatic = async (req, res) => {
  const now = Date.now()

  if (staticCache.data && staticCache.expiresAt > now) {
    res.set('Cache-Control', 'public, max-age=60')
    return res.status(200).json(staticCache.data)
  }

  const products = await Products.find({ price: { $gt: 30 } })
    .sort('price')
    .select('price -_id')
    .lean()

  staticCache.data = { nbHits: products.length, products }
  staticCache.expiresAt = now + STATIC_CACHE_TTL

  res.set('Cache-Control', 'public, max-age=60')
  res.status(200).json(staticCache.data)
}

const getAllProducts = async (req, res) => {
  const { featured, company, name, sort, fields, numericFilters } = req.query

  const queryObject = {}

  if (typeof featured === 'string') {
    queryObject.featured = BOOL_TRUE.includes(featured.toLowerCase())
  }

  if (typeof company === 'string' && company.trim()) {
    queryObject.company = company.trim()
  }

  if (typeof name === 'string' && name.trim()) {
    queryObject.name = { $regex: name.trim(), $options: 'i' }
  }

  if (typeof numericFilters === 'string' && numericFilters.trim()) {
    const regEx = /\b(<|>|>=|=|<|<=)\b/g
    const sanitized = numericFilters.replace(regEx, (match) => `-${NUMERIC_OPERATORS[match]}-`)

    sanitized.split(',').forEach((item) => {
      const [field, operator, value] = item.split('-')
      if (!NUMERIC_FILTER_FIELDS.includes(field) || !operator || value === undefined) return

      const numericValue = Number(value)
      if (Number.isNaN(numericValue)) return

      queryObject[field] = {
        ...(queryObject[field] || {}),
        [operator]: numericValue,
      }
    })
  }

  let query = Products.find(queryObject)

  if (typeof sort === 'string' && sort.trim()) {
    const sortList = sort
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .join(' ')

    if (sortList) query = query.sort(sortList)
  } else {
    query = query.sort('-featured createdAt')
  }

  if (typeof fields === 'string' && fields.trim()) {
    const fieldList = fields
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .join(' ')

    if (fieldList) query = query.select(fieldList)
  }

  const page = Math.max(Number(req.query.page) || 1, 1)
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100)
  const skip = (page - 1) * limit

  const products = await query.skip(skip).limit(limit).select('-__v').lean()

  res.status(200).json({ nbHits: products.length, products })
}

module.exports = {
  getAllProducts,
  getAllProductsStatic,
}