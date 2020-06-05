const model = require('../models/user')
const utils = require('../middleware/utils')
const db = require('../middleware/db')
const uuid = require('uuid')

exports.getUsers = async req => {
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
exports.getUserById = async id => {
  return new Promise((resolve, reject) => {
    model
      .findOne({ _id: id })
      .select('_id name email verified verification phone country')
      .exec((err, item) => {
        utils.itemNotFound(err, item, reject, 'NOT_FOUND')
        resolve(item)
      })
  })
}

/**
 * Creates article
 * @param {Object} req - request object
 */
exports.createUser = async req => {
  return new Promise((resolve, reject) => {
    const user = new model({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role,
      phone: req.body.phone,
      country: req.body.country,
      verification: uuid.v4(),
      verified: true
    })
    user.save((err, item) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }
      // Removes properties with rest operator
      const removeProperties = ({
        // eslint-disable-next-line no-unused-vars
        password,
        // eslint-disable-next-line no-unused-vars
        blockExpires,
        // eslint-disable-next-line no-unused-vars
        loginAttempts,
        ...rest
      }) => rest
      resolve(removeProperties(item))
    })
  })
}
