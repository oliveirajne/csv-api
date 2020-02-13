const errorHandler = require('../helpers');
const User = require('../app/models/User');

async function verifyIfUserExists(req, res, next) {
    try {
        let user = await User.findByID(req.params.id)
        if(user == null) {
            return errorHandler.handleError({
                req: req,
                res: res,
                error: {display: true, status: 404, error: "This user doesn't exists."}
            });
        }
        return next()
    }catch(error){
        return errorHandler.handleError({
            req: req,
            res: res,
            error: {display: false, status: 500, error: error}
        })
    }
}

module.exports.verifyIfUserExists = verifyIfUserExists;