$(document).ready(function(){
    $('input[type="checkbox"]').click(function(){
        if($(this).prop("checked") == true){
            $("#admin-code").removeAttr("disabled");
        }
        else if($(this).prop("checked") == false){
            $("#admin-code").prop("disabled", true);
        }
    });
});