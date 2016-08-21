/**
 * UtilController
 *
 * @description :: Server-side logic for managing Utils
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
 var amazonS3Service = require('../services/AmazonS3');
 var config = require('../services/config');

module.exports = {

	// utility for uploading images to S3
	uploadImagesToS3: function(req, res, next) {
		var imageBucket = config.AMAZON_S3_IMGBUCKETNAME;
		amazonS3Service(req, res, imageBucket, config.UPLOAD_IMG_FIELD, function(err, uploadedImages) {
			var filePaths = [];
			if (err)  {
				sails.log.error('error in uploading image');
				return res.serverError({error: err});
			}
			sails.log.info('req.params object: ', req.params.all());
			filePaths = uploadedImages.map(function(file) {
				return file.extra.Location;
			});

			return res.ok({data: filePaths});
		}); // amazonS3Service
	}, // uploadedImages
};
