const jwt = require('jsonwebtoken')
const config = require('./config.js')
const db = require('./dbConnectTlof')

const auth = async(req, res, next)=> {
    // console.log(req.header('Authorization'))
    try{
        // decode token
        let myToken = req.header('Authorization').replace('Bearer ', '')

        
        //compare token with db token
        let decodedToken  = jwt.verify(myToken, config.JWT)

        // console.log(decodedToken)
        let studentPK = decodedToken.pk;
        // console.log(studentPK)

        let query = `SELECT StudentIDPK, StudName, StudEmail from Student where StudentIDPK = ${studentPK} and Token = '${myToken}'`

        // console.log(query)

        let returnedUser = await db.executeQuery(query)
        // console.log(returnedUser)
        //save info in request
        if(returnedUser[0]){
            req.student = returnedUser[0];
            next()
        }else{
            res.status(401).send('Authentication failed.')
        }

    }catch(myError){
        res.status(401).send("Authentication failed.")
    }
}

module.exports = auth