const validate = require('../validation/auth.validate')
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
 * Auth routes
 */

/*
 * Register route
 */
router.post(
  '/register',
  trimRequest.all,
  validate.register,
  AuthController.register
)

/*
 * Verify route
 */
router.post('/verify', trimRequest.all, validate.verify, AuthController.verify)

/*
 * Forgot password route
 */
router.post(
  '/forgot',
  trimRequest.all,
  validate.forgotPassword,
  AuthController.forgotPassword
)

/*
 * Reset password route
 */
router.post(
  '/reset',
  trimRequest.all,
  validate.resetPassword,
  AuthController.resetPassword
)

/*
 * Get new refresh token
 */
router.get(
  '/token',
  requireAuth,
  AuthController.roleAuthorization(['visitor', 'admin']),
  trimRequest.all,
  AuthController.getRefreshToken
)

/*
 * Login route
 */
router.post('/login', trimRequest.all, validate.login, AuthController.login)

module.exports = router
