const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CategorySchema = new Schema({
  title: { type: String, required: true, maxlength: 100 },
  color: { type: String, default: '#fff'},
  // title: { type: String, required: true, default: 'Daily life', enum: ['Daily life', 'Work', 'Entertaiment'] },
  todos: [{ type: Schema.Types.ObjectId, ref: 'Todo' }],
  // users: [{type: Schema.Types.ObjectId, ref: 'User'}],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User'},
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User'},
}, { timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' } })

module.exports = mongoose.model('Category', CategorySchema)
