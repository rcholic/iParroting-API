var config = require('./config');
var jwt = require('jwt-simple');
var moment = require('moment');
var bcrypt = require('bcrypt-nodejs');
var userServices = require('./userServices');

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
  sails.log.info('user: ', user);
  User.findOneByEmail(user.email, function(err, foundUser) {

    if (err) {
      sails.log.error('real err: ', err);
      // TODO:
      return res.serverError({error: 'Login error'});
    }

    if (foundUser && !user.isLocal) {
        sails.log.info('foundUser: ', foundUser);
        payload.sub = foundUser.id || '';

        // req.session.user = payload;
        req.session.userId = payload.sub; // user id
        req.session.authenticated = true; // for policy to use
        var token = jwt.encode(payload, config.JWTTOKEN_SECRET);
        return res.ok({token: token, userInfo: userServices.secureUserObjStrip(foundUser)});

    } else if (foundUser && user.isLocal) {
          // check on password
          sails.log.info('foundUser local! checking password!');
          bcrypt.compare(user.password, foundUser.password, function(err, response) {
             if (!response) {
                 return res.serverError({error: 'Email and/or password is wrong'});
             } else {
                 // req.session.user = payload;
                 payload.sub = foundUser.id;
                 req.session.userId = payload.sub; // user id
                 req.session.authenticated = true; // for policy to use
                 var token = jwt.encode(payload, config.JWTTOKEN_SECRET);
                 sails.log.info('generating token: ', token);
                 return res.ok({token: token, userInfo: userServices.secureUserObjStrip(foundUser)});
             }
          });

        } else if(!foundUser && !user.isLocal) {
          // did not find user, create a new user for him/her
          payload.password = 'in1tial1'; // TODO: change this to another complex initial password
          User.create(payload).exec(function created(err, newUser) {
            if (newUser) {
              sails.log.info('created new user: ', newUser);
              payload.sub = newUser.id;

              // req.session.user = payload;
              req.session.userId = payload.sub; // user id
              req.session.authenticated = true; // for policy to use
              var token = jwt.encode(payload, config.JWTTOKEN_SECRET);
              return res.ok({token: token, userInfo: userServices.secureUserObjStrip(foundUser)});

            }
          });
      } else if(!foundUser && user.isLocal) {
          return res.serverError({error: 'Log in failed'});
      }
  });

};

module.exports = createSendToken;
