const utils = require('../middleware/utils')
const emailer = require('../middleware/emailer')
const services = require('../services/user.service')

exports.getAll = async (req, res) => {
  try {
    const result = await services.getUsers(req)
    res.status(200).json(result)
  } catch (error) {
    utils.handleError(res, error)
  }
}

exports.getById = async (req, res) => {
  try {
    const id = await utils.isIDGood(req.params.id)
    const result = await services.getUserById(id)
    res.status(200).json(result)
  } catch (error) {
    utils.handleError(res, error)
  }
}

// exports.updateItem = async (req, res) => {
//   try {
//     const id = await utils.isIDGood(req.params.id)
//     const doesEmailExists = await emailer.emailExistsExcludingMyself(
//       id,
//       req.body.email
//     )
//     if (!doesEmailExists) {
//       res.status(200).json(await db.updateItem(id, model, req))
//     }
//   } catch (error) {
//     utils.handleError(res, error)
//   }
// }

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
