const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const FollowingSchema = new mongoose.Schema(
  {
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

FollowingSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('Following', FollowingSchema)
