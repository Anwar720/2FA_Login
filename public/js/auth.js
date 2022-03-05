// const {nodemailer} = require('nodemailer');
// import nodemailer from 'nodemailer'

const email = localStorage.getItem('email');
let button = document.getElementById('auth_submit');
let container = document.querySelector('.container');
let login_page  = document.querySelector('.login');
let error_msg = document.querySelector('.error');
let user_entered_code ='';
let generated_code='';

//<-----Generates Code on page load--------->
window.onload = () => {
  while(generated_code.length != 6){
    generated_code = generate_code();
  }
  console.log('Two factor code is:',generated_code);
};


// <------function creates and return string version of 2FA code---->
const generate_code = ()=>{
  return  String( Math.floor(Math.random() * 1000000)); 
}

// <----Two factor varification---->
button.addEventListener('click',()=>{
  //stores numbers entered by users in user_entered_code
    document.querySelectorAll('.digits')
      .forEach(element=>{
        if(element.validity.valid){
          element.style.borderBottom = '2px solid white';
          user_entered_code = user_entered_code.concat(element.value)}
        else{
          element.style.borderBottom = '2px solid red';
        }
      });

    // Checks if user entered code is same as generated code
  if(user_entered_code === generated_code){
    login_page.style.display="none";
    const overlay = document.createElement('div');
    overlay.innerHTML = '<div class="output">Welcome!</div>'
    container.appendChild(overlay);
    localStorage.removeItem('email');

  }else{
    error_msg.innerText = "Try again"
  }
  
})



//<------------NodeMailer to send the code via email--------------->

// function email_code(){
  // alert('sent');
//   button.addEventListener('click',()=>{
//   generated_code = generate_code();
//   alert(generate_code,' sent');
//   var transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: 'csci400project@gmail.com',
//       pass: 'GroupCapstone99'
//     }
//   });

// console.log('code is',generated_code);
//   var mailOptions = {
//     from: 'csci400project@gmail.com',
//     to: `csci400project@gmail.com`,
//     subject: 'Sending Email using Node.js',
//     text: `${generated_code}`
//   };

//   transporter.sendMail(mailOptions, function(error, info){
//     if (error) {
//       console.log(error);
//     } else {
//       console.log('Email sent: ' + info.response);
//     }
//   });
// })

