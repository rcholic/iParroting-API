/**
 * FavoriteController
 *
 * @description :: Server-side logic for managing favorites
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 var _ = require('lodash');

module.exports = {

  findOne: function(req, res) {
		sails.log.info('favorite id: ', req.allParams().id);
    Favorite.findOneById(req.allParams().id)
    .populate('user')
//     .populateAll()
    .exec(function(err, foundFav) {
      if (err) {
        return res.serverError({error: 'not found'});
      }
      return res.ok({data: foundFav});
    });
	},

	// post, params: {user: 'userId', question: 'questionId'}
	addOrRemoveFavoriteQuestion: function(req, res) {
		var params = req.params.all();
		var userId = req.session.userId || null; // get userId in the session
		var questionId = params.question || null;
		sails.log.info('userId: ', userId);
		if (!userId || !questionId) {
      return res.forbidden({error: 'user and question are required'});
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

                  favoriteCountsOnQuestion(questionId).then(function(question) {
                    newFav.count = question.favorited.length; // piggyback the count of the favorite
                    return res.ok({data: updatedFav});
                  });

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
									sails.log.info('success updating favorite, ', updatedFav);

                  favoriteCountsOnQuestion(questionId).then(function(question) {
                    updatedFav.count = question.favorited.length; // piggyback the count of the favorite
                    return res.ok({data: updatedFav});
                  });

								});
							}
						});
	}, // update
};

/**
* return a promise for the found question
*/
function favoriteCountsOnQuestion(questionId) {
  return Question.findOneById(questionId)
    .populate('favorited');
}
