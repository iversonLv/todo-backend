const express = require('express')
const router = express.Router()

const CategoryController = require('../controller/category')

// auth middleware
const authMiddleware = require('../auth/middlewares')

// router check auth middleware
router.use(authMiddleware.checkTokenSetUser)
router.use(authMiddleware.isLogined)

// {{URL}}/api/v1/categories
router.route('/')
// Get all categories
  .get(CategoryController.getAllCategories)
// Create new category
  .post(CategoryController.newCategory)

// {{URL}}/api/v1/categories/:id
router.route('/:id')
// Get Single category
  .get(CategoryController.getCategory)
// Update category
  .put(CategoryController.updateCategory)
// Delete category
  .delete(CategoryController.deleteCategory)

module.exports = router