import 'dotenv/config';
import express from 'express'
import ejs from 'ejs';
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import bodyparser from 'body-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import  {mysqlConnection} from './DBconnection.js';
import cookieParser from 'cookie-parser';
import {
    verify_jwt_token,
    checkNotAuthenticated,
    checkAuthenticated,
    verify_two_factor_token 
} from './authentication.js'
import {
    signupValidation,
    loginValidation
    } from './validation.js';
//import {mysqlConnection} from './DBconnection.js';
const app =  express();

app.use(express.static("public"));
app.use(cookieParser());
app.set('view engine','ejs');
app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json());

const PORT =  3000;

let loginError = '';
app.get("/",checkNotAuthenticated,async (req,res)=>{
    res.render('login',{error:loginError});
})
app.get('/Two_Factor_verify',checkAuthenticated,(req,res)=>{
    res.render('Two_Factor_verify',{error:''});
})
app.get('/home',checkAuthenticated,(req,res,next)=>{
    //res.render('home');
})

let register_error = '';
app.get("/register",checkNotAuthenticated,signupValidation,(req,res)=>{
    res.render('register',{'error':register_error});
})

// User enters 2_FA code after login page
app.post('/authentication',async (req,res)=>{
    let user_token ='';
    req.body.digit.forEach( data =>{
        user_token = user_token.concat(data);
    })
    user_token = Number.parseInt(user_token);

    let {token} = req.cookies;
    let jwt_verified =  verify_jwt_token(token);
    if(jwt_verified ){
        const server_secret = mysqlConnection.query(
            `SELECT user_secret_token FROM users WHERE user_id = ${jwt_verified.id}`,(err,result)=>{
                let verifed_two_factor_token = verify_two_factor_token(result[0].user_secret_token,user_token);
                if(verifed_two_factor_token ){
                    jwt_verified['Two_factor_verified']=true;
                    const new_token = jwt.sign(jwt_verified,process.env.JWT_SECRET);
                        res.cookie('token',new_token,{maxAge:60*60*1000,httpOnly:true});
                        res.redirect('/home');
                }else{
                    res.render('Two_Factor_verify',{error:'Try Again'});
                }

            });
    }else{
        res.redirect('/');
    }

});


app.post('/login',loginValidation,(req,res,next)=>{
        
        mysqlConnection.query(
            `SELECT * FROM users WHERE LOWER(user_email) = LOWER("${mysqlConnection.escape(
            req.body.email)}");`,
            (err, result) => {
            if (result.length) {

                    bcrypt.compare(req.body.password,result[0].user_password,(err,bcrypt_result)=>{
                        if(bcrypt_result){ 
                            console.log('successful password mathch');
                            const token = jwt.sign({id:result[0].user_id,user_name:result[0].email,Two_factor_verified:false,},process.env.JWT_SECRET,{ expiresIn: '1h' });
                            res.cookie('token',token,{maxAge:10*60*1000,httpOnly:true,sameSite:'strict'});
                            res.render('Two_Factor_verify',{error:''});
                            }
                        else{
                            // incorrect password
                            loginError = '1';
                            res.redirect('/');
                        };
                    }
            );
            
            }else{
                // incorrect user name
                loginError = '1';
                res.redirect('/');
                console.log('user not found ');
        }});

})


app.post('/register',checkNotAuthenticated,(req,res)=>{
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
            console.log('bcrypt error in /register:',err);
        } else {
            let secret = speakeasy.generateSecret({length: 20});
            //console.log('secret is',secret);
                    QRCode.toDataURL(secret.otpauth_url, function(err, image_data) {
                    res.render('setup_authentication',{secret:secret.base32,'qrcode':image_data})
            });

            mysqlConnection.query(
            `INSERT INTO users (user_email, user_password, user_secret_token) VALUES ( "${mysqlConnection.escape(
            req.body.email)}", ${mysqlConnection.escape(hash)},"${secret.base32}")`,
            (err, result) => { 
                if (err){
                    console.log(err.message);
                }

            });
            }
        });
        }
        }
        );
})

app.post('/logout',(req,res)=>{
    res.clearCookie("token");
    res.redirect('/');
})

app.listen(PORT,()=>console.log(`server running on port ${PORT}`))

