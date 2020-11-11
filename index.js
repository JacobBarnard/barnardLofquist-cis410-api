const express = require('express')
const db = require('./dbConnectTLof.js')
const app = express();
const jwt = require('jsonwebtoken')
const config = require('./config.js')
const cors = require('cors')
const bcrypt = require('bcryptjs')
app.use(express.json())
app.use(cors())
const { request, query} = require('express')
const auth = require('./authenticate.js')

//Question 1
app.get("/course", (req, res) => {
    //get data from database
    db.executeQuery(
        `SELECT * from Course
        left join Department 
        on Department.DepartmentIDPK = Course.DepartmentIDFK`)
        .then( (result) => {
            // console.log(result)
            res.status(200).send(result)
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send()
        })
})

//Question 2
app.get("/course/:pk", (req, res) => {
    var pk = req.params.pk
    // console.log("pk:", pk)
    var myQuery = `SELECT * from course left join Department on Department.DepartmentIDPK = Course.DepartmentIDFK
    WHERE CourseIDPK = ${pk}`

    db.executeQuery(myQuery)
        .then((courses) => {
            // console.log("movies: " + movies)
            if(courses[0]){
                res.send(courses[0])
            }else{
                res.status(404).send('bad request')
            }
        })
        .catch((err) => {
            console.log("Error in /course/pk", err)
            res.status(500).send()
        })
})

//Question 3
app.post("/student", async (req, res) => {
    // res.send("creating user")
    // console.log("body", req.body)

   
    var name = req.body.name;
    var address = req.body.address;
    var dob = req.body.dob;
    var phone = req.body.phone;
    var email = req.body.email;
    var password = req.body.password; 

    if (!name || !address|| !dob || !email || !phone || !password){
        return res.status(400).send("bad request")
    }

    name = name.replace("'", "''")

    

    var emailCheckQuery = `Select StudEmail
    from student
    where StudEmail = '${email}'`

   var exsistingUser = await db.executeQuery(emailCheckQuery)

   if( exsistingUser[0]){
    return res.status(409).send('Please enter a different email.')
   }

   var hashedPassword = bcrypt.hashSync(password)
   var insertQuery = `Insert into Student(StudName, StudAddress, StudDOB, StudEmail, StudPhone, Password )
   values ('${name}', '${address}', '${dob}', '${email}', '${phone}', '${hashedPassword}')`

   db.executeQuery(insertQuery).then(()=> {
       res.status(201).send()
   })
   .catch((err) => {
       console.log("error in POST /student", err)
       res.status(500).send()
   })

})
//set port 

//Question 4
app.post("/student/login", async (req, res) => {
    // console.log(req.body)

    var email = req.body.email;
    var password = req.body.password;

    if(!email || !password){
        return res.status(400).send('bad request')
    }

    var query = `Select * from student where StudEmail = '${email}'`

    let result;
    try{
        result = await db.executeQuery(query);
    }
    catch(myError){
        console.log("error in student login", myError)
        return res.status(500).send();
    }

    // console.log(result)

    if(!result[0]){
        return res.status(400).send('Invalid credentials')
    }

    let user = result[0];

    if(!bcrypt.compareSync(password, user.Password)){
        return res.status(400).send('Invalid credentials')
    }

    let token = jwt.sign({pk: user.StudentIDPK}, config.JWT, {expiresIn: '60 minutes'})

    console.log(token)

    let setTokenQuery = `update student set token = '${token}' where StudentIDPK = ${user.StudentIDPK}`

    try{
        await db.executeQuery(setTokenQuery)

        res.status(200).send({
            token: token,
            user: {
                Name: user.StudName,
                Email: user.StudEmail,
                StudentIDPK: user.StudentIDPK
            }
        })
    }
    catch(myError){
        console.log("error setting user token ", myError);
        res.status(500).send()
    }


})

//Question 5
app.post('/student/logout', auth, (req, res) => {
    var query = `Update Student set Token = NULL where StudentIDPK = ${req.student.StudentIDPK}`

    db.executeQuery(query)
    .then(() => {res.status(200).send()})
    .catch((error)=>{
        console.log("error in POST /student/logout", error)
        res.status(500).send()
    })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`app is running on port ${PORT}`)
})