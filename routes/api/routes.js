const express = require('express');
const router = express.Router();
const moment = require('moment');
const multer = require('multer');
const fs = require('fs');
const fastCsv = require('fast-csv');
const helpers = require('../../helpers');
const Client = require('../../app/models/Client');
const User = require('../../app/models/User');
//const FileProcess = 
//const ClientController = require('../../app/controllers/ClientController');
const multerConfig = require('../../config/multer');
const mySQLWrapper = require('../../app/database/mysqlWrapper');
const { cleanFileData } = require('../../app/csvHandle');
const { verifyIfUserExists } = require('../../middleware/usersMiddleware');

const upload = multer(multerConfig);


router.post('/upload', upload.single('file'), async (req, res) => {

    const { originalname, mimetype, filename } = req.file;
    
    if (mimetype !== 'text/csv') {
        
        console.log(originalname);
        console.log(filename);
        console.log(mimetype);
        
        return res.json({ msg: `File extension invalid. You are pasing ${mimetype} instead of csv` })
    }
    
    const [username, code] = originalname.split('_')
    const [normalizedCode,] = code.split('.')
    
    if (username == undefined || normalizedCode == undefined) {
        return res.json({ message: `File name format invalid '${originalname}'. Change the file name to pattern: 'username_code.csv'` })
    }
    
    try {

        const rows = []
        fastCsv.fromPath(req.file.path)
        .on("data", function (eachRow) {
            rows.push(eachRow)
        })
        .on("end", async function () {

            let cleanData = await cleanFileData(rows);
            
            let data = {
                _id: normalizedCode,
                name: username,
                data_sent: new Date(),
                file_name: originalname,
                status: 'upload_complete'

            }

            console.log(data);

            let connection;

            try {
                connection = await mySQLWrapper.getConnectionFromPool()
                await mySQLWrapper.beginTransaction(connection)
                

                // Verifica existência do usuário para evitar duplicidade
                let userInsert = await User.findByID(data._id, connection)

                if(userInsert == null) {

                    console.log('nao encontrou user');
                    userInsert = await User.insert({connection, data})
                }

                await Promise.all(cleanData.map(async client => {
                    client.users_id = userInsert.id
                    await Client.insert({connection, data: client})
                }))

                await mySQLWrapper.commit(connection)
                return res.status(201).json(data)
            } catch (e) {
                console.log('erro');
                fs.unlinkSync(req.file.path)
                await mySQLWrapper.rollback(connection)
                errorHandler.logger.log("error", e)
                return errorHandler.handleError({
                    error: {status: 500, error: `Error while inserting data: ${e}`, display: false},
                    res: res,
                    req: req
                })
            }

        })


    } catch (err) {
        return res.json({ msg: `${err}` });
    }
});

/**
 * Rota responsável por retornar os clients de um usuário
 */
router.get('/:id/clients', [verifyIfUserExists,  async (req, res) => {
    try {
        let userID = req.params.id
        let user = await User.findByID(userID);
        let clientsFromUser = await Client.getUserClients(user.id)
        return res.status(200).json(clientsFromUser)
    } catch (e) {
        errorHandler.logger.log("error", e)
        return errorHandler.handleError({
            error: {status: 500, error: `Error: ${e}`, display: false},
            res: res,
            req: req
        })
    } 
}])

/**
 * Rota responsável por excluir um usuário e seus respectivos clientes
 */
router.delete('/:id',[verifyIfUserExists, async (req, res) => {
    try {
        let connection
        try {
            connection = await mySQLWrapper.getConnectionFromPool()
            await mySQLWrapper.beginTransaction(connection)

            let userToRemove = await User.findByID(req.params.id)

            await Client.deleteByUserID({userID: userToRemove.id, connection})

            await User.delete({id: userToRemove._id, connection})
            
            userToRemove.status = "deleted"
            delete userToRemove.file_name
            delete userToRemove.id
            await mySQLWrapper.commit(connection)
            return res.status(200).json(userToRemove)
        } catch (e) {
            await mySQLWrapper.rollback(connection)
            errorHandler.logger.log("error", e)
            return errorHandler.handleError({
              error: {status: 500, error: `Error while deleting data: ${e}`, display: false},
              res: res,
              req: req
            })
        }
    } catch (e) {
        errorHandler.logger.log("error", e)
        return errorHandler.handleError({
            error: {status: 500, error: `Error: ${e}`, display: false},
            res: res,
            req: req
        })
    } 
}])

/**
 * Rota responsável por alterar um usuário
 */
router.put('/:id', [verifyIfUserExists, async (req, res) => {
    let connection;
    try {
        let json = {
            status: "updated_info"
        }
        if(req.body.name === "") {
            return errorHandler.handleError({
                req: req,
                res: res,
                error: {display: true, status: 403, error: "The name couldn't be empty."}
            });
        }else {
            json.name = req.body.name
        }

        let currentUser = await User.findByID(req.params.id);

        if(req.body._id != null && req.body._id !== "" && req.body._id !== req.params.id) {
            let userVerify = await User.findByID(req.body._id);
            if(userVerify != null) {
                return errorHandler.handleError({
                    req: req,
                    res: res,
                    error: {display: true, status: 403, error: "Already have an user with this ID."}
                });
            }else {
                json._id = req.body._id
            }
        }
        connection = await mySQLWrapper.getConnectionFromPool();
        let updatedUser = await User.update(currentUser.id, json, connection);
        await mySQLWrapper.commit(connection)
        return res.status(200).json(updatedUser)
    } catch (e) {
        errorHandler.logger.log("error", e);
        return errorHandler.handleError({
            error: {status: 500, error: `Error when updating : ${e}`, display: false},
            res: res,
            req: req
        })
    }
}])

module.exports = router;
