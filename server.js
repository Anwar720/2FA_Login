import 'dotenv/config';
import express from 'express'
import ejs from 'ejs';
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import bodyparser from 'body-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
/*import  mysqlConnection from './mysqlConnectionconnection.js';*/
import {check} from 'express-validator';

import mysql from 'mysql';
// const mysqlConnection = mysql.createConnection({
//   host: DB_HOST_IP, // Replace with your host name
//   port:3306,
//   user: DATABASE_USER,      // Replace with your database username
//   password:  process.env.DATABASE_PASS,      // Replace with your database password
//   database: '2_step_login' // // Replace with your database Name
// }); 


const mysqlConnection = mysql.createConnection({
    connectionLImit:50,
    host:'--------', // Replace with your host name
    port: 3306,
    user: process.env.DATABASE_USER,      // Replace with your database username
    password:  process.env.DATABASE_PASS,      // Replace with your database password
    database: '2_step_login' // // Replace with your database Name
  }); 
 
mysqlConnection.connect(function(err) {
  if (err) console.log (err);
  console.log('Database is connected successfully !');
});
//module.exports = mysqlConnection;
 
const app =  express();

app.use(express.static("public"));

app.set('view engine','ejs');
app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json());

const PORT =  3000;


let signupValidation = [
    check('name', 'Name is requied').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail().normalizeEmail({ gmail_remove_dots: true }),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
]
   
 let loginValidation = [
    check('email', 'Please include a valid email').isEmail().normalizeEmail({ gmail_remove_dots: true }),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
    ]

app.get("/",(req,res)=>{
    res.render('login')
})

let register_error = '';
app.get("/register",signupValidation,(req,res)=>{
    res.render('register',{'error':register_error});
})

app.post('/authentication',(req,res)=>{
    let user_token ='';
    req.body.digit.forEach( data =>{
        user_token = user_token.concat(data);
    })
    user_token = Number.parseInt(user_token);
    console.log(user_token);

    //verify 2FA login
    const verified = speakeasy.totp.verify({
        secret:secret,   //<<-- load secret key from data base-->>
        encoding:'base32',
        token:user_token
    });

    // if tokems match then render the homepage
    if(verified){
        res.render('home');
    }
});

app.post('/login',loginValidation,(req,res,next)=>{
    /*let email = req.body.email;
    let password = req.body.password;

    console.log('user email is:',email);
    mysqlConnection.query(
        `SELECT * FROM users WHERE user_email = '${mysqlConnection.escape(req.body.email)}';`,
        (err, result) => {
        // user does not exists
        if (err) {
       // throw err;
        // return res.status(400).send({
        // msg: err
        // });
        console.log('error :',err.message);
        }
       // console.log('result is ',...result);
        if ( !result || !result.length) {
        // return res.status(401).send({
        // msg: 'Email or password is incorrect!'
        /// });
        console.log('result is ',result);
        }
        // check password
        bcrypt.compare(
        req.body.password,
        result[0]['user_password'],
        (bErr, bResult) => {
        // wrong password
        if (bErr) {
       // throw bErr;
        // return res.status(401).send({
        // msg: 'Email or password is incorrect!'
        // });
        console.log('bcrypt error',error.message);
        }
        if (bResult) {
        const token = jwt.sign({id:result[0].id},'the-super-strong-secrect',{ expiresIn: '1h' });
        mysqlConnection.query(
        `UPDATE users SET last_login = now() WHERE user_id = '${result[0].id}'`
        );
        console.log('successful login!!!!');
        // return res.status(200).send({
        // msg: 'Logged in!',
        // token,
        // user: result[0]
        // });
        }
        // return res.status(401).send({
        // msg: 'Username or password is incorrect!'
        // });
        }
        );
        }
        );*/
        // mysqlConnection.query(`SELECT * from users where user_email = '${req.body.username}'`,(err,result)=>{
        //     console.log('result is :',result);
        //     if(result.length > 0){  console.log('user exists in the db');
        //     res.render('two-factor-authentication');
        // }else{
        //         console.log('incorrect username');
        //         res.redirect('/');
        //     }
        // })

        
        mysqlConnection.query(
            `SELECT * FROM users WHERE LOWER(user_email) = LOWER("${mysqlConnection.escape(
            req.body.email)}");`,
            (err, result) => {
            if (result.length) {

              // console.log('result is',result);

                    console.log('result is:',result,req.body.password);
                    
                    bcrypt.compare(req.body.password,result[0].user_password,(err,bcrypt_result)=>{
                        if(bcrypt_result != undefined){ 
                             console.log('successful password mathch');
                             const token = jwt.sign({'user_name':result[0].user_name,'password':result[0].user_password},'the-super-strong-secrect',{ expiresIn: '1h' });
                            console.log('token is ',token);
                             res.render('two-factor-authentication');
                            }
                        else{console.log('password not matched')};
                    }
                    
                
                
                     
                    
        
            );
            
            }else{
                console.log('user not found ');
        }});
})

app.post('/register',(req,res)=>{
     // check mysqlConnection to see if user exist 
    //if user dosen't exist create user

   // mysqlConnection.connect(function(err) {
       // if (err) throw err;
     //  console.log("Connected!");
    //  console.log('Email adn password are :',req.body.email,req.body.password)
    //     var sql = `INSERT INTO users (user_email, user_password) VALUES ("${req.body.email}", "${req.body.password}")`;
    //     mysqlConnection.query(sql, function (err, result) {
    //       if (err) throw err;
    //       console.log("1 record inserted");
    //     });
    // });


    mysqlConnection.query(
        `SELECT * FROM users WHERE LOWER(user_email) = LOWER("${mysqlConnection.escape(
        req.body.email
        )}");`,
        (err, result) => {
        if (result.length) {
            register_error= 'User already exists.';
            res.redirect('/register');
        
        } else {
        // username is available
        bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
        // return res.status(500).send({
        // msg: err
        // });
        } else {
        // has hashed pw => add to database
        let secret = speakeasy.generateSecret({length: 20});
        console.log('secret is',secret);
        //<<-- Store secret key in mysqlConnection -->>
                QRCode.toDataURL(secret.otpauth_url, function(err, image_data) {
                res.render('setup_authentication',{secret:secret.base32,'qrcode':image_data})
        });

        mysqlConnection.query(
        `INSERT INTO users (user_email, user_password, user_secret_token) VALUES ( "${mysqlConnection.escape(
        req.body.email
        )}", ${mysqlConnection.escape(hash)},"${secret.base32}")`,
        (err, result) => {
        if (err) {
        throw err;
        return res.status(400).send({
        msg: err
        });
        }else{
//             let secret = speakeasy.generateSecret({length: 20});
//     //<<-- Store secret key in mysqlConnection -->>
//             QRCode.toDataURL(secret.otpauth_url, function(err, image_data) {
//             res.render('setup_authentication',{secret:secret.base32,'qrcode':image_data})
//    // });
        }
        // return res.status(201).send({
        // msg: 'The user has been registerd with us!'
        // });
        }
        );

   // });
        }
        });
        }
        }
        );
        /*});/*
        )
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.password, salt, (err, hash) => {
            // <<-- Store salt and hash in mysqlConnection -->>
            console.log(`salt is ${salt} and hash is ${hash}`);
        });
    });*/

    // generating 2FA secret key 
    // let secret = speakeasy.generateSecret({length: 20});
    // //<<-- Store secret key in mysqlConnection -->>
    // QRCode.toDataURL(secret.otpauth_url, function(err, image_data) {
    //     res.render('setup_authentication',{secret:secret.base32,'qrcode':image_data})
    // });
})
 app.post('/verify-setup',(req,res)=>{
     let secret = req.body.secret;
     console.log('secret sting is;',req.body);

 }) 
// app.post('/verify-setup',(req,res)=>{

// })

app.listen(PORT,()=>console.log(`server running on port ${PORT}`))

