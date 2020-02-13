const mySQLConnector = require('./mysqlConnector');

class MySQLWrapper {
    
    /**
     * 
     * 
     * Cria queries no banco
     * @param {String} query - a query propriamente dita
     * @param {Array} params - os parametros a serem substituidos pelos ? informados
     * @returns {Promise} - Retorna uma promessa com o resultados
     * 
     */
    static createQuery({query, params}) {
        return new Promise((succeed, fail) => {
            mySQLConnector.pool.getConnection((err, connection) => {

                //Retorna uma falha de promessa no carro de erro ao recuperar a conexão aberta
                if (err) {
                    return fail(err)
                }
                // Executa a query
                connection.query(query, params, (err, rows) => {

                    //Devolve a conexão quando executado
                    connection.release()

                    //Se houver algum erro ao montar/executar a query, retorna uma falha de promessa
                    if (err) {
                        return fail(err)
                    }

                    //Sucesso da promessa
                    return succeed(rows)
                })
            })
        })
    }

    /**
     * 
     * 
     * Roda uma query transacional para utilizar a mesma conexão da transação em questão
     * @param {MySQL.Connection} connection - A conexão que a transação irá utilizar
     * @param {String} query - A query propriamente dita
     * @param {Array} params - os parametros a serem substituidos pelos ? informados
     * @returns {Promise} - Retorna a promessa com os resultados
     * 
     */
    static createTransactionalQuery({query, params, connection}) {
        
        return new Promise((succeed, fail) => {
            connection.query(query, params, (err, rows) => {
                
                //Se houver algum erro ao montar/executar a query, retorna uma falha de promessa
                if (err) {
                    return fail(err)
                }
                
                // Sucesso da promessa
                return succeed(rows)
            })
        })
    }
    
    /**
     * 
     * 
     * Rollbacks da transação
     * @param {MySQL.Connection} connection - A conexão que a transação irá realizar o rollback
     * @returns {Promise} - A promessa para o rollback
     * 
     */
    static rollback(connection) {
        return new Promise((succeed, fail) => {
            try {
                connection.rollback(() => succeed())
            } catch (e) {
                return fail(e)
            } finally {
                connection.release()
            }
        })
    }

    /**
     * 
     * 
     * Comiita a transação
     * @param {MySQL.Connection} connection - A conexão que trnasação irá commitar
     * @returns {Promise} - A promessa para o commit
     * 
     */
    static commit(connection) {
        return new Promise((succeed, fail) => {
            try {
                connection.commit(err => { 
                    if (err) { 
                        return rollback(connection, err)
                    }
                    return succeed()
                })
            } catch (e) {
                return fail(e)
            } finally {
                connection.release()
            }
        })
    }

    /**
     * 
     * 
     * Retorna a conexão do pool que irá ser transacionada
     * @param {MySQL.Connection} connection - A connection from the pool
     * 
     */
    static getConnectionFromPool() {
        return new Promise((succeed, fail) => {
            mySQLConnector.pool.getConnection((err, connection) => {
                if (err) {
                    return fail(err)
                }
                //Retorna a conexão
                return succeed(connection)
            })
        })
    }

    /**
     * Inicia uma transação na coenxão
     * @param {MySQL.Connection} connection - A conexão do pool
     */
    static beginTransaction(connection) {
        return new Promise((succeed, fail) => {
            connection.beginTransaction(err => {
                if (err) {
                    return fail(err)
                }
                //Fulfills the promise
                return succeed(connection)
            })
        })
    }
}

module.exports = MySQLWrapper