/**
 * FavoriteController
 *
 * @description :: Server-side logic for managing favorites
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	// post, params: {user: 'userId', question: 'questionId'}
	addOrRemoveFavoriteQuestion: function(req, res) {
		var params = req.params.all();
		var userId = params.user || null;
		var questionId = params.question || null;
		sails.log.info('userId: ', userId);
		if (!userId || !questionId) {
			return res.status(403).send({message: 'user and quesetion are required'});
		}
		Favorite.findOne({user: userId})
						.populate('questions')
						.exec(function(err, foundFav) {
							if (err) return res.json({message: 'not found'});

							sails.log.info('foundFav: ', foundFav);
							if (!foundFav) {
								var favObj = {user: userId, questions: [questionId]};
								Favorite.create(favObj, function(err, newFav) {
									if (err) return res.json({message: 'error in adding favorites'});

									sails.log.info('success creating favorite');
									return res.json(newFav);
								});
							} else {
								sails.log.info('pushing in question now!');
								/*
								foundFav.questions.push(questionId);
								sails.log.info(foundFav.questions);
								foundFav.save(function(err, updatedFav) {
									if (err) return res.json({message: 'error in adding favorites'});
									sails.log.info('success updating favorite');
									return res.json(updatedFav);
								});
								*/

								Question.findOneById(questionId, function(err, foundQ) {
									foundFav.questions.add(foundQ);
									foundFav.save(function(err, updatedFav) {
										if (err) return res.json({message: 'error in adding favorites'});
										sails.log.info('success updating favorite');
										return res.json(updatedFav);
									});

									/*
									Favorite.update(foundFav).exec(function(err, updatedFav) {
										if (err) return res.json({message: 'error in adding favorites'});
										sails.log.info('success updating favorite');
										return res.json(updatedFav);
									});
									*/

								});
							}
						});
	}, // update
};
