const express = require('express')
const router = express.Router()

const TodoController = require('../controller/todo')

// auth middleware
const authMiddleware = require('../auth/middlewares')

// router check auth middleware
router.use(authMiddleware.checkTokenSetUser);
router.use(authMiddleware.isLogined);

// {{URL}}/api/v1/todos/info
router.route('/infos')
// Get todos info
      .get(TodoController.infos)

// {{URL}}/api/v1/todos
router.route('/')
// Get all todos
      .get(TodoController.getAlltodos)
// Create new todo
      .post(TodoController.newTodo)

// {{URL}}/api/v1/todos/:id
router.route('/:id')
// Get Single todos
      .get(TodoController.getTodo)
// Update todo
      .put(TodoController.updateTodo)
// Delete todo
      .delete(TodoController.deleteTodo)

// {{URL}}/api/v1/todos/completeAllTodos
router.route('/completeAllTodos')
/// Complete all todos
      .post(TodoController.completeAllTodos)

// {{URL}}/api/v1/todos/deleteAll
// This might refactor to soft delete
router.route('/deleteAllTodos')
// Delete all todos
      .post(TodoController.deleteAllTodos)

module.exports = router