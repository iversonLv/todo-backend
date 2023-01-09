const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').config() // for TOKEN_SECRIT .env file

const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')
const path = require('path')
const port = process.env.PORT || 5000;
const  errorHandler = require('./middlewares/errorHandler')
const { logger } = require('./middlewares/logger')

// localhost cors problem
const cors = require('cors')
const volleyball = require('volleyball') // or morgan

// db
const mongoose = require('mongoose')
mongoose.Promise = global.Promise;

// router
// nodejs will grab index if the default file name is index.
// index.js could be index, omit the subfix js
// const auth = require('./auth/index.js')
// const auth = require('./auth/index')
const auth = require('./auth')
const todos = require('./api/todos')
const info = require('./api/info')
const categories = require('./api/categories')

// mongoose connect
const db = mongoose.connection
mongoose.connect(`${process.env.DB_URI}`, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false })


const app = express()
app.use(cors())

app.use(logger)

// setup swagger UI
const swaggerDocument = YAML.load(path.join(__dirname, './docs/swagger.yaml'))
app.use('/docs', (req, res, next) => {
  const p = req.hostname.includes('localhost') ? `:${port}` : ''
  const protocol = req.hostname.includes('localhost') ? 'http' : 'https'
  swaggerDocument.host = req.hostname + p;
  // TODO: req.protocol seems always show http though the app is hosted to https
  swaggerDocument.schemes = [protocol]
  req.swaggerDoc = swaggerDocument;
  next();
}, swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use(volleyball) // For dev debug to show message at console
app.use(cors())
app.use('/uploads', express.static('uploads')) //set the uploads folder static, then it could accerss via http://localhost:${port}/uploads/xxxx
app.use(express.json())
// bodyParser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// router middleware
app.use('/api/v1/auth', auth)
app.use('/api/v1/todos', todos)
app.use('/api/v1/info', info)
app.use('/api/v1/categories', categories)

app.get('/', (req, res) => {
  res.json({
    message: 'Hello world',
    user: req.user
  })
})
function notFound(req, res, next) {
  const error = new Error('Not Found - ' + req.originalUrl);
  error.status = 404
  next(error);
}

// function errorHandler(error, req, res, next) {
//   res.status(error.status || 500)
//   res.json({
//     message: error.message,
//     stack: error.stack
//   })
// }

app.use(notFound)
app.use(errorHandler)

db.on('error', console.error.bind(console, 'connection error'))
db.once('open', () => {
  // console.log(`db connect ${process.env.DB_C}`)
  app.listen(port, () => console.log(`listening on http://localhost:${port}`))
})
