/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {

  // User is allowed, proceed to the next policy,
  // or if this is the last policy, the controller
  // must been authenticated and must have a userId in the session
  sails.log.info('authenticated ?', req.session.authenticated, req.session.userId);
  if (req.session.authenticated && !!req.session.userId) {
    return next();
  }

  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
  req.session.userId = null;
  req.session.authenticated = false;
  return res.forbidden({error: 'You are not permitted to perform this action.'});
};
