// model
const Todo = require('../models/Todo')
const User = require('../models/User')
const Category = require('../models/Category')

// Joi validator
const Joi = require('joi')

const todoCriteriaSchema = Joi.object({
  after: Joi.date().iso().max(Joi.ref('before')),
  before: Joi.date().iso().min(Joi.ref('after')),
  page: Joi.number().integer().min(1),
  perPage: Joi.number().integer().min(1),
  sortBy: Joi.string().valid('createdOn','start', 'end', 'category'),
  sortOrder: Joi.string().valid('asc', 'desc', 'ASC', 'DESC'),
  isComplete: Joi.boolean(),
  category: Joi.string(),
}).options({ abortEarly: true })


// get top one user todo infos
const topOne = async (req, res) => {
  try {
    // TODO: in the future, need filter via query
    // Example, a period of time for topOneUser, topOne for total? total only for specifict field?
    const topOneUser = await User.find({ roles: 'user' }, 'username avatar todos categories', { sort: { todos: -1 }, limit: 1 })
    .populate('todos', 'isComplete category')
    .populate('categories', 'createdOn title color')
    
    const infoLength = (key, value) => {
      return topOneUser[0]['todos'].filter(todo => todo[key] === value).length
    }
    
    const username = topOneUser[0]['username']
    const avatar = topOneUser[0]['avatar']
    const todos = topOneUser[0]['todos']
    const categories = topOneUser[0]['categories']
    const todoLength = topOneUser[0]['todos'].length
    const totalComplete = infoLength('isComplete', true)
    const totalInComplete = todoLength - totalComplete
    // const totalWorkCat = infoLength('category', 'Work')
    // const totalDailylifeCat = infoLength('category', 'Daily life')
    // const totalEntertaimentCat = todoLength - totalWorkCat - totalDailylifeCat

    res.status(200).json({
      username,
      avatar,
      todoLength,
      totalComplete,
      totalInComplete,
      todos,
      categories
      // totalDailylifeCat,
      // totalWorkCat,
      // totalEntertaimentCat
    })

  } catch(err) {
    res.status(400).json({message: err.details[0].message})
  }
}
// get top one user todo infos
// TODO: merge with topOne?

const topTen = async (req, res) => {
  const criteria = req.query
  // set Default
  let { perPage, sortBy = 'createdOn', sortOrder = 'asc', page = 1  } = criteria
  // const {value, error } =  
  // if (error) res.status(401).json(error['details'][0]['message'])
  // else {

    try {
      await todoCriteriaSchema.validate(criteria)
      // build filter object
      
      // TODO: in the future, need filter via query
      // Example, a period of time for topOneUser, topOne for total? total only for specifict field?
      // Year/month
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
  
      // category could be filter like checkbox, multiple cateogry filter at the same time
      if (criteria.category) {
        category = criteria.category.split(',')
        filter.category = { $in: category }
      }

      let sortStr = `${sortOrder.toLowerCase() === 'asc' ? '' : '-'}${sortBy}`
      // query records

  
      const topTenUsers = await User.find({roles: 'user' }, 'username avatar todos categories', { sort: { todos: -1 }, limit: 10 })
                                    .populate({path: 'todos', model: 'Todo', select: 'createdOn isComplete category start end', match: { ...filter }, options: { limit: perPage, skip: (page -1) * perPage, sort: sortStr  }})
                                    .populate({path: 'categories', model: 'Category', select: 'createdOn title color'})
      const topTenUsersData = []
      for(const user of topTenUsers) {
        // now filter todos, if todos length is 0 will not return their user as well
        if (user['todos'].length >= 0) {
          const infoLength = (key, value) => {
            return user['todos'].filter(todo => todo[key] === value).length
          }
          const username = user['username']
          const todos = user['todos'];
          const categories = user['categories']
          const avatar = user['avatar']
          const total = user['todos'].length
          const totalComplete = infoLength('isComplete', true)
          const totalInComplete = total - totalComplete
          // const totalWorkCat = infoLength('category', 'Work')
          // const totalDailylifeCat = infoLength('category', 'Daily life')
          // const totalEntertaimentCat = total - totalWorkCat - totalDailylifeCat
          const userData = {
            data: {
              filter: criteria,
              total,
              totalComplete,
              totalInComplete,
              // totalDailylifeCat,
              // totalWorkCat,
              // totalEntertaimentCat
            },
            username,
            avatar,
            todos,
            categories
          }
          topTenUsersData.push(userData)
        }
      }
      res.status(200).json(topTenUsersData)
    } catch(err) {
      res.status(400).json({message: err.details[0].message})
    }
 //}
}




const users = async (req, res) => {
  try {
    const id = await req.decoded._id
    // get all users
    const allUsers = await User.find({}, 'username avatar')
    const allUsersLength = allUsers.length
    // get all non-admin users
    const allNonAdminUsers = await User.find({ roles: 'user' }, 'username avatar')
    const allNonAdminUsersLength = allNonAdminUsers.length
    // get all admin users include current admin
    const allAdminUsers = await User.find({ roles: 'admin' }, 'username avatar')
    const allAdminUsersLength = allAdminUsers.length
    // get all admin users exclude current admin
    const allNotMeAdminUsers = await User.find({ roles: 'admin', _id: { $nin : id} }, 'username avatar')
    const allNotMeAdminUsersLength = allNotMeAdminUsers.length

    res.status(200).json({
      allUsers: { length: allUsersLength, users: allUsers },
      allNonAdminUsers: { length: allNonAdminUsersLength, users: allNonAdminUsers },
      allAdminUsers: { length: allAdminUsersLength, users: allAdminUsers },
      allNotMeAdminUsers: { length: allNotMeAdminUsersLength, users: allNotMeAdminUsers },
    })
  } catch(err) {
    res.status(400).json({message: err.details[0].message})
  }
}

module.exports = {
  topOne,
  topTen,
  users
}