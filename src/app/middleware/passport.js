const jwt = require('jsonwebtoken');
const passport = require('passport');

const passportAuth = passport.authenticate('jwt', { session: false });

function Sign(data, secret, useNewToken = false) {
  const token = useNewToken ? jwt.sign({ email: data }, secret, { expiresIn: '14d' }) : jwt.sign(data, secret);

  return token;
}

function sign(payload, secret) {
  return jwt.sign(payload, secret, { expiresIn: '14d' });
}

module.exports = {
  passportAuth,
  Sign,
  sign
};
