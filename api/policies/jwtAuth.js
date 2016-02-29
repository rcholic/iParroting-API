
var jwt = require('jwt-simple');
var config = require('../services/config');


module.exports = function(req, res, next) {
 if (!req.headers || !req.headers.Authorization) {
   return res.forbidden({error: 'You are not authorized yet'});
 }

 var token = req.headers.Authorization.split(' ')[1];
 var payload = jwt.decode(token, config.JWTTOKEN_SECRET);

 if (!payload.sub || !payload.authToken) {
   return res.forbidden({error: 'Access is forbidden'});
 }

 next();

}
