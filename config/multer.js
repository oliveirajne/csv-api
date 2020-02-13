//import multer from 'multer'
const multer = require('multer');
const path = require('path');
//import { extname, resolve } from 'path'

module.exports = {
    storage: multer.diskStorage({
        destination: path.resolve(__dirname, '..', 'tmp', 'uploads')
    })
}