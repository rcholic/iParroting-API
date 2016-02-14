var config = require('./config');
var Q = require('q');
var Promise = require('bluebird');

var amazonS3Service = function(req, res, cb) {
		var images = req.file('images');
		// Promise.promisifyAll(images);
		sails.log.info('in s3 service, req.params: ', req.params.all());

		images.upload({
			maxBytes:1500000,
			adapter: require('skipper-s3'),
			key: config.AMAZON_S3_KEY,
			secret: config.AMAZON_S3_SECRET,
			bucket: config.AMAZON_S3_IMGBUCKETNAME
		}, cb);
};

module.exports = amazonS3Service;
