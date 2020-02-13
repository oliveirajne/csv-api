const mysql = require('mysql');
const errorHandler = require('../../helpers');


//Constantes para serem carregadas as credenciais de acesso ao banco de dados
const MYSQL_DB_USER = process.env.MYSQL_DB_USER || 'root';
const MYSQL_DB_NAME = process.env.MYSQL_DB_NAME || 'api-csv';
const MYSQL_DB_PASSWORD = process.env.MYSQL_DB_PASSWORD || '';
const MYSQL_DB_ADDRESS = process.env.MYSQL_DB_ADDRESS || 'localhost';
const MYSQL_DB_POOL_SIZE = process.env.MYSQL_DB_POOL_SIZE || 10;

(() => {
    console.log('-------------------')
    console.log('Connecting to MySQL')
    console.log(`Address: ${MYSQL_DB_ADDRESS}`)
    console.log(`User: ${MYSQL_DB_USER}`)
    console.log(`Database: ${MYSQL_DB_NAME}`)
    console.log('-------------------')
}).call(this)

class MySQLConnector {

    constructor() {
        //Instancia o pool de conexões
        this.internalPool = mysql.createPool({
            host: MYSQL_DB_ADDRESS,
            user: MYSQL_DB_USER,
            database: MYSQL_DB_NAME,
            password: MYSQL_DB_PASSWORD,
            connectionLimit: MYSQL_DB_POOL_SIZE,
            waitForConnections: true
        })

        //Permite um melhor controle das conexões abertas
        //this.registerThreadCounter()
    }

    /**
     * Registra um evento de captura quando novas conexões forem abertas
     */
    // registerThreadCounter() {
    //     this.internalPool.on('connection', (connection) => errorHandler.logger.log('info', `New connection stablished with server on thread #${connection.threadId}`))
    // }

   /**
    * Retorna o pool de conexões
    */
    get pool() {
        return this.internalPool
    }
}

//Cria o singleton para ser utilizado no wrapper
module.exports =  new MySQLConnector()