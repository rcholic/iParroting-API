/**
* Vote.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  adapter: 'mongo',

  attributes: {

    voteType: {
      type: 'int',  // 1 for up, -1 for downvote
      required: true
    },

    user: {
      model: 'user'
    },

    question: {
      model: 'question'
    },

    answer: {
      model: 'answer'
    }
        
  }
};
