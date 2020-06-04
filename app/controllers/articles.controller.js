const { matchedData } = require('express-validator')
const utils = require('../middleware/utils')
const services = require('../services/article.service')

/**
 * Get items function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.get = async (req, res) => {
  try {
    const result = await services.getArticles(req)
    res.status(200).json(result)
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Get item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getById = async (req, res) => {
  try {
    req = matchedData(req)
    const id = await utils.isIDGood(req.id)
    const result = await services.getArticleById(id)
    res.status(200).json(result)
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Create item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.create = async (req, res) => {
  try {
    req = matchedData(req)
    const result = await services.createArticle(req)
    res.status(201).json(result)
  } catch (error) {
    utils.handleError(res, error)
  }
}
