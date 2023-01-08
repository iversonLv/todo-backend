// model
const User = require('../models/User')

const bcrypt = require('bcryptjs')
const saltRounds = 10;


// jwt
const jwt = require('jsonwebtoken')

// jwt token function
const createTokenSendResponse = (user, res, next) => {
  const loginUser = {
    _id: user._id,
    username: user.username,
    roles: user.roles
  }
  // jwt sign
  jwt.sign(
    loginUser,
    process.env.TOKEN_SECRET,
    { expiresIn: '7d' },
    (err, token) => {
      if(err) {
        responseError422(res, next)
      } else {
        res.status(201).json({token})
      }
    }
  )
}

// This error will display to front-end axios catch err
const responseError422 = (res, next) => {
  res.status(422)
  const error = new Error('Unable to login, please check whether password or username correct')
  next(error)
}

// validate whether there is user
const validateUsername = async (username) => {
  // check whether there is user with the input username
  const user = await User.findOne({username}).lean().exec()
  return user
}

// Hashed password
const bcryptPassword = (password) => {
  return bcrypt.hash(password.trim(), saltRounds)
}

const registerUser = async (reqBody, roles, res) => {
  const {username, password} = reqBody
  try {
    const hasUser = await validateUsername(username)
    //check username is unique or not
    if (hasUser) {
      // There is already a user in the db with this username..
      // Resoponse error
      return res.status(409).json({message: 'The username has been taken'})
    }
    // hash password
    // inssert the user to db
    const hashedPassword = await bcryptPassword(password)
    const newUser = new User({
      username: username,
      password: hashedPassword,
      roles: [...roles]
    })
    newUser.save((error, user) => {
      if (error) {
        res.status(403).json({ message: 'Could not create user. Error', error})
      } else {
        createTokenSendResponse(user, res)
      }
    })
  } catch(err) {
    res.status(400).json({message: err.details[0].message})
  }
}

const loginUser = async (reqBody, res) => {
  const {username, password} = reqBody
  try {
    const hasUser = await validateUsername(username)
    console.log(hasUser)
    // verify whether there is user
    if (!hasUser) {
      return res.status(400).json({message: 'username wrong, please check'})
    }
    
    const inputPassword = password.trim()
    const dbPassword = hasUser.password
    const result = await bcrypt.compare(inputPassword, dbPassword)
    if (result) {
      createTokenSendResponse(hasUser, res);
    } else {
      // password is wrong
      res.status(400).json({message: "password is not correct"})
    }    
  } catch(err) {
    res.status(400).json({message: err.details[0].message})
  }
}

module.exports = {
  registerUser,
  loginUser,
  bcryptPassword,
  validateUsername
}