/**
 * QuestionController
 *
 * @description :: Server-side logic for managing questions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var amazonS3Service = require('../services/AmazonS3');
var Q = require('q');
var Promise = require('bluebird');
var config = require('../services/config');
// Promise.promisify(amazonS3Service);

module.exports = {

	/**
	* fetch questions by page and page size
	*/
	fetchQuestions: function(req, res, next) {
		sails.log.info('req.user is: ', req.session.user);
		sails.log.info('req.params.all(): ', req.allParams()); // req.params.all()
		var page = req.params.page; // page number starts from 1
		var pageSize = req.params.size || 10; // page size
		Question.find()
			.paginate({page: page, limit: pageSize})
			.populateAll()
			// .populate('user')
			// .populate('comments')
			// .populate('votes')
			// .populate('answers')
			.sort('createdAt DESC')
			.exec(function(err, questions) {
				if (err) {
					// next(err);
					return res.serverError({error: err});
				}

				return res.ok({data: questions}); // res.json(questions);
			});
	},

	// upload images to the hard drive of the hosting server
	uploadImageToServer: function(req, res) {

		var uploadFile = req.file(config.UPLOAD_IMG_FIELD);
		sails.log.debug('uploadFile: ', uploadFile);
		uploadFile.upload({
			// dirname: '../../assets/images',
			// upload limit 10 MB
			maxBytes: 1000000,
			adapter: require('skipper-disk')
		}, function whenDone(err, uploadedFiles) {
			if (err)  {
				sails.log.error('error in uploading image');
				return res.serverError({error: err});
			}

			sails.log.info('success in uploading image, uploadedFiles: ', uploadedFiles);
			return res.ok({data: {files: uploadedFiles, textParams: req.params.all()}});
			// return res.json({
			// 	files: uploadedFiles, // array, each element has 'fd' field as the uploaded path url
			// 	textParams: req.params.all()
			// });
		});

		sails.log.info('block after uploading file!');
	},

	// create a new question and upload images, if any
	create: function(req, res) {
		sails.log.info('creating a question, req.params.all: ', req.params.all());
		if (typeof req.file === 'function' && req.file(config.UPLOAD_IMG_FIELD)) {
			return uploadToS3(req, res, config.UPLOAD_IMG_FIELD);
		}

		return createQuestion(req.params.all(), res);
	}
};

// helper functions below

var uploadToS3 = function(req, res, fieldName) {
		// upload to Amazon S3 storage
		var bucketName = config.AMAZON_S3_IMGBUCKETNAME;
		amazonS3Service(req, res, bucketName, fieldName, function(err, uploadedFiles) {
				var deferred = Q.defer();
				var filePaths = [];
				if (err)  {
					sails.log.error('error in uploading image');
					deferred.reject(filePaths);
				}
				sails.log.info('req.params object: ', req.params.all());
				// sails.log.info('success in uploading image, uploadedFiles: ', uploadedFiles);
				filePaths = uploadedFiles.map(function(file) {
					return file.extra.Location;
				});
				deferred.resolve(filePaths);

				var questionObj = req.params.all();
				questionObj.images = filePaths;
				createQuestion(questionObj, res);
		});
};

// Persist question to database with file paths to the upload images, if any
var createQuestion = function(questionObj, res) {
	delete questionObj.answers; // = [];
	delete questionObj.tags; // = [];
	delete questionObj.favorited; // = [];
	delete questionObj.comments; // = [];
	delete questionObj.votes; // = [];
	delete questionObj.redFlagged; // = [];
	// TODO: questionObj.user = req.session.userId; 
	sails.log.info('questionObj: ', questionObj);

	Question.create(questionObj).exec(function createQuestion(err, newQ) {
		if (err) {
			sails.log.error('error msg: ', err);
			return res.serverError({error: 'failed to create question'});
		}
		return res.ok({data: newQ});
	});
}
