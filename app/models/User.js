const mysqlWrapper = require('../database/mysqlWrapper');

class User {

    /**
     *
     *  Insere um registro na tabela users
     * @static
     * @param {*} {connection, data}
     * @returns
     * @memberof User
     */
    static async insert({connection, data}) {
        try {
            let insertUser = await mysqlWrapper.createTransactionalQuery({
                query: `INSERT INTO users SET ?`,
                params: data,
                connection
            })
            let user = this.findByInsertedID(insertUser.insertId, connection)
            return user
        }catch(e) {
            throw e
        }
    }

    /**
     * Busca por um registro na tabela users através do seu ID
     *
     * @static
     * @param {*} {id, connection}
     * @returns
     * @memberof User
     */
    static async findByID(id, connection) {
        try {
            let user = await mysqlWrapper.createTransactionalQuery({
                query: `SELECT users._id, name, data_sent, status FROM users WHERE _id = ?`,
                params: [id],
                connection
            })
            return user.shift()
        }catch(e) {
            throw e
        }
    }

    /**
     * Busca por um registro na tabela users através do seu ID (sem transaction)
     *
     * @static
     * @param {*} {id, connection}
     * @returns
     * @memberof User
     */
    static async findByID(id) {
        try {
            let user = await mysqlWrapper.createQuery({
                query: `SELECT id, _id, name, data_sent, status FROM users WHERE _id = ?`,
                params: [id],
            })
            return user.shift()
        }catch(e) {
            throw e
        }
    }

    /**
     * Remove um registro da tabela users
     * @static
     * @param {*} {id, connection}
     * @memberof Users
     */
    static async delete({id, connection}) {
        try {
            await mysqlWrapper.createTransactionalQuery({
                query: `DELETE FROM users WHERE _id = ?`,
                params: [id],
                connection
            })
        }catch(e) {
            throw e
        }
    }

    /**
     *Retorna um usuario pelo seu id auto increment
     *
     * @static
     * @param {*} id
     * @returns
     * @memberof User
     */
    static async findByInsertedID(id, connection) {
        try {
            let user = await mysqlWrapper.createTransactionalQuery({
                query: `SELECT id, _id, name, data_sent, status FROM users WHERE id = ?`,
                params: [id],
                connection
            })
            return user.shift()
        }catch(e) {
            throw e
        }
    }

     /**
     * Atualiza um registro da tabela users
     *
     * @static
     * @param {*} id
     * @param {*} data
     * @param {*} connection
     * @returns
     * @memberof User
     */
    static async update(id, data, connection) {
        try {
            await mysqlWrapper.createTransactionalQuery({
                query: `UPDATE users set ? WHERE id = ?`,
                params: [data, id],
                connection
            })
            let user = await this.findByInsertedID(id, connection)
            delete user.id
            return user
        }catch(e) {
            throw e;
        }
    }


}

module.exports = User;