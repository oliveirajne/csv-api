const winston = require('winston');

function camelize(text) {
    return text.replace(/^([A-Z])|[\s-_]+(\w)/g, function (match, p1, p2, offset) {
        if (p2) return p2.toUpperCase();
        return p1.toLowerCase();
    });
}

function decamelize(str, separator) {
    separator = typeof separator === 'undefined' ? '_' : separator;

    return str
        .replace(/([a-z\d])([A-Z])/g, '$1' + separator + '$2')
        .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + separator + '$2')
        .toLowerCase();
}

function titleize(str) {

    return str
        .replace(/^([A-Z])|[\s-_]+(\w)/g, function (match, p1, p2, offset) {
            if (p2) return p2.toUpperCase();
            return p1.toUpperCase()
        })
        .replace(/([a-z\d])([A-Z])/g, '$1 $2')
        .replace(/^\w/, function (chr) {
            return chr.toUpperCase();
        })
}


/**
* Helper de tratamento de erros
*/
class ErrorHandler {

    constructor() {
        this.env = process.env.STAGE || 'development'
        this.logger = winston.createLogger({
            transports: [
                new (winston.transports.Console)({
                    colorize: true
                })
            ]
        })
    }
    /**
     * Recebe um erro de HTTP e cria o seu respectivo código de erro, mensagem e logs
     * @return {boolean}
     */
    createErrorResponse(error) {
        const errorCode = error.status || 500
        let errorMessage

        switch (errorCode) {
            case 404:
                errorMessage = null
                break

            default:
                errorMessage = "Internal error."
                break
        }

        if (error.display === true) {
            errorMessage = error.error
        }
        this.logger.log('error', error)
        return {status: errorCode, message: errorMessage}
    }

    handleError(options) {
        const res = options.res
        const error = options.error
        const err = this.createErrorResponse(error)
        return res.status(err.status).json({error: err.message})
    }
}


module.exports = { camelize, decamelize, titleize };
module.exports = new ErrorHandler;