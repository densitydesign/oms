$(document).ready(function(){

 // $("#protocol").css("left","97%");



//General interactions

$('.carousel').carousel({
  "wrap":false,
  "interval":false
})

$("#protocol").click(function() {
  console.log($("#protocol").css("right"))
  if($("#protocol").css("right") != '0px'){ 
    $("#protocol").css("right",0);
    $(".close-btn").css('-webkit-transform','rotate(90deg)');
    $(".close-btn").css('-moz-transform','rotate(90deg)');
  }

})

$("#protocol").click(function() {
 // console.log($("#protocol").css("right"))
  if($("#protocol").css("right")=="0px") {
    $("#protocol").css("right","-360px");
    $(".close-btn").css('-webkit-transform','rotate(45deg)');
    $(".close-btn").css('-moz-transform','rotate(45deg)');

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


