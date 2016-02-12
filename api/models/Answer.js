/**
* Answer.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  adapter: 'mongo',

  attributes: {

    content: {
      type: 'string'
    },

    // path to the audio file
    audioFilePath: {
      type: 'string',
      defaultsTo: null
    },

    // array of image paths
    images: {
      type: 'array'
    },

    // many answers to one owner: question
    question: {
      model: 'question'
    },

    votes: {
      collection: 'vote',
      via: 'answer'
    },

    comments: {
      collection: 'comment',
      via: 'answer'
    }
  }
};
