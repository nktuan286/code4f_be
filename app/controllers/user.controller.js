const utils = require('../middleware/utils')
const emailer = require('../middleware/emailer')
const auth = require('../middleware/auth')
const services = require('../services/user.service')

exports.getAll = async (req, res) => {
  try {
    const result = await services.getUsers(req)
    res.status(200).json(result)
  } catch (error) {
    utils.handleError(res, error)
  }
}

exports.getByUsername = async (req, res) => {
  try {
    const { username } = req.params
    const result = await services.getUserByUsername(username)
    res.status(200).json(result)
  } catch (error) {
    utils.handleError(res, error)
  }
}

exports.update = async (req, res) => {
  try {
    const { username } = req.params
    await services.checkOwnership(username, req.user)
    const result = await services.updateUser(username, req.body)
    res.status(200).json({ data: result, msg: 'UPDATE_SUCCESSFUL' })
  } catch (error) {
    utils.handleError(res, error)
  }
}

exports.create = async (req, res) => {
  try {
    const doesEmailExists = await emailer.emailExists(req.body.email)
    if (!doesEmailExists) {
      const result = await services.createUser(req)
      res.status(201).json(result)
    }
  } catch (error) {
    utils.handleError(res, error)
  }
}

// exports.deleteUser = async (req, res) => {
//   try {
//     req = matchedData(req)
//     const id = await utils.isIDGood(req.id)
//     res.status(200).json(await db.deleteItem(id, model))
//   } catch (error) {
//     utils.handleError(res, error)
//   }
// }
