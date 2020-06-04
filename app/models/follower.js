const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const FollowerSchema = new mongoose.Schema(
  {
    followers: [
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

FollowerSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('Follower', FollowerSchema)
