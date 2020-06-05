const model = require('../models/article')
const utils = require('../middleware/utils')
const db = require('../middleware/db')

/**
 * Creates article
 * @param {Object} req - request object
 */
exports.createArticle = async req => {
  return new Promise((resolve, reject) => {
    const { title, hashtags, contents } = req.body
    const { _id } = req.user
    const article = new model({
      title,
      hashtags,
      contents,
      createdBy: _id
    })
    article.save((err, item) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }
      resolve(item)
    })
  })
}

/**
 * get articles
 * @param {Object} req - request object
 */
exports.getArticles = async req => {
  const options = await db.listInitOptions(req)
  const populates = {
    populate: {
      path: 'createdBy',
      select: '_id name email'
    }
  }
  const query = await db.checkQueryString(req.query)
  return new Promise((resolve, reject) => {
    model.paginate(query, { ...options, ...populates }, (err, items) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }
      resolve(items)
    })
  })
}

/**
 * get article by id
 * @param {Object} req - request object
 */
exports.getArticleById = async id => {
  return new Promise((resolve, reject) => {
    model
      .findOne({ _id: id })
      .populate({
        path: 'createdBy',
        select: '_id name email'
      })
      .exec((err, item) => {
        utils.itemNotFound(err, item, reject, 'NOT_FOUND')
        resolve(item)
      })
  })
}
