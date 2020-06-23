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
 * get user by username
 * @param {Object} req - request object
 */
exports.getUserByUsername = async username => {
  return new Promise((resolve, reject) => {
    model
      .findOne({ username })
      .select('name username email bio country')
      .exec((err, item) => {
        utils.itemNotFound(err, item, reject, 'NOT_FOUND')
        resolve(item)
      })
  })
}

/**
 * Update user
 * @param {Object} req - request object
 */
exports.updateUser = async (username, req) => {
  return new Promise((resolve, reject) => {
    const removeUnusedProperties = ({
      // eslint-disable-next-line no-unused-vars
      _id,
      // eslint-disable-next-line no-unused-vars
      email,
      // eslint-disable-next-line no-unused-vars
      role,
      // eslint-disable-next-line no-unused-vars
      verified,
      // eslint-disable-next-line no-unused-vars
      verification,
      // eslint-disable-next-line no-unused-vars
      blockExpires,
      // eslint-disable-next-line no-unused-vars
      loginAttempts,
      // eslint-disable-next-line no-unused-vars
      password,
      ...rest
    }) => rest
    const data = removeUnusedProperties(req)

    model.findOneAndUpdate(
      {
        username
      },
      data,
      {
        new: true,
        runValidators: true
      },
      (err, item) => {
        utils.itemNotFound(err, item, reject, 'NOT_FOUND')
        resolve(item)
      }
    )
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

/**
 * Checks ownership
 * @param {Object} user - user object
 */
exports.checkOwnership = async (submitter, user) => {
  return new Promise((resolve, reject) => {
    if (submitter !== user.username) {
      reject(utils.buildErrObject(409, 'ACCESS_DENIED'))
    }
    resolve(true)
  })
}
