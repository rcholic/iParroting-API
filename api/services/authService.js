var createSendToken = require('./createSendToken');


module.exports = {
  // user has been authenticated with third party user
  mobileAppAuth: function(req, res) {
    var email = req.body.email;
    var provider = req.body.provider;
    var password = req.body.password;
    var thirdPartyAuthToken = req.body.authToken; // token from the third party auth, e.g. facebook token

    if (!email && !thirdPartyAuthToken && !provider) {
      console.error('access forbidden!');
      return res.forbidden({error: 'Access forbidden'});
    }

    var user = {
      email: email,
      provider: provider,
      password: password,
      thirdPartyAuthToken: thirdPartyAuthToken,
      isLocal: false
    };
    console.info('third party user: ', user);

    return createSendToken(user, req, res);
  },

  // local authentication with user registered in the database
  localAuth: function(req, res) {
    // authenticate with the web app (local registered user)
    // var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    
    var user = {
        email: email,
        password: password,
        isLocal: true,
    };

    return createSendToken(user, req, res);

  }

};
