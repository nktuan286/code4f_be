const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const BookmarkSchema = new mongoose.Schema(
  {
    articles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article'
      }
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

BookmarkSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('Bookmark', BookmarkSchema)
