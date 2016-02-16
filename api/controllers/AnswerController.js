/**
 * AnswerController
 *
 * @description :: Server-side logic for managing answers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	/**
	* fetch answers for the given questionId in the url param
	*/
	fetchAnswers: function(req, res, next) {
		var questionId = req.params.questionId;
		sails.log.info('questionId is: ', questionId);
		Answer.find()
			.where({question: questionId})
			.populate('votes')
			.populate('comments')
//			.populateAll()
			.sort('createdAt DESC')
			.exec(function(err, answers) {
				if (err) {
					return res.json({message: 'error in retrieving answers'});
				}
				return res.json(answers);
			});
	}
};
