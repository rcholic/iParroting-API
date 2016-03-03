
var jwt = require('jwt-simple');
var config = require('../services/config');


module.exports = function(req, res, next) {
 if (!req.headers || !req.headers.Authorization) {
   return res.forbidden({error: 'You are not authorized yet'});
 }

 var token = req.headers.Authorization.split(' ')[1];
 var payload = jwt.decode(token, config.JWTTOKEN_SECRET);

 // config.TOKEN_VALID_DAYS
 var today = moment();
 if (!payload.sub || !payload.authToken || moment.unix(payload.exp).isBefore(today)) {
   return res.forbidden({error: 'Access is forbidden'});
 }

 // if the session does not have user info, get it from payload - JWT
 if (!req.session.userId || !req.session.user) {
   req.session.userId = payload.sub;
   req.session.user = payload;
 }

 next();

}
