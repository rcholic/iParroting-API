var config = require('./config');
var jwt = require('jwt-simple');
var moment = require('moment');

var createSendToken = function(user, res) {
  var payload = {
    email: user.email || '',
    sub: user.id || '',
    provider: user.provider || 'local',
    iat: moment().unix(),
    authToken: user.thirdPartyAuthToken,
    exp: moment().add(7, 'days').unix()
  };
  var token = jwt.encode(payload, 'config.JWTTOKEN_SECRET');
  return res.ok({data: token});
};

module.exports = createSendToken;
