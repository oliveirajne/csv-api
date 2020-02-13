const mysqlWrapper = require('../database/mysqlWrapper');

class Client {

    /**
     * Insere um registro na tablea clients
     *
     * @static
     * @param {*} {connection, data} conexão e payload
     * @returns
     * @memberof Client
     */
    static async insert({connection, data}) {
        try {
            let insertUser = await mysqlWrapper.createTransactionalQuery({
                query: `INSERT INTO clients SET ?`,
                params: this.clientAsDBFormat(data),
                connection
            })
            let user = this.findByID({id: insertUser.insertId, connection})
            return user
        }catch(e) {
            throw e
        }
    }

    /**
     * Recupera um registro na tabela clients através do seu ID
     *
     * @static
     * @param {*} {id, connection} id do client, conexão
     * @returns
     * @memberof Client
     */
    static async findByID({id, connection}) {
        try {
            let client = await mysqlWrapper.createTransactionalQuery({
                query: `SELECT clients.* FROM clients WHERE _id = ?`,
                params: [id],
                connection
            })
            return this.clientToJSON(client.shift())
        }catch(e) {
            throw e
        }
    }

    /**
     * Remove um registro da tabela clients
     * @static
     * @param {*} {id, connection}
     * @memberof Client
     */
    static async deleteByUserID({userID, connection}) {
        try {
            await mysqlWrapper.createTransactionalQuery({
                query: `DELETE FROM clients WHERE users_id = ?;`,
                params: [userID],
                connection
            })
        }catch(e) {
            throw e
        }
    }

    /**
     *
     * Transforma o objeto client no padrão JSON
     * @static
     * @param {*} client - objeto client
     * @returns
     * @memberof Client
     */
    static clientToJSON(client) {
        return {
            _id: client._id,
            name: client.name,
            CEP: client.CEP,
            CPF: client.CPF,
            data_sent: client.data_sent,
            address: {
                district: client.district,
                street: client.street,
                state: client.state
            }
        }
    }

    static async getUserClients(userID) {
        try {
            let clients = await mysqlWrapper.createQuery({
                query: `SELECT clients.* FROM clients WHERE users_id = ?`,
                params: [userID]
            })
            return clients.map(client => this.clientToJSON(client));
        }catch(e) {
            throw e
        }
    }

    /**
     *  Transforma um json client em um json padrão banco de dados
     *
     * @static
     * @param {*} client
     * @returns
     * @memberof Client
     */
    static clientAsDBFormat(client) {
        return {
            name: client.name,
            CEP: client.CEP,
            CPF: client.CPF,
            data_sent: client.data_sent,
            district: client.address.district,
            street: client.address.street,
            state: client.address.state,
            users_id: client.users_id
        }
    }
}

module.exports = Client;