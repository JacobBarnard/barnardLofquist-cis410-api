const sql = require('mssql')
const tLofConfig = require('./config.js')
const config = {
    user: tLofConfig.DB.user,
    password: tLofConfig.DB.password,
    server: tLofConfig.DB.server,
    database: tLofConfig.DB.database,
}


async function executeQuery(aQuery){
    var connection = await sql.connect(config)
    var result = await connection.query(aQuery)

    return result.recordset
}


module.exports = {executeQuery: executeQuery}