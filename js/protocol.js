$(document).ready(function(){

 // $("#protocol").css("left","97%");



//General interactions

$('.carousel').carousel({
  "wrap":false,
  "interval":false
})

$("body").on('click',"#proto-title-container",function() {
  console.log($("#protocol").css("right"))
  if($("#protocol").css("right") != '0px'){ 
    //$(".proto-title").addClass(".proto-fixed")
    $("#protocol").css("right",0);
    $(".close-btn").css('-webkit-transform','rotate(90deg)');
    $(".close-btn").css('-moz-transform','rotate(90deg)');
    $("#proto-title-container").css("right","360px")
  }
   else if($("#protocol").css("right")=="0px") {
   // $(".proto-title").removeClass(".proto-fixed")
    $("#protocol").css("right","-360px");
    $(".close-btn").css('-webkit-transform','rotate(45deg)');
    $(".close-btn").css('-moz-transform','rotate(45deg)');
    $("#proto-title-container").css("right","0")
  }
})



$("b").hover(function() {
  height=$(this).position().top;
  att = $(this).attr('note');
  txt = notes[att]; 
  $(".section-text").append('<div class="note" style="top:'+height+'px">'+txt+'</div>');
},

function() {
  $(".note").remove();
})


});


