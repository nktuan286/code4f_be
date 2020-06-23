const commentModel = require('../models/comment')
const replyCommentModel = require('../models/replyComment')
const articleModel = require('../models/article')
const utils = require('../middleware/utils')

/**
 * send comment
 * @param {Object} req - request object
 */
exports.createComment = req => {
  return new Promise((resolve, reject) => {
    const { _id } = req.user
    const comment = new commentModel({
      content: req.body.content,
      sentBy: _id
    })
    comment.save((err, item) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }
      articleModel.findOneAndUpdate(
        {
          _id: req.body.articleId
        },
        {
          $push: {
            comments: item._id
          }
        },
        {
          new: true,
          runValidators: true
        },
        (error, i) => {
          utils.itemNotFound(error, i, reject, 'NOT_FOUND')
          resolve(item)
        }
      )
    })
  })
}

/**
 * reply comment
 * @param {Object} req - request object
 */
exports.replyComment = req => {
  return new Promise((resolve, reject) => {
    const { _id } = req.user
    const replyComment = new replyCommentModel({
      content: req.body.content,
      sentBy: _id
    })
    replyComment.save((err, item) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }
      commentModel.findOneAndUpdate(
        {
          _id: req.body.commentId
        },
        {
          $push: {
            replies: item._id
          }
        },
        {
          new: true,
          runValidators: true
        },
        (error, i) => {
          utils.itemNotFound(error, i, reject, 'NOT_FOUND')
          resolve(item)
        }
      )
    })
  })
}
