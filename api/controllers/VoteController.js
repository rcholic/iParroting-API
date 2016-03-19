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
		// var userId = req.body.user || null; // TODO: get it from session
		var userId = req.session.userId || null; // get userId in the session
		var voteType = req.body.voteType >= 1 ? 1 : -1; // 1 for up, -1 for downvote
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
								foundVote.voteType = 0; // user undid the previous vote (nullified)
							}
							// update the voteType and return the total counts for both voteTypes
							foundVote.save(function(err, updatedVote) {
								if (err) {
									return res.serverError({error: 'error in updating vote'});
								}
								sails.log.info('updatedVote: ', updatedVote);
								foundVote = updatedVote; // assign the updatedVote to foundVote

								var upCountObj = voteCountQueryObj;
								upCountObj.voteType = 1; // upCount query
								var downCountObj = JSON.parse(JSON.stringify(voteCountQueryObj));
								downCountObj.voteType = -1; // downCount query
								sails.log('upCountObj: ', upCountObj);
								// concatenate promises for resolving together
								var promises = [countVotes(upCountObj), countVotes(downCountObj)];
								Q.all(promises).spread(function(upCount, downCount) {
									sails.log.info('upCount: ', upCount);
									sails.log.info('downCount: ', downCount);
									foundVote.upCount = upCount;//bothCounts[0]; // upCount
									foundVote.downCount = downCount; // bothCounts[1]; // downCount

									return res.ok({data: foundVote});
								}).fail(function(err) {
									// return the foundVote if count promises fail
									return res.ok({data: foundVote});
								}); // Q.all()
							}); // foundVote.save()

						} // else
				}); // exec

	}, // create
};

/**
* voteQueryObj: {question: questionId, voteType: voteType} or
* {answer: answerId, voteType: voteType};
* return promise
*/
function countVotes(voteQueryObj) {
	return Vote.count(voteQueryObj);
}
