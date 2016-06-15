var config = require('./config');
var jwt = require('jwt-simple');
var moment = require('moment');

var createSendToken = function(user, req, res) {
  var payload = {
    email: user.email || '',
    sub: '',
    provider: user.provider || 'local',
    iat: moment().unix(),
    authToken: user.thirdPartyAuthToken,
    exp: moment().add(config.TOKEN_VALID_DAYS, 'days').unix()
  };
  // check if the user exists
  User.findOneByEmail(user.email, function(err, foundUser) {

    if (err) {
      sails.log.error('real err: ', err);
    }

    if (foundUser) {
      sails.log.info('foundUser: ', foundUser);
      payload.sub = foundUser.id || '';
    } else if(!foundUser && !user.isLocal) {
      // did not find user, create a new user for him/her
      payload.password = 'in1tial1'; // TODO: change this to another complex initial password
      User.create(payload).exec(function created(err, newUser) {
        if (newUser) {
          sails.log.info('created new user: ', newUser);
          payload.sub = newUser.id;
        }
      });
  } else if(!foundUser && user.isLocal) {
      return res.serverError({error: 'Log in failed'});
  }

    // req.session.user = payload;
    req.session.userId = payload.sub; // user id
    req.session.authenticated = true; // for policy to use
    var token = jwt.encode(payload, 'config.JWTTOKEN_SECRET');
    return res.ok({data: token, userId: payload.sub});
  });

};

module.exports = createSendToken;
