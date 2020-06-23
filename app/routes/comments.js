const CommentController = require('../controllers/comment.controller')
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
 * Send comment
 */
router.post(
  '/',
  requireAuth,
  AuthController.roleAuthorization(['admin', 'creator']),
  trimRequest.all,
  // validate.createItem,
  CommentController.create
)

/*
 * Reply comment
 */
router.post(
  '/reply',
  requireAuth,
  AuthController.roleAuthorization(['admin', 'creator']),
  trimRequest.all,
  // validate.createItem,
  CommentController.reply
)

module.exports = router
