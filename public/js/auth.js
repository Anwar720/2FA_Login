const digit = document.querySelectorAll('.digits');
digit[0].focus();
// User enters 2FA token and input border color changes 
//shifts focus to next input box
digit.forEach( (item,idx)=>{
  if( idx <= 5){ 
    item.addEventListener('keyup',(elem)=>{
    if(idx < 5 && Number.isInteger(parseInt(elem.key))){
      item.style.borderBottom = '2px solid rgb(7, 205, 96)';
      digit[idx+1].focus();
    }else if(idx === 5 && Number.isInteger(parseInt(elem.key))){
      item.style.borderBottom = '2px solid rgb(7, 205, 96)';
    }
})}else if(idx == 5 && Number.isInteger(parseInt(item.key))){
  item.style.borderBottom = '2px solid green';
}
});

// paste event when entering the 2fa code
digit[0].addEventListener('paste',(event)=>{
  let paste = (event.clipboardData || window.clipboardData).getData('text');
  for(let i = 1;i<paste.length && i < digit.length;i++){
    //this.nextSibling.innerText = parseInt(digit[i]);
    digit[i].value = parseInt(paste[i]);
  }
})
digit.addEventListener('')
