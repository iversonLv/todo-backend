const express = require('express')
const router = express.Router()

// upload option
const { upload } = require('../utils/upload')

const UserController = require('../controller/user')

// auth middleware
const authMiddleware = require('../auth/middlewares')

// every router under filer will pre-pend /auth
router.get('/', (req, res) => {
  res.json({
    message: 'auth'
  })
})

// {{URL}}/auth/signup
router.route('/signup')
// Signup
      .post(UserController.signup)

// {{URL}}/auth/login
router.route('/login')
// Login
      .post(UserController.login)

// {{URL}}/auth/signup/admin
router.route('/signup/admin')
// Admin signup
      .post(UserController.adminSignup)

router.use(authMiddleware.checkTokenSetUser)


// {{URL}}/auth/me
router.route('/me')
      .all(authMiddleware.isLogined)
// profile
      .get(UserController.me)
// update profile
      .put(upload.single('avatar'), UserController.updateMe)

// {{URL}}/auth/user/:id
router.route('/user/:id')
      // need admin role
      .all(authMiddleware.adminRole)
// admin get user detail
// admin delete user
      .delete(UserController.adminDeleteUser)

module.exports = router