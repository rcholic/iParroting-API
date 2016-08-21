/**
 * QuestionController
 *
 * @description :: Server-side logic for managing questions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var amazonS3Service = require('../services/AmazonS3');
var userServices = require('../services/userServices');
var Q = require('q');
var Promise = require('bluebird');
var config = require('../services/config');
var _ = require('lodash');
// Promise.promisify(amazonS3Service);

module.exports = {
	// override the blueprint for find one

	findOne: function(req, res) {
		sails.log.info('question id: ', req.allParams().id);
		Question.findOne(req.allParams().id)
		.populateAll()
		.then(function(question) {
			var commentUserIds = _.map(question.comments, function(cmt) {
				return cmt.user;
			});
			var commentUsers = User.find({
				id: commentUserIds
			}).then(function(commentUsers) {
				return commentUsers;
			});

			var answerUserIds = _.map(question.answers, function(ans) {
				return ans.user;
			});
			var answerUsers = User.find({
				id: answerUserIds
			}).then(function(answerUsers) {
				return answerUsers;
			});
			return [question, commentUsers, answerUsers];
		}).spread(function(question, commentUsers, answerUsers) {
			commentUsers = _.keyBy(commentUsers, 'id');
			answerUsers = _.keyBy(answerUsers, 'id');
			question.comments = _.map(question.comments, function(cmt) {
				cmt.user = userServices.secureUserObjStrip(commentUsers[cmt.user]);
				return cmt;
			});

			question.answers = _.map(question.answers, function(ans) {
				ans.user = userServices.secureUserObjStrip(answerUsers[ans.user]);
				return ans;
			});
			return res.ok({data: question});
		}).catch(function(err) {
			return res.serverError({error: err});
		});
	},

	/**
	* fetch questions by page and page size
	*/
	fetchQuestions: function(req, res, next) {
		var page = req.params.page; // page number starts from 1
		var pageSize = req.params.size || 10; // page size
		var promises = [Question.find()
				.populate('user')
				.populate('comments')
				.populate('favorited')
				.populate('answers')
				.populate('redFlagged')
				.paginate({page: page, limit: pageSize}).sort('createdAt DESC'), Question.count()]
		Q.all(promises).spread(function(questions, total) {
			return res.ok({data: questions, pageSize: parseInt(pageSize), page: parseInt(page), total: total});
		}).fail(function(err) {
			return res.serverError({error: err});
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
		});
	},

	// create a new question and upload images, if any
	create: function(req, res) {
		var params = req.params.all();
		// console.info('files.length: ', req.file(config.UPLOAD_IMG_FIELD)._files.length);
		if (!!params.isImgAttached) {
			// use isImgAttached as flag for uploading image
			return uploadToS3(req, res, config.UPLOAD_IMG_FIELD);
			// TODO: upload audio together with images
		}
		sails.log.info('creating question without uploading file. req.file: ', req.file);
		return createQuestion(sanitize(req.params.all(), req), res); // sanitize params
	}
};

// helper functions below

var uploadToS3 = function(req, res, fieldName) {
		// upload to Amazon S3 storage
		var bucketName = config.AMAZON_S3_IMGBUCKETNAME;
		amazonS3Service(req, res, bucketName, fieldName, function(err, uploadedFiles) {
				var filePaths = [];
				if (err)  {
					sails.log.error('error in uploading image');
				}
				sails.log.info('req.params object: ', req.params.all());
				// sails.log.info('success in uploading image, uploadedFiles: ', uploadedFiles);
				filePaths = uploadedFiles.map(function(file) {
					return file.extra.Location;
				});

				var questionObj = sanitize(req.params.all(), req);
				questionObj.images = filePaths;
				createQuestion(questionObj, res);
		});
};

// Persist question to database with file paths to the upload images, if any
var createQuestion = function(questionObj, res) {

	sails.log.info('questionObj to be persisted: ', questionObj);
	if (questionObj.tagArr.length === 0) {
		Question.create(questionObj).exec(function saveQuestion(err, newQ) {
			if (err) {
				sails.log.error('error msg: ', err);
				return res.serverError({error: 'failed to create question'});
			}
			return res.ok({data: newQ});
		});
	} else {
		// save tags as many to many
		var promises = questionObj.tagArr.map(function(tagStr) {
			return Tag.findOrCreate({name: tagStr});
		});

		Q.all(promises).then(function(tags) {
			// tags is an array of Tag objects
			questionObj.tags = tags.map(function(tag) {
				return tag.id;
			});
			delete questionObj.tagArr; // drop the tagArr field
			Question.create(questionObj).exec(function saveQuestion(err, newQ) {
				if (err) {
					sails.log.error('error msg: ', err);
					return res.serverError({error: 'failed to create question'});
				}
				return res.ok({data: newQ});
			});
		}).catch(function(err) {
			return res.serverError({error: err});
		});
	}
};

var sanitize = function(params, req) {
	params.tags = params.tags.trim();
	if (!!params.tags) {
		var allTags = params.tags.indexOf(',') > -1 ? params.tags.split(',') : [params.tags.trim()];
		params.tags = allTags.map(function(t) {return t.trim();}); // trim
	} else {
		params.tags = [];
	}
	var aQuestion = {
		title: params.title,
		content: params.content,
		user: req.session.userId,
		tagArr: params.tags,
	};

	return aQuestion;
}
