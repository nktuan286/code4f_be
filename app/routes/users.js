const UserController = require('../controllers/user.controller')
// const validate = require('../validation/users.validate')
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
router.get('/:username', trimRequest.all, UserController.getByUsername)

/*
 * Update item route
 */
router.put(
  '/:username',
  requireAuth,
  AuthController.roleAuthorization(['admin', 'creator']),
  trimRequest.all,
  // validate.updateItem,
  UserController.update
)

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
