const jwt = require('jsonwebtoken')
const secret = process.env.JWT_TOKEN
const User = require('../models/user')
require('dotenv').config()

const WithAuth = (req, res, next) => {
  const token = req.headers['x-access-token']
  if (!token) {
    res.status(401).json({ error: 'Unauthorized: no token provided' })
  } else {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        res.status(401).json({ error: 'Unauthorized: token invalid' })
      } else {
        res.email = decoded.email
        User.findOne({ email: decoded.email })
          .then(user => {
            req.user = user
            next()
          })
          .catch(error => {
            res.status(401).json({ error })
          })
      }
    })
  }
}


module.exports = WithAuth