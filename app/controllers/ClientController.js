const path = require('path');
const _ = require('lodash');
const helpers = require('../../helpers');
const parse = require('csv-parse');
const fs = require('fs');
const yup = require('yup');
const cep = require('cep-promise');


class ClientController {

    async upload(req, res, next) {
        const { originalname, mimetype, filename } = req.file

        if (mimetype !== 'text/csv') {
            return res.json({ message: `File extension invalid. You are pasing ${extension} instead of csv` })
        }

        const [username, code] = originalname.split('_')
        const [normalizedCode,] = code.split('.')

        if (username == undefined || normalizedCode == undefined) {
            return res.json({ message: `File name format invalid '${originalname}'. Change the file name to pattern: 'username_code.csv'` })
        }

        try {
            const user = await User
                .findOrCreate({ where: { code: normalizedCode }, defaults: { name: helpers.titleize(username), code: normalizedCode } })
                .then(([user, created]) => {
                    return user.get({
                        plain: true
                    })
                })

            const fileObj = {
                user_id: user.id,
                file_name: originalname,
                status: 'processing'
            }

            const file = await FileProcess.create(fileObj)

            fs.createReadStream(`${path.resolve('tmp', 'uploads')}/${filename}`)
                .pipe(parse({
                    delimiter: ';',
                    columns: true,
                    skip_empty_lines: true
                }, async (err, data, { lines, records }) => {

                    if (err) {
                        return res.json({ file: err })

                    }


                    const list = data.map(row => {
                        const obj = _.mapKeys(row, (v, k) => k.toLowerCase())

                        obj.status = 'processing'
                        obj.user_id = user.id
                        obj.process_id = file.id

                        return new ClientDto(obj)
                    });

                    ClientTemp.bulkCreate(list)

                    await Queue.add(HandleWithFileClientProcess.key, {
                        file
                    })
                }
                ))

            const uploadResponse = {

                "user_code": user.code,
                "name": user.name,
                "created_at": user.create_at,
                "file_name": file.file_name,
                "file_process": file.id,
                "url_file_process": process.env.API_HOST + 'upload/process/' + file.id,
                "process_status": file.status
            }

            return res.json(uploadResponse)
        } catch (err) {
            return res.err;
        }
    }

}

module.exports = new ClientController()