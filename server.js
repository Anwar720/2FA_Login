import express from 'express'
import ejs from 'ejs';
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import bodyparser from 'body-parser';
import bcrypt from 'bcrypt';
const app =  express();

app.use(express.static("public"));

app.set('view engine','ejs');
app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json());

const PORT =  3000;

app.get("/",(req,res)=>{
    res.render('login')
})

app.get("/register",(req,res)=>{
    res.render('register');
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

app.post('/',(req,res)=>{
    res.render('two-factor-authentication');
})

app.post('/register',(req,res)=>{
     // check db to see if user exist 
    //if user dosen't exist create user

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.password, salt, (err, hash) => {
            // <<-- Store salt and hash in db -->>
            console.log(`salt is ${salt} and hash is ${hash}`);
        });
    });

    // generating 2FA secret key 
    let secret = speakeasy.generateSecret({length: 20});
    //<<-- Store secret key in db -->>
    QRCode.toDataURL(secret.otpauth_url, function(err, image_data) {
        res.render('setup_authentication',{secret:secret.base32,'qrcode':image_data})
    });
})

// app.post('/verify-setup',(req,res)=>{

// })

app.listen(PORT,()=>console.log(`server running on port ${PORT}`))

