var step = 0;
var timer = 0;
var direction = 0;
var scrolltime = 10; //must be mutiplied by 100, value in millisecond for capturing the next scroll event

$( document ).ready(function() {

	$("#protocol").css("left", "97%");

	//General interactions

	$('.carousel').carousel({
		"wrap" : false,
		"interval" : false
	})

	$("#protocol").click(function() {

		if ($("#protocol").position().left > 0) {
			$("#protocol").css("left", 0);
			$(".close-btn").css('-webkit-transform', 'rotate(90deg)');
			$(".close-btn").css('-moz-transform', 'rotate(90deg)');
		}

	})

	$(".closing").click(function() {
		
		if ($("#protocol").css("left") == "0px") {

			$("#protocol").css("left", "97%");
			$(".close-btn").css('-webkit-transform', 'rotate(45deg)');
			$(".close-btn").css('-moz-transform', 'rotate(45deg)');

		}
	})

	$("b").hover(function() {
		height = $(this).position().top;
		att = $(this).attr('note');
		txt = notes[att];
		$(".section-text").append('<div class="note" style="top:' + height + 'px">' + txt + '</div>');
	}, function() {
		$(".note").remove();
	})

	$("#protocol").on("mousewheel DOMMouseScroll",function(event) {
		e.preventDefault();
		return false;
	});

	//=======================
	//scroll interaction

	//$('.long').on('mousewheel DOMMouseScroll', chk_scroll);
	$('.adva-cont').on('mousewheel DOMMouseScroll', disableScroll);
	
	//touch
	
	var hammerdoc = Hammer(document);
	
	 hammerdoc.on("drag", function(ev) {
        
        if (timer == 0) {
			timer = 20;
        direction = ev.gesture.direction=="down" ? "up" : "down";
        checkLevel();
        ev.gesture.preventDefault();
        }
        ev.gesture.preventDefault();
        return false;
    });
    
    $('section').hammer().on("drag",".adva-cont", function(event) {
        event.gesture.stopPropagation();
        event.stopPropagation();
        event.preventDefault();
        event.gesture.preventDefault();
        $(this).scrollTop($(this).scrollTop() - event.gesture.deltaY/10);
    });
    
    $(document).hammer().on("drag",".long", function(event) {
    	
    	
        if (timer == 0) {
		var elem = $(this);
		

		if (!(elem[0].scrollHeight - elem.scrollTop() == elem.outerHeight())) {
			event.stopPropagation();
			event.gesture.stopPropagation();
		} else {

		}
	}
    });
    
    
    
	//general scroll behaviour
	//$(document).on("mousewheel DOMMouseScroll", function(e) {
	
	$(document).mousewheel(function(e) {
		
		if (timer <1) {
			timer = 18;
			
			if (e.deltaY != undefined) {
				var delta = e.deltaY
				console.log("a")
			} 
			else if (e.originalEvent.detail != 0) {
				var delta = -e.originalEvent.detail;
				console.log("b")	
			} 
			else {
				var delta = -e.originalEvent.deltaY
				console.log("c")
				}
				
			if (delta < 0)
				direction = "down"
			else if (delta > 0)
				direction = "up";
			
			checkLevel();
		}
		else {
			console.log(e)
			e.preventDefault();
		}
		
		e.preventDefault();
		e.originalEvent.preventDefault();
		e.cancelBubble = false;
		return false;
		
	});
	
	});

	//timeout to check scroll updates
	timeoutid = setInterval('checkTime();', 100);

//timing for scroll update
function checkTime() {

	if (timer > 0) {
		timer--;
	}

}

function chk_scroll(e) {
	
	var elem = $(e.currentTarget);
	
	if(elem.attr("id") != checkPoints[step] && elem.attr("id") != checkPoints[step][0]) {
		
		e.preventDefault();
		e.originalEvent.returnValue=false;
		e.returnValue=false;
		return false;
	}
	
	if (timer < 1) {
		
		if ((elem[0].scrollHeight - elem.scrollTop() > elem.outerHeight())) {
			e.stopPropagation();
		} else {
			
		}
	}
	else {
		e.preventDefault();
		e.originalEvent.returnValue=false;
		return false;
	}
}

function disableScroll(e, delta) {
	var elem = $(e.currentTarget);
	
	elem.scrollTop(elem.scrollTop() - (40 * delta));
	//set_bar();
	e.stopPropagation();
	return false;
}

//load next or previous screen according to scroll direction
function checkLevel() {

	if (direction == "down" && step < checkPoints.length - 1) {
		step++;
		loadSection(checkPoints[step]);
		
		
		
	} else if (direction == "up" && step > 0) {
		step--;
		loadSection(checkPoints[step]);

	}
	$("#sgnaf").css("width",step/(checkPoints.length-1)*100+"%");
}

//end scroll
//====================

//====================
//Key handling

$(document).keydown(function(e) {

	e = e || window.event;

	

	if (e.keyCode == 38 && step > 0) {
		e.preventDefault();
		stepUp();
		
	} else if (e.keyCode == 40 && step < checkPoints.length - 1) {
		e.preventDefault();
		stepDown();
	}
	if (e.preventDefault)
		e.preventDefault();

	e.returnValue = false;
});

//====================

//utility to animate transition between divs
function scrollToID(id, speed) {
	id="#"+id;
	var targetOffset = $(id).offset().top;
	$(id).scrollTop(0);
	$('html,body').animate({
		scrollTop : targetOffset
	}, speed, function(){
		
		$(id).prev("section").empty()
  		$(id).next("section").empty()
		
	});
}
	
	function loadSection(sec) {

		var id, subsec;
		
		if ($.isArray(sec)) {
			id=sec[0];
			subsec=sec[1];
		}
		else id=sec;
		 
	
	if( !$('#'+id).html() ) {
  			$( "#"+id ).load( "sections/"+id+".html", function() {	
  				a=$(".adv-step:visible");
  				
  				if (subsec && !a.hasClass("step"+subsec)) {
		  			a.fadeOut(500,function(){$(".adva-cont").scrollTop(0); $(".step"+subsec).fadeIn(500)});
		  		}
		  		
		  		scrollToID(checkPoints[step]);
		  		
  			} );
  		}
  		else {
  			a=$(".adv-step:visible");
  				
  				if (subsec && !a.hasClass("step"+subsec)) {
		  			a.fadeOut(500,function(){$(".adva-cont").scrollTop(0); $(".step"+subsec).fadeIn(500)});
		  		}
		  	scrollToID(checkPoints[step]);
  			}
	}

//Scrollwheel while loading
	
$body = $("body");

$(document).on({
    ajaxStart: function() { $body.addClass("loading"); },
     ajaxStop: function() { $body.removeClass("loading"); }    
});

function stepDown() {
	step++;
	loadSection(checkPoints[step]);
	
}

function stepUp() {
	step--;
	loadSection(checkPoints[step]);
}

function goToStep(i,s) {
	
	step = $.inArray([i,s],checkPoints)
	
	if(step<0) {
		console.log("no section found");
		return false;
	}
	
	else {
		loadSection(checkPoints[step]);
		return true;
	}
	
}






