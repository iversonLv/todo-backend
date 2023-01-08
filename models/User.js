const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  username: { type: String, required: true, trim: true, match: /(^[a-zA-Z0-9_]*$)/, unique: true, maxlength: 30, minlength: 2 },
  password: { type: String, required: true, trim: true, minlength: 10 },
  roles: { type: [String], default: 'user', enum: ['user','admin']},
  todos: [{ type: Schema.Types.ObjectId, ref: 'Todo' }],
  categories: [{ type: Schema.Types.ObjectId, ref: 'Category'}],
  avatar: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User'},
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User'},
}, {timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' }})

UserSchema.index({ username: 'text' });

module.exports = mongoose.model('User', UserSchema)