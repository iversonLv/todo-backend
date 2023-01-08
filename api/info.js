const express = require('express')
const router = express.Router()

const InfoController = require('../controller/info')

// auth middleware
const authMiddleware = require('../auth/middlewares')

// router check auth middleware
router.use(authMiddleware.checkTokenSetUser)
router.use(authMiddleware.adminRole)



// {{URL}}/api/v1/info/topOne
router.route('/topOne')
// Get todos info
      .get(InfoController.topOne)

// {{URL}}/api/v1/info/topTen
router.route('/topTen')
// Get todos info
      .get(InfoController.topTen)

// {{URL}}/api/v1/info/topTen
router.route('/users')
// Get todos info
      .get(InfoController.users)

module.exports = router