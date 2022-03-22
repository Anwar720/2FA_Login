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
