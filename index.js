const express = require('express')
const db = require('./dbConnectTLof.js')
const app = express();
const jwt = require('jsonwebtoken')
const config = require('./config.js')
// const bcrypt = require('bcryptjs')
app.use(express.json())

//Question 1
app.get("/course", (req, res) => {
    //get data from database
    db.executeQuery(
        `SELECT * from Course
        left join Department 
        on Department.DepartmentIDPK = Course.DepartmentIDFK`)
        .then( (result) => {
            console.log(result)
            res.status(200).send(result)
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send()
        })
})

//set port for local host
app.listen(5000, () => {
    console.log("app is running on port 5000")
})