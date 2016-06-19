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
	},

	usernameExists: function(req, res, next) {
		var username = req.param('username'); // from url path
		return checkIfUserExists({username: username, email: null}, res);
	},

	emailExists: function(req, res, next) {
		var email = req.param('email');
		return checkIfUserExists({username: null, email: email}, res);
	},
};

var checkIfUserExists = function(userObj, res) {
	var queryObj = {};
	if (!!userObj.email) {
		queryObj.email = userObj.email;
	} else if (!!userObj.username) {
		queryObj.username = userObj.username;
	}

	User.find({
		or : [
			{username: userObj.username || null},
			{email: userObj.email || null}
		]
	})
	// User.find(queryObj)
	.exec(function(err, users) {
		if (err) {
			// if error, assumed to exist - true
			return res.serverError({exists: true, message: 'error in looking up the user'});
		}
		if (users.length > 0) {
			return res.ok({exists: true, user: users[0], message: 'user exists already'});
		} else {
			return res.ok({exists: false, message: 'user does not exist'});
		}
	})
}
