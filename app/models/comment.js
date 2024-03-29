const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const CommentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true
    },
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReplyComment'
      }
    ],
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

CommentSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('Comment', CommentSchema)
