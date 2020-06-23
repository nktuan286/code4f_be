const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const ArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    hashtags: {
      type: Array,
      required: true
    },
    contents: {
      type: String,
      required: true
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
      }
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    views: {
      type: Number,
      default: 0
    },
    status: {
      type: Boolean,
      default: false
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

ArticleSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('Article', ArticleSchema)
