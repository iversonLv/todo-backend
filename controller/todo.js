// model
const Todo = require('../models/Todo')
const User = require('../models/User')
const Category = require('../models/Category')

// queryParams common code for perPage, page, totalCount, sortOrder
const queryParamsShared = require('../utils/queryParams')

// Joi validator
const Joi = require('joi')

// Date model schema
const todoSchema = Joi.object({
  title: Joi.string().trim().max(100).required(),
  start: Joi.date().required(),
  end: Joi.date().required(),
  category: Joi.string().required(),
  notes: Joi.string().trim().max(200)
  // .valid('Daily life', 'Work', 'Entertaiment') does not work
})

// get all todo infos
// {
//   "total": 15,
//   "totalComplete": 0,
//   "totalInComplete": 15,
//   "totalWorkCat": 0,
//   "totalDailylifeCat": 0,
//   "totalEntertaimentCat": 0
// }
const infosCriterSchema = Joi.object({
  after: Joi.date().iso().max(Joi.ref('before')),
  before: Joi.date().iso().min(Joi.ref('after')),
  isComplete: Joi.boolean()
})
const infos = async (req, res) => {
  const criteria = req.query

  try {
    const id = await req.decoded._id
    const roles = await req.decoded.roles
    const adminRole = roles.includes('admin')

    await infosCriterSchema.validate(criteria)

    const filter = {}
  
    if (criteria.after) {
      after = criteria.after
      filter.start = { $gte: after }
    }
    if (criteria.before) {
      // now start-end is  [start end), so if select date picket 2020-09-13, won't show anything, will need select 2020-09-13 to 2020-09-14
      // so front-end show select 2020-09-13, however bacekend should fetch 2020-09-14, because some todo is between 2020-09-13T00:00 to 2020-09-13T24:00
      // we need to [start, end] so 2020-09-13 could be show this day

      const getEndDate = new Date(criteria.before).getDate()
      const plusOneDayForEndDate = new Date(criteria.before).setDate(getEndDate + 1)
      const returnISOdate = new Date(plusOneDayForEndDate)
      filter.end = { $lte: returnISOdate }
    }

    if (criteria.isComplete) {
      filter.isComplete = criteria.isComplete
    }

    // if admin role will fetch all info data, if user, just fetch the users' data
    const total = await Todo.countDocuments(adminRole ? { ...filter } : {createdBy: id});
    const totalComplete = await Todo.countDocuments(adminRole ? { ...filter, isComplete: true } : {createdBy: id, isComplete: true});
    const totalInComplete = await Todo.countDocuments(adminRole ? { ...filter, isComplete: false } : {createdBy: id, isComplete: false});
    // const totalWorkCat= await Todo.countDocuments(adminRole ? {category: 'Work', ...filter} : {createdBy: id, category: 'Work'});
    // const totalDailylifeCat= await Todo.countDocuments(adminRole ? {category: 'Daily life', ...filter} : {createdBy: id, category: 'Daily life'});
    // const totalEntertaimentCat= await Todo.countDocuments(adminRole ? {category: 'Entertaiment', ...filter} : {createdBy: id, category: 'Entertaiment'});

    res.status(200).json({
      total,
      totalComplete,
      totalInComplete,
      // totalWorkCat,
      // totalDailylifeCat,
      // totalEntertaimentCat
    })
  } catch(err) {
    res.status(400).json({message: err.details[0].message})
  }
}
// Get all todos
const getAlltodos = async (req, res) => {
  const id = req.decoded._id
  // sortBy, sortOrder, page, perPage, keyword
  // limit, show per page
  // skip skip N show N+1
  // sort asc, desc, ascending, descending, 1, and -1.
  let { perPage, sortBy = 'createdOn', sortOrder = 'desc', page = 1, isComplete, q, filterPieChartCategory, isImportant } = req.query

  // search function
  const escapeRegex = (text) => {
    if (text === undefined) {
      return
    }
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
  }
  const regex = new RegExp(escapeRegex(q), 'gi')

  // filter isComplete or not
  isComplete = isComplete === undefined || isComplete === '' ? '' : {isComplete}
  isImportant = isImportant === undefined || isImportant === '' ? '' : {isImportant}
  const filter = {createdBy: id, ...isComplete, ...isImportant, title: regex}
  const totalCount = await Todo.countDocuments({...filter}) // need use async or get error
  const queryParamsObj = await queryParamsShared(totalCount, page, perPage, sortOrder)
  req.query = { ...queryParamsObj, sortBy }
  filterPieChartCategory = filterPieChartCategory !== undefined ? filterPieChartCategory.split(',') : null;
  try {
    const todos = await Todo.find(
        {
          ...filter,
          category: { $nin: filterPieChartCategory } 
        },
        null,
        {
          limit: parseInt(queryParamsObj.perPage),
          skip: (parseInt(queryParamsObj.page) - 1) * queryParamsObj.perPage,
          sort: (queryParamsObj.sortOrder === 'asc' ? sortBy : '-' + sortBy)
        }
      ).populate('createdBy', 'username').populate('category', 'title color')
    // const todos = await Todo.find({...filter, category: { $nin: filterPieChartCategory } }, null, {limit: parseInt(queryParamsObj.perPage), skip: (parseInt(queryParamsObj.page) - 1) * queryParamsObj.perPage, sort: (queryParamsObj.sortOrder === 'asc' ? sortBy : '-' + sortBy)}).populate('createdBy', 'username').populate('category', 'title')
    res.status(200).json({
      ...req.query,
      todos
    })
  } catch(err) {
    res.status(400).json({message: err.details[0].message})
  }
}

// Create new todo
const newTodo = async (req, res) => {
  try {
    await todoSchema.validate(req.body)
    const id = req.decoded._id
    const newTodo = new Todo({
      ...req.body,
      createdBy: id,
      updatedBy: id
    })

    // Check whether there is the cateogry
    const category = await Category.findOne({_id: req.body.category, createdBy: id})
    if (!category) {
      return res.status(404).json({message: 'No such category'})
    }
    await newTodo.save(async (error, todo) => {
      if (error) {
        res.status(400).json({message: error})
      } else {
        res.status(201).json(todo)
        // after save the todo, the related user todos array will push it as sub document
        await User.updateOne({_id: id}, {$push: { todos: todo}})
        await Category.updateOne({_id: req.body.category}, {$push: { todos: todo}})
      }
    })
  } catch(err) {
    res.status(400).json({message: err.details[0].message})
  }
  
}

// Get Single todos
const getTodo = async (req, res) => {
  const id = req.decoded._id

  try {
    const todo = await Todo.findOne({ _id: req.params.id, createdBy: id}).populate('createdBy', 'username').populate('category', 'title')
    if(todo) {
      res.status(200).json(todo)
    } else {
      res.status(404).json({message: 'No such todo'})
      const error = new Error('No such todo')
      next(error)
    }
  } catch(err) {
    res.status(400).json({message: err.details[0].message})
  }
}

// Update todo
const updateTodo = async (req, res) => {
  const id = req.decoded._id

  // ES6 speard feature
  const updateTodo = {
    ...req.body,
    updatedOn: (new Date()).toLocaleString(), // toLocalString() 将 greenwich timezone change to local timezone
    updatedBy: id,
  } 
  try {
    // { $set: updateTodo} only update the corresponding field from ...req.body and map the modified date and person
    // { createdOn, createdBy } won't be change
    // first and formost, find the todo
    const findTodo = await Todo.findOne({_id: req.params.id, createdBy: id})
    if (findTodo !== null) {
      // Find the todo inorder to delete it from the category if update
      await Category.updateOne({_id: findTodo.category._id}, {$pull: { todos: { $in: req.params.id}}})
      const todo = await Todo.findOneAndUpdate({_id: req.params.id, createdBy: id}, { $set: updateTodo}, { new: true }).populate('updatedBy', 'username')
      res.status(200).json(todo)
      // After update, need update the category id as well if any
      await Category.updateOne({_id: req.body.category}, {$push: { todos: todo}})
    }  else {
      res.status(404).json({message: 'No such todo'})
    }
  } catch(err) {
    res.status(400).json({message: err.details[0].message})
  }
}

// Delete todo
const deleteTodo = async (req, res) => {
  try {
    const id = await req.decoded._id

    const todo = await Todo.findOne({_id: req.params.id, createdBy: id})
    if(todo) {
      const todoCategoryId = todo.category._id
      todo.remove()
      res.status(200).json({message: `"${todo.title}" has been deleted`})
      // After delete todo, need remove from the user todos array as well
      await User.updateOne({_id: id}, {$pull: {todos: { $in: req.params.id}}})
      await Category.updateOne({_id: todoCategoryId}, {$pull: {todos: { $in: req.params.id}}})
      
    } else {
      res.status(404).json({message: 'No such todo'})
    }
  } catch(err) {
    res.status(400).json({message: err.details[0].message})
  }
}

// Complete all todos
const completeAllTodos = async (req, res) => {
  const id = req.decoded._id
  const updatedTodos = {isComplete: true, updatedOn: (new Date()).toLocaleString(), // toLocalString() greenwich timezone change to local timezone
    updatedBy: id}
  try {
    const todo = await Todo.updateMany({isComplete: false, createdBy: id}, updatedTodos)
    res.status(200).json(todo)
  } catch(err) {
    res.status(400).json({message: err.details[0].message})
  }
}

// Delete all todos
const deleteAllTodos = async (req, res) => {
  const id = req.decoded._id
  try {
    const todo = await Todo.deleteMany({createdBy: id})
    res.status(200).json(todo)
    //after delete todo, need remove from the user todos array as well
    await User.updateOne({_id: id}, {$set: {todos: []}})
    await Category.updateOne({createdBy: id}, {$set: {todos: []}})
  } catch(err) {
    res.status(400).json({message: err.details[0].message})
  }
}

module.exports = {
  infos,
  getAlltodos,
  newTodo,
  getTodo,
  updateTodo,
  deleteTodo,
  completeAllTodos,
  deleteAllTodos
}