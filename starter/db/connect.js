const mongoose = require('mongoose')

mongoose.set('strictQuery', true)

const connectDB = (url = '') => {
  const isProduction = process.env.NODE_ENV === 'production'

  return mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    autoIndex: !isProduction,
    maxPoolSize: 10,
    poolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
}

module.exports = connectDB
