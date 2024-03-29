const ArticleController = require('../controllers/article.controller')
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
 * Articles routes
 */

/*
 * Get articles route
 */
router.get('/', trimRequest.all, ArticleController.getAll)

/*
 * Create new article route
 */
router.post(
  '/',
  requireAuth,
  AuthController.roleAuthorization(['admin', 'creator']),
  trimRequest.all,
  // validate.createItem,
  ArticleController.create
)

/*
 * like article route
 */
router.put(
  '/:id',
  requireAuth,
  AuthController.roleAuthorization(['admin', 'creator']),
  trimRequest.all,
  // validate.createItem,
  ArticleController.like
)

/*
 * Get article route
 */
router.get(
  '/:id',
  trimRequest.all,
  // validate.getItem,
  ArticleController.getById
)

module.exports = router
