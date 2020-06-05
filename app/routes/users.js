const UserController = require('../controllers/users.controller')
const validate = require('../validation/users.validate')
const AuthController = require('../controllers/auth.controller')
const express = require('express')
const router = express.Router()
require('../../config/passport')
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', {
  session: false
})
const trimRequest = require('trim-request')

/*
 * Users routes
 */

/*
 * Get items route
 */
router.get(
  '/',
  requireAuth,
  AuthController.roleAuthorization(['admin']),
  trimRequest.all,
  UserController.getAll
)

/*
 * Create new item route
 */
router.post(
  '/',
  requireAuth,
  AuthController.roleAuthorization(['admin']),
  trimRequest.all,
  // validate.createItem,
  UserController.create
)

/*
 * Get item route
 */
router.get('/:id', trimRequest.all, UserController.getById)

/*
 * Update item route
 */
// router.patch(
//   '/:id',
//   requireAuth,
//   AuthController.roleAuthorization(['admin']),
//   trimRequest.all,
//   validate.updateItem,
//   UserController.updateItem
// )

/*
 * Delete item route
 */
// router.delete(
//   '/:id',
//   requireAuth,
//   AuthController.roleAuthorization(['admin']),
//   trimRequest.all,
//   validate.deleteItem,
//   UserController.deleteItem
// )

module.exports = router
