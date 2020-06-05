const utils = require('../middleware/utils')
const services = require('../services/article.service')

exports.getAll = async (req, res) => {
  try {
    const result = await services.getArticles(req)
    res.status(200).json(result)
  } catch (error) {
    utils.handleError(res, error)
  }
}

exports.getById = async (req, res) => {
  try {
    const id = await utils.isIDGood(req.params.id)
    const result = await services.getArticleById(id)
    res.status(200).json(result)
  } catch (error) {
    utils.handleError(res, error)
  }
}

exports.create = async (req, res) => {
  try {
    const result = await services.createArticle(req)
    res.status(201).json(result)
  } catch (error) {
    utils.handleError(res, error)
  }
}
