const model = require('../models/article')
const utils = require('../middleware/utils')
const db = require('../middleware/db')

/**
 * Creates article
 * @param {Object} req - request object
 */
exports.createArticle = async req => {
  return new Promise((resolve, reject) => {
    const article = new model({
      title: req.name,
      hashtags: req.hashtags,
      contents: req.contents
    })
    article.save((err, item) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }
      resolve(item.toObject())
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
    populate: 'createdBy'
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
      .populate('createdBy')
      .exec((err, item) => {
        utils.itemNotFound(err, item, reject, 'NOT_FOUND')
        resolve(item)
      })
  })
}
