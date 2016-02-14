var config = require('./config');

var amazonS3Service = function(req, res) {
		var images = req.file('images');
		images.upload({
			maxBytes:1500000,
			adapter: require('skipper-s3'),
			key: config.AMAZON_S3_KEY,
			secret: config.AMAZON_S3_SECRET,
			bucket: config.AMAZON_S3_IMGBUCKETNAME
		}, function(err, uploadedFiles) {
      var filePaths = [];
			if (err)  {
				sails.log.error('error in uploading image');
        return filePaths;
        // return res.json(filePaths);
				// return res.serverError(err);
			}
			// for (u in uploadedFiles) {
			// 	console.log('uploade file u: ', uploadedFiles[u].fd);
			// }
			sails.log.info('success in uploading image, uploadedFiles: ', uploadedFiles);
      filePaths = uploadedFiles.map(function(file) {
        return file.extra.Location;
      });
      return filePaths;
      // return res.json(filePaths);
		});
};

module.exports = amazonS3Service;
