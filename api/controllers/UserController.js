/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var authService = require('../services/authService');

module.exports = {
	// user has been authenticated with third party on mobile devices
	mobileThirdPartyLogin: function(req, res, next) {
		var email = req.body.email;
		sails.log.info('email: ', email);

		return authService.mobileAppAuth(req, res);
	},

	localAuth: function(req, res, next) {
		return authService.localAuth(req, res);
	}
};
