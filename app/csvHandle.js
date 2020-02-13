const reqwest = require('reqwest');
const errorHandler = require('../helpers');

/**
 * Monta um json com as informações do .csv
 * @param {*} fileContent - O conteúdo bruto do .csv 
 */
async function cleanFileData(fileContent) {
    let values = []
    await Promise.all(fileContent.map(async (value, index) => {
        let splittedValue = value.shift().split(";").filter(eachVal => eachVal !== "")
        if(splittedValue.length > 0 && index > 0) {
            let val = {
                name: splittedValue[0],
                CEP: parseInt(splittedValue[1]),
                CPF: parseInt(splittedValue[2]),
                data_sent: new Date()
            }
            values.push(val)
            try {
                let result = await reqwest({
                    url: `https://viacep.com.br/ws/${val.CEP}/json/`,
                    method: 'get'
                })
                val.address = {
                    district: result.bairro,
                    street: result.logradouro,
                    state: result.localidade
                }
            }catch(e) {
                errorHandler.logger.log('info', `The address information for ${val.name} was not found with zip code ${val.CEP}.`)
                val.address = null
            }
        }
    }))
    // remove todos os clientes que possuam dados inválidos
    return values.filter(value => value.address != null)
}

module.exports.cleanFileData = cleanFileData;