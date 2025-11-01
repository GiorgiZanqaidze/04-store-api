const mongoose = require('mongoose')

const productsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'product name must be provided'],
      trim: true,
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'products price must be provided'],
      min: 0,
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    company: {
      type: String,
      enum: {
        values: ['ikea', 'liddy', 'caressa', 'marcos'],
        message: '{VALUE} is not supported',
      },
      lowercase: true,
      trim: true,
      index: true,
    },
  },
  {
    versionKey: false,
  }
)

productsSchema.index({ featured: 1, price: 1 })
productsSchema.index({ rating: -1, price: 1 })
productsSchema.index({ company: 1, price: 1 })

module.exports = mongoose.model('Product', productsSchema)