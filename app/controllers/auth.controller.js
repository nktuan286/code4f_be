const utils = require('../middleware/utils')
const auth = require('../middleware/auth')
const emailer = require('../middleware/emailer')
const services = require('../services/auth.service')

exports.login = async (req, res) => {
  try {
    const user = await services.findUser(req.body.email)
    const expiration =
      Math.floor(Date.now() / 1000) + 60 * process.env.JWT_EXPIRATION_IN_MINUTES
    await services.checkVerified(user)
    await services.userIsBlocked(user)
    await services.checkLoginAttemptsAndBlockExpires(user)
    const isPasswordMatch = await auth.checkPassword(req.body.password, user)
    if (!isPasswordMatch) {
      utils.handleError(res, await services.passwordsDoNotMatch(user))
    } else {
      // all ok, register access and return token
      user.loginAttempts = 0
      await services.saveLoginAttemptsToDB(user)
      const userInfo = await services.saveUserAccessAndReturnToken(req, user)
      await res.cookie('token', userInfo.token, {
        expires: new Date(Date.now() + expiration),
        secure: false, // set to true if your using https
        httpOnly: true
      })
      res.status(200).json({ data: userInfo.user, msg: 'LOGIN_SUCCESSFUL' })
    }
  } catch (error) {
    utils.handleError(res, error)
  }
}

exports.logout = async (req, res) => {
  try {
    await req.logout()
    await res.clearCookie('token')
    res.status(200).json({
      msg: 'LOGOUT_SUCCESSFUL'
    })
  } catch (error) {
    utils.handleError(res, error)
  }
}

exports.register = async (req, res) => {
  try {
    // Gets locale from header 'Accept-Language'
    const locale = req.getLocale()
    const doesEmailExists = await emailer.emailExists(req.body.email)
    if (!doesEmailExists) {
      const item = await services.registerUser(req)
      const userInfo = services.setUserInfo(item)
      const response = services.returnRegisterToken(item, userInfo)
      emailer.sendRegistrationEmailMessage(locale, item)
      res.status(201).json(response)
    }
  } catch (error) {
    utils.handleError(res, error)
  }
}

exports.verify = async (req, res) => {
  try {
    const user = await services.verificationExists(req.body.id)
    res.status(200).json(await services.verifyUser(user))
  } catch (error) {
    utils.handleError(res, error)
  }
}

exports.forgotPassword = async (req, res) => {
  try {
    // Gets locale from header 'Accept-Language'
    const locale = req.getLocale()
    await services.findUser(req.body.email)
    const item = await services.saveForgotPassword(req)
    emailer.sendResetPasswordEmailMessage(locale, item)
    res.status(200).json(services.forgotPasswordResponse(item))
  } catch (error) {
    utils.handleError(res, error)
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const forgotPassword = await services.findForgotPassword(req.body.id)
    const user = await services.findUserToResetPassword(forgotPassword.email)
    await services.updatePassword(req.body.password, user)
    const result = await services.markResetPasswordAsUsed(req, forgotPassword)
    res.status(200).json(result)
  } catch (error) {
    utils.handleError(res, error)
  }
}

exports.changePassword = async (req, res) => {
  try {
    const user = await services.findUser(req.user.email)
    const isPasswordMatch = await auth.checkPassword(
      req.body.currentPassword,
      user
    )
    if (!isPasswordMatch) {
      utils.handleError(res, { code: 409, message: 'PASSWORD_NOT_MATCH' })
    } else {
      const result = await services.updatePassword(req.body.password, user)
      res.status(200).json({ data: result, msg: 'CHANGE_PASSWORD_SUCCESFUL' })
    }
  } catch (error) {
    utils.handleError(res, error)
  }
}

exports.getRefreshToken = async (req, res) => {
  try {
    const tokenEncrypted = req.headers.authorization
      .replace('Bearer ', '')
      .trim()
    let userId = await services.getUserIdFromToken(tokenEncrypted)
    userId = await utils.isIDGood(userId)
    const user = await services.findUserById(userId)
    const token = await services.saveUserAccessAndReturnToken(req, user)
    // Removes user info from response
    delete token.user
    res.status(200).json(token)
  } catch (error) {
    utils.handleError(res, error)
  }
}

exports.roleAuthorization = roles => async (req, res, next) => {
  try {
    const data = {
      id: req.user._id,
      roles
    }
    await services.checkPermissions(data, next)
  } catch (error) {
    utils.handleError(res, error)
  }
}
