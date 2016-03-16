
var jwt = require('jwt-simple');
var config = require('../services/config');
var moment = require('moment');


module.exports = function(req, res, next) {
 var authorizationHeader = req.headers.Authorization || req.headers.authorization;
 if (!req.headers || !authorizationHeader) {
   return res.forbidden({error: 'You are not authorized yet'});
 }

 var token = authorizationHeader.split(' ')[1];
 token = token.trim();
 sails.log.info('token to be decoded: ', token);
 var payload = jwt.decode(token, 'config.JWTTOKEN_SECRET');
 sails.log('payload.sub: ', payload.sub);

 // config.TOKEN_VALID_DAYS
 // var today = moment().unix();

 if (!payload.sub || moment.unix(payload.exp).isBefore(moment().unix())) {  // || moment(payload.exp).isBefore(today)
   //
   req.session.userId = null;
   req.session.authenticated = false;
   return res.forbidden({error: 'Access is forbidden'});
 }
 req.session.authenticated = true;
 // if the session does not have user info, get it from payload - JWT
 if (!req.session.userId || !req.session.user) {
   req.session.userId = payload.sub;
   req.session.user = payload;
 }

 next();

}
