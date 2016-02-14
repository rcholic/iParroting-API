/**
 * QuestionController
 *
 * @description :: Server-side logic for managing questions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var amazonS3Service = require('../services/AmazonS3');

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
		// return amazonS3Service(req, res);
		if (amazonS3Service(req, res).length > 0) {
				sails.log.info('upload successful!');
		} else {
			sails.log.error('upload failed!');
		}

		return res.json({message: 'successful!'});
		/*
		var images = req.file('images');
		images.upload({
			maxBytes:1500000,
			adapter: require('skipper-s3'),
			key: '',
			secret: '',
			bucket: 'parroting-images'
		}, function(err, uploadedFiles) {
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

		})
		*/
	}

};
