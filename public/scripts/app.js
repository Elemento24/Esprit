var Comments = document.getElementsByClassName("indComment");  //better use some id and then use getElementById
var commentButtons = document.getElementsByClassName('EditDeleteButton');
console.log(commentButtons);

for(var i=0 ; i < Comments.length ; i++){
    console.log(Comments[i]);
    console.log(commentButtons[i]);
    
    Comments[i].onmouseover = function() {
        console.log('Hello');
        commentButtons[i].style.display = 'block';
    };
    
    Comments[i].onmouseout = function() {
        commentButtons[i].style.display = 'none';
    };
}