require('dotenv').config() // for TOKEN_SECRIT .env file
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const checkTokenSetUser = (req, res, next) => {
  const authHeader = req.get('Authorization')
  if(authHeader) {
    // only get the string after 'Bearer'
    const token = authHeader.split(' ')[1]
    if (token) {
      jwt.verify(token, process.env.TOKEN_SECRET, async (err, decoded) => {
        if(err) {
          res.status(400).json({message: err.message})
        } 
        req.decoded = decoded
        // Check whether there is the user
        const user = await User.findById({_id: req.decoded._id})
        if (!user) {
          return res.json({ status: 404, message: 'No such user' })
        }
        next() // this next will run below GET {{ulr}}/user/me router, go on the isLoggenIn()
      })
    } else {
      res.status(400).json({message: 'No token'})
    }
  } else {
    res.status(401).json({message: 'No-Authorization'})
  }
}

const isLogined = (req, res, next) => {
  if(req.decoded) {
    console.log('yes, in')
    next() // will go on next function
  } else {
    res.status(400).json({message: 'Please login first'})
  }
}

// Check whether current logined user is admin role or not
const adminRole = (req, res, next) => {
  const roles = req.decoded.roles
  const adminRole = roles.includes('admin')
  if(adminRole) {
    next()
  }
  else {
    res.status(403).json({message: 'No-Authorization, only for admin'})
  }
}

module.exports = {
  checkTokenSetUser,
  isLogined,
  adminRole
}