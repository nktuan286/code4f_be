const utils = require('../middleware/utils')
const services = require('../services/comment.service')

exports.create = async (req, res) => {
  try {
    const result = await services.createComment(req)
    res.status(201).json(result)
  } catch (error) {
    utils.handleError(res, error)
  }
}

exports.reply = async (req, res) => {
  try {
    const result = await services.replyComment(req)
    res.status(201).json(result)
  } catch (error) {
    utils.handleError(res, error)
  }
}
