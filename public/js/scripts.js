
// varify that re-entered password match in registration
document.getElementById("register").addEventListener("submit",(event)=>{
    let password = document.getElementById('password')
    let reentered_password = document.getElementById('verify-password');
    let error = document.querySelector('.error');
    if(password.value !== reentered_password.value){
        error.innerText = 'Password does not match';
        error.style.color="red";
        event.preventDefault();

    }
});


//login page
document.querySelector('.submit').addEventListener('click',()=> {
    let email = document.getElementById('email').value;
    localStorage.setItem('email',email)})

