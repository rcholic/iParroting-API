/**
 * QuestionController
 *
 * @description :: Server-side logic for managing questions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var amazonS3Service = require('../services/AmazonS3');
var Q = require('q');
var Promise = require('bluebird');
// Promise.promisify(amazonS3Service);

module.exports = {

	/**
	* fetch questions by page and page size
	*/
	fetchQuestions: function(req, res, next) {
		sails.log.info('req.params.all(): ', req.allParams()); // req.params.all()

		var page = req.params.page;
		var pageSize = req.params.size;
		Question.find()
			.paginate({page: page, limit: pageSize})
			.populate('user')
			.populate('comments')
			.populate('votes')
			.populate('answers')
			.sort('createdAt DESC')
			.exec(function(err, questions) {
				if (err) {
					// next(err);
					return res.serverError(err);
				}

				return res.json(questions);
			});
		// return res.status(200).send({message: 'okay!'});
	},

	// upload images to the hard drive of the hosting server
	uploadImageToServer: function(req, res) {

		var uploadFile = req.file('images');
		sails.log.debug('uploadFile: ', uploadFile);
		uploadFile.upload({
			// dirname: '../../assets/images',
			// upload limit 10 MB
			maxBytes: 1000000,
			adapter: require('skipper-disk')
		}, function whenDone(err, uploadedFiles) {
			if (err)  {
				sails.log.error('error in uploading image');
				return res.serverError(err);
			}
			// for (u in uploadedFiles) {
			// 	console.log('uploade file u: ', uploadedFiles[u].fd);
			// }
			sails.log.info('success in uploading image, uploadedFiles: ', uploadedFiles);
			return res.json({
				files: uploadedFiles, // array, each element has 'fd' field as the uploaded path url
				textParams: req.params.all()
			});
		});

		sails.log.info('block after uploading file!');
	},

	createQuestion: function(req, res) {
		if (req.file('images')) {
			// sails.controllers.
		}
	},

	uploadImageToS3: function(req, res) {
		// return amazonS3Service(req, res, uploadCallback);
		sails.log.info('req.params1: ', req.params.all());
		uploadToS3(req, res);
	}
};

var uploadToS3 = function(req, res) {

		amazonS3Service(req, res, function(err, uploadedFiles) {
				var deferred = Q.defer();
				var filePaths = [];
				if (err)  {
					sails.log.error('error in uploading image');
					deferred.reject(filePaths);
					// return deferred.promise;
					// return filePaths;
					// return res.json(filePaths);
					// return res.serverError(err);
				}
				sails.log.info('req.params object: ', req.params.all());
				// sails.log.info('success in uploading image, uploadedFiles: ', uploadedFiles);
				filePaths = uploadedFiles.map(function(file) {
					return file.extra.Location;
				});
				deferred.resolve(filePaths);

				var questionObj = req.params.all();
				questionObj.images = filePaths;
				Question.create(questionObj, function(err, newQ) {
					if (err) {
						return res.status(401).send({message: 'failed to create question'});
					}
					return res.json({message: newQ});
				});
				// return deferred.promise;
				// return res.json({filePaths: filePaths});
		});
};
