/**
 * FavoriteController
 *
 * @description :: Server-side logic for managing favorites
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 var _ = require('lodash');

module.exports = {

	// post, params: {user: 'userId', question: 'questionId'}
	addOrRemoveFavoriteQuestion: function(req, res) {
		var params = req.params.all();
		var userId = params.user || null;
		var questionId = params.question || null;
		sails.log.info('userId: ', userId);
		if (!userId || !questionId) {
      // TODO: get user in the server session
      return res.forbidden({error: 'user and question are required'});
			// return res.status(403).send({message: 'user and quesetion are required'});
		}
		Favorite.findOne({user: userId})
						.populate('questions')
						.exec(function(err, foundFav) {
							if (err) return res.notFound({error: 'not found'}); //res.json({message: 'not found'});

							sails.log.info('foundFav: ', foundFav);
							if (!foundFav) {
								var favObj = {user: userId, questions: [questionId]};
								Favorite.create(favObj, function(err, newFav) {
									if (err) return res.serverError({error: 'error in saving the favorite'}); // res.json({message: 'error in adding favorites'});

									sails.log.info('success creating favorite');
									return res.ok({data: newFav}); //res.json(newFav);
								});
							} else {
								sails.log.info('pushing in question now!');
								var contains = _.some(foundFav.questions, {id: questionId});
								sails.log.info('contains? ', contains);
								if (contains) {
									foundFav.questions.remove(questionId);
								} else {
									foundFav.questions.add(questionId);
								}
								// save the update
								foundFav.save(function(err, updatedFav) {
									if (err) return res.serverError({error: 'error in saving the favorite'}); // res.json({message: 'error in adding favorites'});
									sails.log.info('success updating favorite');
									return res.ok({data: updatedFav}); // res.json(updatedFav);
								});
							}
						});
	}, // update
};
