
module.exports = {
    secureUserObjStrip: function(userObj) {
        if (!!userObj) {
            delete userObj.password;
            delete userObj.activated;
            delete userObj.createdAt;
            delete userObj.updatedAt;
            delete userObj.redFlags; // ??
            delete userObj.comments;
            delete userObj.answers;
            delete userObj.votes;
            delete userObj.questions; // ??
            delete userObj.favorites;
        }

        return userObj;
    },
};
