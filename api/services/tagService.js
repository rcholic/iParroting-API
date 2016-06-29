

var createTag = function(tagObj, questionId, res) {
    Tag.findOne()
        .where({name: tagObj.name})
        .exec(function(err, foundTag) {
            if (err) return res.serverError({error: 'error in finding tag'});

            if (!foundTag) {
                Tag.create(tagObj)
            }
        });
}
