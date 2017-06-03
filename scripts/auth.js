const auth = function(req, res, next){
    if (!req.session || !req.session.user) return next()
    if (res)
        return next()
    else
        return res.sendStatus(401)
}

module.exports = auth;