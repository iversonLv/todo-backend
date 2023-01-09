// model
const Category = require('../models/Category')
const User = require('../models/User')
const Todo = require('../models/Todo')

// Joi validator
const Joi = require('joi')

const categorySchema = Joi.object({
  title: Joi.string().trim().max(100).required(),
  color: Joi.string()
})

// Get all categories
const getAllCategories = async (req, res) => {
  const id = req.decoded._id
  const filter = { createdBy: id }
  try {
    const categories = await Category.find({ ...filter  })
    .populate('createdBy', 'username')
    .populate({
      'path': 'todos', // populate todos
      'select': 'title createdOn', // only display title and createdOn
      'options': {
        sort: { createdOn: -1 } //sort createdOn from latest to old
      }
    })
    res.status(200).json({
      categories
    })
  } catch(err) {
    res.status(400).json({message: err.details[0].message})
  }
}

// Create new category
const newCategory = async (req, res) => {
  try {
    await categorySchema.validate(req.body)
    const id = req.decoded._id
    const newCategory = new Category({
      ...req.body,
      createdBy: id, 
      updatedBy: id
    })
  
    newCategory.save(async (error, category) => {
      if (error) {
        res.status(400).json({message: error})
      } else {
        res.status(201).json(category)
        // populate to this user categories array
        await User.updateOne({_id: id}, {$push: {categories: category}})
      }
    })
  } catch(err) {
    res.status(400).json({message: err.details[0].message})
  }

}

// Get Single category
const getCategory = async (req, res) => {
  const id = req.decoded._id
  try {
    const category = await Category.findOne(
      { _id: req.params.id, createdBy: id}
    )
    .populate('createdBy', 'username')
    .populate({
      'path': 'todos', // populate todos
      'select': 'title createdOn', // only display title and createdOn
      'options': {
        sort: { createdOn: -1 } //sort createdOn from latest to old
      }
    })

    if(category) {
      res.status(200).json(category)
    } else {
      res.status(404).json({message: 'No such category'})
      const error = new Error('No such category')
      next(error)
    }
  } catch(err) {
    res.status(400).json({message: err.details[0].message})
  }
}

// Update category
const updateCategory = async (req, res) => {
  const id = req.decoded._id
  try {
    await categorySchema.validate(req.body)
    const updateCategory = {
      ...req.body,
      updatedOn: (new Date()).toLocaleString(), // toLocalString() 将 greenwich timezone change to local timezone
      updatedBy: id,
    }
    // { $set: updateCategory} only update the corresponding field from ...req.body and map the modified date and person
    // { createdOn, createdBy } won't be change
    const cateogry = await Category.findOneAndUpdate({_id: req.params.id, createdBy: id}, { $set: updateCategory}, { new: true }).populate('updatedBy', 'username')
    if (cateogry !== null) {
      res.status(200).json(cateogry)
    }  else {
      res.status(404).json({message: 'No such cateogry'})
    }
  } catch(err) {
    res.status(400).json({message: err.details[0].message})
  }
}

// Delete category
const deleteCategory = async (req, res) => {
  const id = req.decoded._id
  
  try {
    const category = await Category.findOne({_id: req.params.id, createdBy: id})
    if(category) {
      // Find all todos based current category
      const todosArr = await Todo.find({category: req.params.id, createdBy: id})
      // Get all todos _id in order for User updating one to pull those todos
      const todos = todosArr.map(todo => todo._id)
      category.remove()
      res.status(200).json({message: `"${category.title}" has been deleted, nor its todos`})
      // After delete category, need remove from the user categories array as well, and the related todos
      await User.updateOne({_id: id}, {$pull: {categories: { $in: req.params.id}, todos: {$in: todos}}})
      // After delete the category, need remove all todos for this category
      await Todo.deleteMany({category: req.params.id})
      
    } else {
      res.status(404).json({message: 'No such category'})
    }
  } catch(err) {
    res.status(400).json({message: err.details[0].message})
  }
}



module.exports = {
  getAllCategories,
  getCategory,
  newCategory,
  updateCategory,
  deleteCategory
}