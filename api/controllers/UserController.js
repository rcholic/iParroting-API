/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var localAuth = require('../services/localAuth');

module.exports = {
	// user has been authenticated with third party on mobile devices
	mobileThirdPartyLogin: function(req, res, next) {
		var email = req.params.all().email || 'hello';
		var email2 = req.body.email || 'hello2';
		sails.log.info('email: ', email);
		sails.log.info('email2: ', email2);

		// return res.ok({data: email2});
		return localAuth.mobileAppAuth(req, res);
	}
};
