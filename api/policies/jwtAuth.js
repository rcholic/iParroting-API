
var jwt = require('jwt-simple');
var config = require('../services/config');


module.exports = function(req, res, next) {
 var authorizationHeader = req.headers.Authorization || req.headers.authorization;
 if (!req.headers || !authorizationHeader) {
   return res.forbidden({error: 'You are not authorized yet'});
 }

 var token = authorizationHeader.split(' ')[1];
 token = token.trim();
 sails.log.info('token to be decoded: ', token);
 var payload = jwt.decode(JSON.stringify(token), config.JWTTOKEN_SECRET);

 // config.TOKEN_VALID_DAYS
 var today = moment();
 if (!payload.sub || !payload.authToken || moment.unix(payload.exp).isBefore(today)) {
   req.session.userId = null;
   req.session.authenticated = false;
   return res.forbidden({error: 'Access is forbidden'});
 }

 // if the session does not have user info, get it from payload - JWT
 if (!req.session.userId || !req.session.user) {
   req.session.userId = payload.sub;
   req.session.user = payload;
 }

 next();

}
