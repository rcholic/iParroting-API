/**
 * QuestionController
 *
 * @description :: Server-side logic for managing questions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	uploadImage: function(req, res) {

		var uploadFile = req.file('image');
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
				files: uploadedFiles,
				textParams: req.params.all()
			});
		});

		sails.log.info('block after uploading file!');
	},

};
