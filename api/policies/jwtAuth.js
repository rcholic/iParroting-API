
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
 if (!payload.sub || !payload.authToken || moment.unix(payload.exp).isAfter(today)) {
   return res.forbidden({error: 'Access is forbidden'});
 }

 next();

}
