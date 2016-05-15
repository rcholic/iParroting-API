/**
* Comment.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  adapter: 'mongo',

  attributes: {
    comment: 'string',

    question: {
      model: 'question'
    },

    user: {
      model: 'user'
    },

    answer: {
      model: 'answer'
    },

    votes: {
      collection: 'vote',
      via: 'comment'
    }
  }
};
