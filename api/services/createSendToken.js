var config = require('./config');
var jwt = require('jwt-simple');
var moment = require('moment');

var createSendToken = function(user, req, res) {
  var payload = {
    email: user.email || '',
    sub: user.id || '',
    provider: user.provider || 'local',
    iat: moment().unix(),
    authToken: user.thirdPartyAuthToken,
    exp: moment().add(config.TOKEN_VALID_DAYS, 'days').unix()
  };
  req.session.user = user;
  req.session.authenticated = true; // for policy to use
  var token = jwt.encode(payload, 'config.JWTTOKEN_SECRET');
  return res.ok({data: token});
};

module.exports = createSendToken;
