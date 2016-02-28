var bcrypt = require('bcrypt-nodejs');
var createSendToken = require('./createSendToken');


module.exports = {
  // user has been authenticated with third party user
  mobileAppAuth: function(req, res) {
    var email = req.body.email;
    var provider = req.body.email;
    var password = req.body.password;
    var thirdPartyAuthToken = req.body.authToken; // token from the third party auth, e.g. facebook token

    if (!email || thirdPartyAuthToken || !provider) {
      return res.forbidden({error: 'Access forbidden'});
    }

    var user = {
      email: email,
      provider: provider,
      password: password,
      thirdPartyAuthToken: thirdPartyAuthToken
    };

    return createSendToken(user, res);
  },

  // local authentication with user registered in the database
  localAuth: function(req, res) {
    // TODO: authenticated with the web app
  }

};
