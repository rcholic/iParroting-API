/**
 * VoteController
 *
 * @description :: Server-side logic for managing votes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Q = require('q');

module.exports = {
	create: function(req, res) {
		var questionId = req.body.question || null;
		var answerId = req.body.answer || null;
		var userId = req.body.user || null; // TODO: get it from session
		var voteType = req.body.voteType; // 1 for up, -1 for downvote
		var queryObj = {user: userId};
		var voteCountQueryObj = {voteType: voteType}; // used for counting the votes of the same voteType;
		if (!!answerId) {
			queryObj.answer = answerId;
			voteCountQueryObj.answer = answerId;
		} else if (!!questionId) {
			queryObj.question = questionId;
			voteCountQueryObj.question = questionId;
		}

		Vote.findOne(queryObj)
				.populateAll()
				.exec(function(err, foundVote) {
						if (err) return res.serverError({error: 'error finding the vote'});
						sails.log.info('foundVote: ', foundVote);

						if (foundVote === undefined) {
							// create the new vote
							var vote = {
								voteType: voteType,
								user: userId,
								question: questionId
							};
							Vote.create(vote, function(err, newVoteObj) {
								if (err) return res.serverError({error: 'error in creating new vote'});
								newVoteObj.upCount = voteType === 1 ? 1 : 0; // count for new vote is 1 by default
							 	newVoteObj.downCount = voteType === -1 ? 1 : 0; // count for new vote is 1 by default

								return res.ok({data: newVoteObj});
							});

						} else {
							// found the vote, update it
							if (foundVote.voteType !== voteType) {
									foundVote.voteType = voteType; // update the voteType
							} else {
								foundVote.voteType = 0; // nothing
							}

							foundVote.save(function(err, updatedVote) {
								if (err) {
									return res.serverError({error: 'error in updating vote'});
								}
								foundVote = updatedVote; // assign the updatedVote to foundVote
								sails.log.info('foundVote = updatedVote');

								var obj1 = voteCountQueryObj;
								obj1.voteType = 1; // upCount query
								var obj2 = voteCountQueryObj;
								obj2.voteType = -1; // downCount query
								// concatenate promises for resolving together
								var promises = [];
								promises.push(countVotes(obj1));
								promises.push(countVotes(obj1));
								sails.log.info('promises: ', promises);
								countBothVotes(promises).then(function(bothCounts) {
									sails.log.info('response: ', response);
									foundVote.upCount = bothCounts[0]; // upCount
									foundVote.downCount = bothCounts[1]; // downCount

									return res.ok({data: foundVote});
								});
							});



							/*
							countBothVotes(voteCountQueryObj).then(function(bothCounts) {
								foundVote.upCount = bothCounts.upCount;
								foundVote.downCount = bothCounts.downCount;
								return res.ok({data: foundVote});
							});
							*/

						}

				});
	}, // create
};

/**
* voteQueryObj: {question: questionId, voteType: voteType};
*/
function countVotes(voteQueryObj) {
	return Vote.count(voteQueryObj);
}

function countBothVotes(promises) {
	return Q.all(promises);
	// var bothCounts = {upCount: -1, downCount: -1};
	// var deferred = Q.defer();
	//
	// voteQueryObj.voteType = 1;
	// Vote.count(voteQueryObj, function(err, upCount) {
	// 	sails.log.info('upCount: ', upCount);
	// 	bothCounts.upCount = upCount;
	// });
	//
	// voteQueryObj.voteType = -1;
	// Vote.count(voteQueryObj, function(err, downCount) {
	// 	sails.log.info('downCount: ', downCount);
	// 	bothCounts.downCount = downCount;
	// });
	//
	// deferred.resolve(bothCounts);
	// return deferred.promise;
}
