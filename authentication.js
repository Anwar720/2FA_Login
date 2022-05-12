import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';

const verify_jwt_token = (token) =>{
    const verified = jwt.verify(token,process.env.JWT_SECRET);
    if(verified.id != undefined) return verified;
    return undefined;
}

function checkAuthenticated(req, res, next) {
    let {token} = req.cookies;
    if(!token) return res.redirect("/");
    let verified = verify_jwt_token(token);
    if( verified == undefined) return res.redirect("/");
    if(verified.Two_factor_verified === false) return res.render('Two_Factor_verify',{error:''});
    if(verified.Two_factor_verified === true) return res.render('home');
    return next();
};

function checkNotAuthenticated(req, res, next) {
    let {token} = req.cookies;
    if(!token) return next();

    let verified = verify_jwt_token(token);
    if( verified.Two_factor_verified === true) return res.redirect("/home");
    if(verified.Two_factor_verified === false) return res.render('Two_Factor_verify',{error:''});
};
const verify_two_factor_token = (server_token,user_token) =>{
    const two_factor_verified = speakeasy.totp.verify({
        secret:server_token,  
        encoding:'base32',
        token:user_token
    });
    if(two_factor_verified )return true;
    return false;
}

export{
    verify_jwt_token,
    checkNotAuthenticated,
    checkAuthenticated,
    verify_two_factor_token 
}