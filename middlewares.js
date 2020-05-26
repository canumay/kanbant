module.exports.isLoggedIn = (req, res, next) => {
    if(req.user){
        next();
    }else {
        res.status(401).json({status: false, message: '401 Unauthorized'});
    }
}