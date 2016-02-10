/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var bcrypt = require('bcrypt-nodejs');

module.exports = {
  adapter: 'mongo',

  attributes: {
    email: {
      type: 'email',
      required: true,
      unique: true
    },

    googleId: {
      type: 'string',
      required: false
    },

    facebookUserId: {
      type: 'string',
      required: false
    },

    password: {
      type: 'string',
      required: true
    },

    username: {
      type: 'string'
    },

    activated: {
      type: 'boolean',
      defaultsTo: false
    },

    firstLanguage: {
      type: 'string'
    },

    questions: {
      collection: 'question',
      via: 'user'
    },

    comments: {
      collection: 'comment',
      via: 'user'
    },

    votes: {
      collection: 'vote',
      via: 'user'
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj.password;
      return obj;
    }
  }, // attributes

  beforeCreate: function(attrs, next) {
    bcrypt.genSalt(10, function(err, salt) {
      if (err) return next(err);

      bcrypt.hash(attrs.password, salt, null, function(err, hash) {
        attrs.password = hash;
        attrs.activated = false; // override user's params, if any
        next();
      });
    });
  }

};
