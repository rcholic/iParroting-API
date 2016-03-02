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
		var email = req.body.email;
		sails.log.info('email: ', email);

		return localAuth.mobileAppAuth(req, res);
	}
};
