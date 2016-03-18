/**
 * VoteController
 *
 * @description :: Server-side logic for managing votes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

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
							//	newVoteObj.upCount = voteType === 1 ? 1 : 0; // count for new vote is 1 by default
							// 	newVoteObj.downCount = voteType === -1 ? 1 : 0; // count for new vote is 1 by default

								newVoteObj = updateVoteCounts(voteType, newVoteObj, 1);
								return res.ok({data: newVoteObj});
							});

						} else {
							// found the vote, update it
							if (foundVote.voteType !== voteType) {

									foundVote.voteType = voteType; // update the voteType
									foundVote.save(function(err, updatedVote) {
										if (err) {
											return res.serverError({error: 'error in updating vote'});
										}
										foundVote = updatedVote; // assign the updatedVote to foundVote
										sails.log.info('foundVote = updatedVote');
									});
							}

							countVotes(voteCountQueryObj).then(function(count) {
								sails.log.info('count response: ', count);
								foundVote = updateVoteCounts(voteType, foundVote, count);

								return res.ok({data: foundVote});
							});

						}
				});
	}
};

/**
* voteQueryObj: {question: questionId, voteType: voteType};
*/
function countVotes(voteQueryObj) {
	return Vote.count(voteQueryObj);
}

// update the voteObj with either upCount or downCount with the provided 'count' param
function updateVoteCounts(voteType, voteObj, count) {
	if (voteType === 1) {
		voteObj.upCount = count;
	} else {
		voteObj.downCount = count;
	}
	return voteObj; // updated upcount or downCount field
}
