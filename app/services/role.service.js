const model = require('../models/role')
const utils = require('../middleware/utils')
const db = require('../middleware/db')

exports.getRoles = async req => {
  const options = await db.listInitOptions(req)
  const query = await db.checkQueryString(req.query)
  return new Promise((resolve, reject) => {
    model.paginate(query, options, (err, items) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }
      resolve(items)
    })
  })
}

/**
 * get user by id
 * @param {Object} req - request object
 */
exports.getRoleById = async id => {
  return new Promise((resolve, reject) => {
    model.findOne({ _id: id }).exec((err, item) => {
      utils.itemNotFound(err, item, reject, 'NOT_FOUND')
      resolve(item)
    })
  })
}

/**
 * Creates article
 * @param {Object} req - request object
 */
exports.createRole = async req => {
  return new Promise((resolve, reject) => {
    const role = new model({
      name: req.body.name
    })
    role.save((err, item) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }
      resolve(item)
    })
  })
}
