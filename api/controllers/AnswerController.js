/**
 * AnswerController
 *
 * @description :: Server-side logic for managing answers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 var amazonS3Service = require('../services/AmazonS3');
 // var Q = require('q');
 // var Promise = require('bluebird');
 var config = require('../services/config');

module.exports = {

	/**
	* fetch answers for the given questionId in the url param
	*/
	fetchAnswers: function(req, res, next) {
		var questionId = req.params.questionId;
		// sails.log.info('questionId is: ', questionId);
		Answer.find()
			.where({question: questionId})
			.populate('votes')
			.populate('comments')
//			.populateAll()
			.sort('createdAt DESC')
			.exec(function(err, answers) {
				if (err) {
          return res.notFound({error: 'error in retrieving answers'});
					// return res.json({message: 'error in retrieving answers'});
				}
        return res.ok({data: answers});
				// return res.json(answers);
			});
	},

	// override the blueprint API for create
	create: function(req, res) {
        var params = req.allParams();
        // params.isAudioAttached = true;
		sails.log.info('creating answer... req.params: ', params);
		// sails.log.info('req.file.audio ', req.file('audio'));
		if (!!params.isAudioAttached) {
			return uploadAudioToS3(req, res, config.UPLOAD_AUDIO_FIELD);
		}
        var answerObj = req.params.all();
		return createAnswer(answerObj, res);
	}
};

var uploadAudioToS3 = function(req, res, fieldName) {
    // TODO: handle audio upload with the user id information in session
	var bucketName = config.AMAZON_S3_AUDIOBUCKETNAME;
	amazonS3Service(req, res, bucketName, fieldName, function(err, uploadedFiles) {
		var filePaths = [];
		if (err) {
			sails.log.error('error in uploading audio to S3');
		}
		filePaths = uploadedFiles.map(function(file) {
			return file.extra.Location;
		});
		sails.log.info('audio file paths: ', filePaths);
		var answerObj = req.params.all();
		sails.log('answerObj', answerObj);
		answerObj.audioFilePath = filePaths.length > 0 ? filePaths[0] : null;
		createAnswer(answerObj, res);
	});
};

var createAnswer = function(answerObj, res) {
    answerObj = sanitize(answerObj);
    sails.log.info('creating answer: ', answerObj);
	if (!answerObj.question) {
    return res.notFound({error: 'no question is associated with the answer'});
		// return res.status(405).send({message: 'no question is associated with the answer'});
	}

	Answer.create(answerObj).exec(function saveAnswer(err, newA) {
		if (err) {
            return res.serverError({error: 'error in saving the answer'});
			// return res.json({message: 'error in saving the answer'});
		}
    return res.ok({data: newA});
		// return res.json(newA);
	});
};

var sanitize = function(params, req) {
    var anAnswer = {
        content: params.content,
        audioFilePath: params.audioFilePath || '',
        images: params.imageUrlsConcated.split(",") || []
        question: params.question || null,
        // votes:
        // comments:
        user: '577334fbae701c9e14f573b1',
        // req.session.userId,
    };

    return anAnswer;
}
