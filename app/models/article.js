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
        message: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Comment'
        },
        replyMessage: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
          }
        ]
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

ArticleSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('Article', ArticleSchema)
