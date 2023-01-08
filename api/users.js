const express = require('express')
const router = express.Router

// db connection
const db = require('../db/connnection')
// Collection
const users = db.get('users')
// index
users.createIndex('name')

// model schema
const schema = Joi.object().keys({
  username: Joi.string().regex(/(^[a-zA-Z0-9_]*$)/).min(2).max(30).required(),
  password: Joi.string().trim().min(10).required(),
})

module.exports = router
