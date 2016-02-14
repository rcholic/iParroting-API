var config = require('./config');

var amazonS3Service = function(req, res, s3BucketName, cb) {
		var images = req.file('images');
		sails.log.info('in s3 service, req.params: ', req.params.all());

		images.upload({
			maxBytes:1500000,
			adapter: require('skipper-s3'),
			key: config.AMAZON_S3_KEY,
			secret: config.AMAZON_S3_SECRET,
			bucket: s3BucketName
		}, cb);
};

module.exports = amazonS3Service;
