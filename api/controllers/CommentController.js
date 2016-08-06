/**
 * CommentController
 *
 * @description :: Server-side logic for managing comments
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var userServices = require('../services/userServices');

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
	},

	create: function(req, res) {
		var commentObj = {user: req.session.userId};

		var params = req.params.all();
		commentObj.comment = params.comment;
		if (!!params.question) {
			commentObj.question = params.question; // comment on questionId
		} else if (!!params.answer) {
			commentObj.answer = params.answer; // comment on answerId
		} else if (!!params.commentId) {
			commentObj.commentId = params.commentId; //
		}

		Comment.create(commentObj).exec(function saveComment(err, cmt) {
			if (err) {
				return res.serverError({error: 'failed to create comment'});
			}
			User.findOne({id: cmt.user}).exec(function(err, foundUser) {
				if (err) {
					return res.serverError({error: 'failed to find user for creating the comment'});
				}
				cmt.user = userServices.secureUserObjStrip(foundUser); // populate user as an object
				return res.ok({data: cmt});
			});

		}); // create comment
	},
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
