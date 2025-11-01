require('dotenv').config()
// async errors
require('express-async-errors')

const express = require('express')
const compression = require('compression')

const app = express()

const connectDB = require('./db/connect')
const productsRouter = require('./routes/products')

const notFoundMiddleware = require('./middleware/not-found')
const errorMiddleware = require('./middleware/error-handler')

// middleware
app.disable('x-powered-by')
app.use(compression({ threshold: 0 }))
app.use(express.json({ limit: '100kb' }))

// routes
app.get('/', (req, res) => {
  res.send('<h1>store API</h1><a href="/api/v1/products">products route</a>')
})

app.use('/api/v1/products', productsRouter)

app.use(notFoundMiddleware)
app.use(errorMiddleware)

const port = process.env.PORT || 3000

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () => {
      console.log(`server is listening port ${port}`)
    })
  } catch (error) {
    console.log(error)
  }
}

start()