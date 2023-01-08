
// model
const User = require('../models/User')
const Category = require('../models/Category')
const Todo = require('../models/Todo')

// joi for model schema
const Joi = require('joi')
const bcrypt = require('bcryptjs')

// imort utiles
const { validateUsername, bcryptPassword, registerUser, loginUser } = require('../utils/auth')

// validate model schema
const userSchema = Joi.object({
  username: Joi.string().trim().regex(/(^[a-zA-Z0-9_]*$)/).min(2).max(30).required(),
  password: Joi.string().trim().min(10).required(),
})

// update user model schema
const updateUserSchema = Joi.object({
  username: Joi.string().trim().regex(/(^[a-zA-Z0-9_]*$)/).min(2).max(30).required(),
  password: Joi.string().trim().min(10).required(),
  avatar: Joi.any(), // avatar now is optional and any value, undefinded or not
  currentpassword: Joi.string().trim().min(10).required()
})

// user signup
const signup = async (req, res) => {
  try {
    // validate the input data base on schema
    await userSchema.validate(req.body)
    await registerUser(req.body, ['user'], res)
  } catch(err) {
    res.status(400).json({message: err.details[0].message})
  }
}

//adminsignup
const adminSignup = async (req, res) => {
  try {
    await userSchema.validate(req.body)
    await registerUser(req.body, ['admin'], res)
  } catch(err) {
    res.status(400).json({message: err.details[0].message})
  }
}

//adminDeleteUser
const adminDeleteUser = async (req, res) => {
  try {
    const user =  await User.findById({_id: req.params.id})
    if(user) {
      user.remove()
      // After delete user, need remove the user todos and categories
      await Todo.deleteMany({createdBy: req.params.id})
      await Category.deleteMany({createdBy: req.params.id})
      res.status(200).json({message: `"${user.username}" has been deleted, nor its todos and categories`})
      
    } else {
      res.status(404).json({
        message: 'No such user'
      })
    }
  } catch(err) {
    res.status(400).json({message: err.details[0].message})
  }
}
// login
const login = async (req, res) => {
  try {
    await userSchema.validate(req.body)
    await loginUser(req.body, res)
  } catch(err) {
    res.status(400).json({message: err.details[0].message})
  }
}

// get current user
const me = async (req, res) => {
  const id = await req.decoded._id
  try {
    const user = await User.findById({_id: id}, 'username roles avatar')
    // .populate({
    //   'path': 'todos', // populate todos
    //   'select': 'title createdOn', // only display title and createdOn
    //   'options': {
    //     sort: { createdOn: -1 } //sort createdOn from latest to old
    //   }
    // }).populate({
    //   'path': 'categories', // populate todos
    //   'select': 'title createdOn color', // only display title and createdOn
    //   'options': {
    //     sort: { createdOn: -1 } //sort createdOn from latest to old
    //   }
    // })
    if (user !== null) {
      res.status(200).json({user})
    } else {
      res.status(404).json({message: 'No such user'})
    }
  } catch(err) {
    res.status(400).json({message: err.details[0].message})
  }
}

// update current user
const updateMe = async (req, res) => {
  try {
    const id = await req.decoded._id
    await updateUserSchema.validate(req.body)

    //check username is unique or not
    const hasUser = await validateUsername(req.body.username)
    if (hasUser && hasUser._id.toString() !== id) {
      // There is already a user in the db with this username and this user is not current user.
      // Resoponse error
      return res.status(409).json({message: 'The username has been taken'})
    }

    const user = await User.findOne({_id: id}).exec()
    if (user !== null) {
      // check current password
      const inputPassword = req.body.currentpassword.trim()
      const dbPassword = user.password
      const result = await bcrypt.compare(inputPassword, dbPassword)
      // if input current password
      if (result) {
        // bcrypt the password
        const hashedPassword = await bcryptPassword(req.body.password)
        const updatedMe = {
          username: req.body.username,
          password: hashedPassword,
          avatar: req.file !== undefined ? 'http://' + req.headers.host + '\/' + req.file.path : user.avatar, // here if no file, would use existing user.avatar value
          updatedOn: (new Date()).toLocaleString(), // toLocalString() greenwich timezone change to local timezone
          updatedBy: id,
        }

        await user.updateOne({ $set: updatedMe }).select('username, avatar')
        res.status(200).json({message: 'updated succeed!'})
      } else {
        res.status(400).json({message: 'Current password is not correct'})
      }


    } else {
      res.status(404).json({message: 'No such user'})
    }
  } catch(err) {
    res.status(400).json({message: err.details[0].message})
  }
}

module.exports = {
  signup,
  login,
  adminSignup,
  adminDeleteUser,
  me,
  updateMe
}