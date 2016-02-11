/**
* Question.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  adapter: 'mongo',

  attributes: {
    title: {
      type: 'string',
      required: true
    },

    content: {
      type: 'string'
    },

    numImages: {
      type: 'int',
      defaultsTo: 0
    },

    // one question - to many answers
    answers: {
      collection: 'answer',
      via: 'question'
    },

    // one question - to many comments
    comments: {
      collection: 'comment',
      via: 'question'
    },

    votes: {
      collection: 'vote',
      via: 'question'
    },

    // question owner: user
    user: {
      //owner model - user
      model: 'user'
    },

    tags: {
      collection: 'tag',
      via: 'questions',
      dominant: true
    }

  }
};
