/**
 * CommentController
 *
 * @description :: Server-side logic for managing comments
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	fetchCommentsForQuestion: function(req, res, next) {
		var questionId = req.params.questionId;
		sails.log.info('questionId: ', questionId);
		var queryObj = {question: questionId};
		findComments(req, res, queryObj);
	},

	fetchCommentsForAnswer: function(req, res, next) {
		var answerId = req.params.answerId;
		var queryObj = {answer: answerId};
		findComments(req, res, queryObj);
	}
};

var findComments = function(req, res, queryObj) {
	Comment.find()
		.where(queryObj)
		.populate('question')
		.populate('answer')
		.populate('user')
		// .populateAll()
		.sort('createdAt DESC')
		.exec(function(err, comments) {
			if (err) {
				return res.serverError({error: 'error in retrieving comments'});
			}
			return res.ok({data: comments});
		});
}
