const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const ReplyCommentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true
    },
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

ReplyCommentSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('ReplyComment', ReplyCommentSchema)
