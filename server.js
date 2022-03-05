import express from 'express'
import ejs from 'ejs';
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
const app =  express()
app.use(express.static("public"));

app.set('view engine','ejs');

const PORT = process.env.PORT || 3000

app.get("/",(req,res)=>{
    res.render('index')
})

app.get("/authentication",(req,res)=>{
    res.render('authentication');
})

app.get("/registration",(req,res)=>{
    res.render('registration');
})

app.get('/setup',(req,res)=>{
    var secret = speakeasy.generateSecret({length: 20});
    QRCode.toDataURL(secret.otpauth_url, function(err, image_data) {
        res.render('setup',{secret:secret.base32,'qrcode':image_data})
    });
})
app.listen(PORT,()=>console.log(`server running on port ${PORT}`))

