const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TodoSchema = new Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  start: { type: Date, required: true, default: Date.now},
  end: { type: Date, required: true, default: Date.now},
  category: { type: Schema.Types.ObjectId, ref: 'Category'},
  notes: { type: String, maxlength: 200, default: '' },
  // category: { type: String, required: true, default: 'Daily life', enum: ['Daily life', 'Work', 'Entertaiment']},
  isComplete: {type: Boolean, required: true, default: false},
  isImportant: {type: Boolean, required: true, default: false},
  createdBy: { type: Schema.Types.ObjectId, ref: 'User'},
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User'},
}, { timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' } }
)

TodoSchema.index({ title: 'text' });

module.exports = mongoose.model('Todo', TodoSchema)
