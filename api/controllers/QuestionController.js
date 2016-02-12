/**
 * QuestionController
 *
 * @description :: Server-side logic for managing questions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

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

	uploadImageToS3: function(req, res) {
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
			/*** uploadedFiles, if successful upload:
			{
"files": [
{
  "fd": "2bf1790b-d579-4244-8522-28f5c5c369f0.jpg",
  "size": 769309,
  "type": "image/jpeg",
  "filename": "parrot_cartoon.jpg",
  "status": "bufferingOrWriting",
  "field": "images",
  "extra": {
	"Location": "https://parroting-images.s3.amazonaws.com/2bf1790b-d579-4244-8522-28f5c5c369f0.jpg",
	"Bucket": "parroting-images",
	"Key": "2bf1790b-d579-4244-8522-28f5c5c369f0.jpg",
	"ETag": "\"ef53136a76cbae7f65ef66d9be2afc02-1\"",
	"size": 93262
  }
},
{
  "fd": "82f1e6dd-2c36-4c07-b9c0-03dff48d40a5.png",
  "size": 675866,
  "type": "image/png",
  "filename": "Screen%20Shot%202016-02-05%20at%204.14.02%20PM.png",
  "status": "bufferingOrWriting",
  "field": "images",
  "extra": {
	"Location": "https://parroting-images.s3.amazonaws.com/82f1e6dd-2c36-4c07-b9c0-03dff48d40a5.png",
	"Bucket": "parroting-images",
	"Key": "82f1e6dd-2c36-4c07-b9c0-03dff48d40a5.png",
	"ETag": "\"306e293f76206765cce962cf0c69fb76-1\"",
	"size": 675866
  }
}
],
"textParams": {}
}
			 */
		})
	}

};
