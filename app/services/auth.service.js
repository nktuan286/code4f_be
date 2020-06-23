const jwt = require('jsonwebtoken')
const User = require('../models/user')
const UserAccess = require('../models/userAccess')
const ForgotPassword = require('../models/forgotPassword')
const Role = require('../models/role')
const utils = require('../middleware/utils')
const uuid = require('uuid')
const { addHours } = require('date-fns')
const auth = require('../middleware/auth')
const HOURS_TO_BLOCK = 1
const LOGIN_ATTEMPTS = 10

/**
 * Generates a token
 * @param {Object} user - user object
 */
exports.generateToken = user => {
  // Gets expiration time
  const expiration =
    Math.floor(Date.now() / 1000) + 60 * process.env.JWT_EXPIRATION_IN_MINUTES

  // returns signed and encrypted token
  return auth.encrypt(
    jwt.sign(
      {
        data: {
          _id: user
        },
        exp: expiration
      },
      process.env.JWT_SECRET
    )
  )
}

/**
 * Creates an object with user info
 * @param {Object} req - request object
 */
exports.setUserInfo = req => {
  let user = {
    _id: req._id,
    name: req.name,
    username: req.username,
    avatar: req.avatar,
    bio: req.bio,
    country: req.country,
    email: req.email,
    verified: req.verified
  }
  // Adds verification for testing purposes
  if (process.env.NODE_ENV !== 'production') {
    user = {
      ...user,
      verification: req.verification
    }
  }
  return user
}

/**
 * Saves a new user access and then returns token
 * @param {Object} req - request object
 * @param {Object} user - user object
 */
exports.saveUserAccessAndReturnToken = async (req, user) => {
  return new Promise((resolve, reject) => {
    const userAccess = new UserAccess({
      email: user.email,
      ip: utils.getIP(req),
      browser: utils.getBrowserInfo(req),
      country: utils.getCountry(req)
    })
    userAccess.save(err => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }
      const userInfo = this.setUserInfo(user)
      // Returns data with access token
      resolve({
        token: this.generateToken(user._id),
        user: userInfo
      })
    })
  })
}

/**
 * Blocks a user by setting blockExpires to the specified date based on constant HOURS_TO_BLOCK
 * @param {Object} user - user object
 */
exports.blockUser = async user => {
  return new Promise((resolve, reject) => {
    user.blockExpires = addHours(new Date(), HOURS_TO_BLOCK)
    user.save((err, result) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }
      if (result) {
        resolve(utils.buildErrObject(409, 'BLOCKED_USER'))
      }
    })
  })
}

/**
 * Saves login attempts to dabatabse
 * @param {Object} user - user object
 */
exports.saveLoginAttemptsToDB = async user => {
  return new Promise((resolve, reject) => {
    user.save((err, result) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }
      if (result) {
        resolve(true)
      }
    })
  })
}

/**
 * Checks that login attempts are greater than specified in constant and also that blockexpires is less than now
 * @param {Object} user - user object
 */
exports.blockIsExpired = user =>
  user.loginAttempts > LOGIN_ATTEMPTS && user.blockExpires <= new Date()

/**
 *
 * @param {Object} user - user object.
 */
exports.checkLoginAttemptsAndBlockExpires = async user => {
  return new Promise((resolve, reject) => {
    // Let user try to login again after blockexpires, resets user loginAttempts
    if (this.blockIsExpired(user)) {
      user.loginAttempts = 0
      user.save((err, result) => {
        if (err) {
          reject(utils.buildErrObject(422, err.message))
        }
        if (result) {
          resolve(true)
        }
      })
    } else {
      // User is not blocked, check password (normal behaviour)
      resolve(true)
    }
  })
}

/**
 * Checks if blockExpires from user is greater than now
 * @param {Object} user - user object
 */
exports.userIsBlocked = async user => {
  return new Promise((resolve, reject) => {
    if (user.blockExpires > new Date()) {
      reject(utils.buildErrObject(409, 'BLOCKED_USER'))
    }
    resolve(true)
  })
}

/**
 * Finds user by email
 * @param {string} email - user´s email
 */
exports.findUser = async email => {
  return new Promise((resolve, reject) => {
    User.findOne({ email })
      .select(
        'password loginAttempts blockExpires name email role verified verification'
      )
      .populate('role')
      .exec((err, item) => {
        utils.itemNotFound(err, item, reject, 'USER_DOES_NOT_EXIST')
        resolve(item)
      })
  })
}

/**
 * Finds user by ID
 * @param {string} id - user´s id
 */
exports.findUserById = async userId => {
  return new Promise((resolve, reject) => {
    User.findById(userId, (err, item) => {
      utils.itemNotFound(err, item, reject, 'USER_DOES_NOT_EXIST')
      resolve(item)
    })
  })
}

/**
 * Adds one attempt to loginAttempts, then compares loginAttempts with the constant LOGIN_ATTEMPTS, if is less returns wrong password, else returns blockUser function
 * @param {Object} user - user object
 */
exports.passwordsDoNotMatch = async user => {
  user.loginAttempts += 1
  await this.saveLoginAttemptsToDB(user)
  return new Promise((resolve, reject) => {
    if (user.loginAttempts <= LOGIN_ATTEMPTS) {
      resolve(utils.buildErrObject(409, 'WRONG_PASSWORD'))
    } else {
      resolve(this.blockUser(user))
    }
    reject(utils.buildErrObject(422, 'ERROR'))
  })
}

/**
 * Registers a new user in database
 * @param {Object} req - request object
 */
exports.registerUser = async req => {
  return new Promise(async (resolve, reject) => {
    const { _id } = await Role.findOne({ name: 'creator' })
      .lean()
      .exec()
    const username = req.body.email
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      username: username.substring(0, username.indexOf('@')) || '',
      password: req.body.password,
      role: _id,
      verification: uuid.v4()
    })
    user.save((err, item) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }
      resolve(item)
    })
  })
}

/**
 * Builds the registration token
 * @param {Object} item - user object that contains created id
 * @param {Object} userInfo - user object
 */
exports.returnRegisterToken = (item, userInfo) => {
  if (process.env.NODE_ENV !== 'production') {
    userInfo.verification = item.verification
  }
  return userInfo
}

/**
 * Checks if verification id exists for user
 * @param {string} id - verification id
 */
exports.verificationExists = async id => {
  return new Promise((resolve, reject) => {
    User.findOne(
      {
        verification: id,
        verified: false
      },
      (err, user) => {
        utils.itemNotFound(err, user, reject, 'NOT_FOUND_OR_ALREADY_VERIFIED')
        resolve(user)
      }
    )
  })
}

/**
 * Verifies an user
 * @param {Object} user - user object
 */
exports.verifyUser = async user => {
  return new Promise((resolve, reject) => {
    user.verified = true
    user.save((err, item) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }
      resolve({
        email: item.email,
        verified: item.verified
      })
    })
  })
}

/**
 * Checks if email is not verified yet
 * @param {Object} user - user object
 */
exports.checkVerified = async user => {
  return new Promise((resolve, reject) => {
    if (!user.verified) {
      reject(utils.buildErrObject(409, 'EMAIL_IS_NOT_VERIFIED'))
    }
    resolve(true)
  })
}

/**
 * Marks a request to reset password as used
 * @param {Object} req - request object
 * @param {Object} forgot - forgot object
 */
exports.markResetPasswordAsUsed = async (req, forgot) => {
  return new Promise((resolve, reject) => {
    forgot.used = true
    forgot.ipChanged = utils.getIP(req)
    forgot.browserChanged = utils.getBrowserInfo(req)
    forgot.countryChanged = utils.getCountry(req)
    forgot.save((err, item) => {
      utils.itemNotFound(err, item, reject, 'NOT_FOUND')
      resolve(utils.buildSuccObject('PASSWORD_CHANGED'))
    })
  })
}

/**
 * Updates a user password in database
 * @param {string} password - new password
 * @param {Object} user - user object
 */
exports.updatePassword = async (password, user) => {
  return new Promise((resolve, reject) => {
    user.password = password
    user.save((err, item) => {
      utils.itemNotFound(err, item, reject, 'NOT_FOUND')
      const userInfo = this.setUserInfo(item)
      resolve(userInfo)
    })
  })
}

/**
 * Finds user by email to reset password
 * @param {string} email - user email
 */
exports.findUserToResetPassword = async email => {
  return new Promise((resolve, reject) => {
    User.findOne(
      {
        email
      },
      (err, user) => {
        utils.itemNotFound(err, user, reject, 'NOT_FOUND')
        resolve(user)
      }
    )
  })
}

/**
 * Checks if a forgot password verification exists
 * @param {string} id - verification id
 */
exports.findForgotPassword = async id => {
  return new Promise((resolve, reject) => {
    ForgotPassword.findOne(
      {
        verification: id,
        used: false
      },
      (err, item) => {
        utils.itemNotFound(err, item, reject, 'NOT_FOUND_OR_ALREADY_USED')
        resolve(item)
      }
    )
  })
}

/**
 * Creates a new password forgot
 * @param {Object} req - request object
 */
exports.saveForgotPassword = async req => {
  return new Promise((resolve, reject) => {
    const forgot = new ForgotPassword({
      email: req.body.email,
      verification: uuid.v4(),
      ipRequest: utils.getIP(req),
      browserRequest: utils.getBrowserInfo(req),
      countryRequest: utils.getCountry(req)
    })
    forgot.save((err, item) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }
      resolve(item)
    })
  })
}

/**
 * Builds an object with created forgot password object, if env is development or testing exposes the verification
 * @param {Object} item - created forgot password object
 */
exports.forgotPasswordResponse = item => {
  let data = {
    msg: 'RESET_EMAIL_SENT',
    email: item.email
  }
  if (process.env.NODE_ENV !== 'production') {
    data = {
      ...data,
      verification: item.verification
    }
  }
  return data
}

/**
 * Checks against user if has quested role
 * @param {Object} data - data object
 * @param {*} next - next callback
 */
exports.checkPermissions = async (data, next) => {
  return new Promise((resolve, reject) => {
    const user = User.findOne({ _id: data.id })
      .populate({
        path: 'role',
        select: 'name'
      })
      .lean()

    user
      .then(result => {
        if (data.roles.indexOf(result.role.name) > -1) {
          return resolve(next())
        }
        return reject(utils.buildErrObject(401, 'UNAUTHORIZED'))
      })
      .catch(err => {
        utils.itemNotFound(err, {}, reject, 'NOT_FOUND')
      })
  })
}

/**
 * Gets user id from token
 * @param {string} token - Encrypted and encoded token
 */
exports.getUserIdFromToken = async token => {
  return new Promise((resolve, reject) => {
    // Decrypts, verifies and decode token
    jwt.verify(auth.decrypt(token), process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(utils.buildErrObject(409, 'BAD_TOKEN'))
      }
      resolve(decoded.data._id)
    })
  })
}
