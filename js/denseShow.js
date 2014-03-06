var step = 0;
var timer = 0;
var scrolling = false;
var direction = 0;
var scrolltime = 10;
var triggerBttn, overlay, closeBttn;
var currProto, currLabel;
//must be mutiplied by 100, value in millisecond for capturing the next scroll event

$(document).ready(function() {


triggerBttn = $('#main-index' );
overlay = $( 'div.overlay' );
closeBttn = $( 'div.overlay > button.overlay-close' );


//triggerBttn.click(toggleOverlay);
closeBttn.click(toggleOverlay);

$(window).resize(function(){
    if( overlay.hasClass( "open" ) && $(window).width() < 768) {
    overlay.removeClass("open")
    $('#main-index').collapse('show')
  }
})


fillMenu()

//Menu

function fillMenu() {
	
	$.each(checkPoints, function( index, value ) {
	  if(value['label'] && currLabel!==value['label']) {
	  	currLabel=value['label']
	  	$(".navbar-nav").append("<li id='nav-"+value['id']+"' class='nav-anchor' ><a href='#' data-step="+value['id']+" >"+value['label']+"</a></li>")
	  	$(".ov-menu").append("<li class='nav-anchor'><a href='#' data-step="+value['id']+" >"+value['label']+"</a></li>")
	  }
	  
	});
	currLabel=null;
	
	$(document).on('click','.nav-anchor a', function(e){
		e.preventDefault();
		if(!overlay.hasClass( "open" )) {
			toggleOverlay();
		}
		else {
		st=$(this).attr("data-step")
		goToStep(st,null);
		toggleOverlay();
		}
	})
}


// End menu 
//========


	if (window.location.hash != "") {
		goToStep(window.location.hash.replace("#sect-", ""), null);
	} else {
		loadSection(checkPoints[0])
	}

	//General interactions

	$('.carousel').carousel({
		"wrap" : false,
		"interval" : false
	})

	$(".arrow-prev").on('click', function() {
		console.log("pressed")
		stepUp();
	});

	$(".arrow-next").on('click', function() {
		console.log("pressed")
		stepDown();
	});

	//=======================
	//scroll interaction

	$('.long').on('mousewheel DOMMouseScroll', chk_scroll);
	$('.adva-cont').on('mousewheel DOMMouseScroll', disableScroll);

	//touch

	var hammerdoc = Hammer(document);

	hammerdoc.on("drag", function(ev) {

		if (timer == 0) {
			timer = 20;
			direction = ev.gesture.direction == "down" ? "up" : "down";
			checkLevel();
			ev.gesture.preventDefault();
		}
		ev.gesture.preventDefault();
		return false;
	});

	$('section').hammer().on("drag", ".adva-cont", function(event) {
		event.gesture.stopPropagation();
		event.stopPropagation();
		event.preventDefault();
		event.gesture.preventDefault();
		$(this).scrollTop($(this).scrollTop() - event.gesture.deltaY / 10);
	});

	$(document).hammer().on("drag", ".long", function(event) {

		if (timer == 0) {
			var elem = $(this);

			if (!(elem[0].scrollHeight - elem.scrollTop() == elem.outerHeight())) {
				event.stopPropagation();
				event.gesture.stopPropagation();
			} else {
			}
		}
	});

	$(document).on('mousewheel DOMMouseScroll', function(e) {

		if (!scrolling) {
			scrolling = true;

			if (e.deltaY != undefined) {
				var delta = e.deltaY

			} else if (e.originalEvent.detail != 0) {
				var delta = -e.originalEvent.detail;

			} else {
				var delta = -e.originalEvent.deltaY
			}

			if (delta < 0)
				direction = "down"
			else if (delta > 0)
				direction = "up";

			checkLevel();
		} else {

			e.preventDefault();
		}

		e.preventDefault();
		return false;

	});

});


function toggleOverlay() {
  if ($(window).width() < 768){ 
    return;
  }

  if( overlay.hasClass( "open" )) {
    overlay.removeClass("open")
  }
  else if( !overlay.hasClass( "open" ) ) {
    overlay.addClass("open")
  }
}

function closeOverlay() {
	console.log("closing overlay")
	if( overlay.hasClass( "open" )) {
    overlay.removeClass("open")
  }
}

function chk_scroll(e) {

	var elem = $(e.currentTarget);

	if (elem.attr("id") != checkPoints[step] && elem.attr("id") != checkPoints[step]['id']) {

		e.preventDefault();
		return false;
	}

	if (!scrolling) {

		if ((elem[0].scrollHeight - elem.scrollTop() > elem.outerHeight())) {
			e.stopPropagation();
		} else {
			e.preventDefault();

		}
	} else {
		e.preventDefault();
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
	console.log("id", id)
	cid = "#" + id;
	var targetOffset = $(cid).offset().top;
	$(cid).scrollTop(0);
	$('html,body').animate({
		scrollTop : targetOffset
	}, speed, function() {

		$(cid).prev("section").empty()
		$(cid).next("section").empty()

		setTimeout(function() {
			scrolling = false;
		}, 500)
	});
}

function loadSection(sec) {

	$("#sgnaf").css("width", step / (checkPoints.length - 1) * 100 + "%");
	var id, subsec;
	
	if (sec['step']) {
		id = sec['id'];
		subsec = sec['step'];
	} else
		id = sec['id'];
	if (!$('#' + id).html()) {
		$.ajax({
			url : "sections/" + id + ".html",
			dataType : "html",
			success : function(data) {

				$('#' + id).html(data);
				a = $(".adv-step:visible");

				if (subsec && !a.hasClass("step" + subsec)) {

					a.fadeOut(500, function() {
						eval("step" + subsec + "()");
						$(".adva-cont").scrollTop(0);
						$(".step" + subsec).fadeIn(500)
					});
				}
				//loadProtocol(checkPoints[step]);
				scrollToID(checkPoints[step]['id'], 1500);

			}
		})
	} else {
		a = $(".adv-step:visible");

		if (subsec && !a.hasClass("step" + subsec)) {
			a.fadeOut(500, function() {
				eval("step" + subsec + "()");
				$(".adva-cont").scrollTop(0);
				$(".step" + subsec).fadeIn(500)
			});
		}
		
		scrollToID(checkPoints[step]['id'], 1500);
	}
	if(checkPoints[step].label && currLabel!=checkPoints[step].label) {
			$('#main-index').scrollTo($("#nav-"+id), 750);
		}
	
	window.location.hash = "sect-" + id;
}

//Scrollwheel while loading

$body = $("body");

$(document).on({
	ajaxStart : function() {
		$body.addClass("loading");
	},
	ajaxStop : function() {
		$body.removeClass("loading");
	}
});

function stepDown() {
	if (step < checkPoints.length - 1) {
		step++;
		loadSection(checkPoints[step]);
	}

}

function stepUp() {
	if (step > 0) {
		step--;
		loadSection(checkPoints[step]);
	}
}

function goToStep(id, s) {
	console.log(id, s)
	found = false;
	//closeOverlay();

	for (var i = 0; i < checkPoints.length; i++) {
		if (s && s>=0) {
			if (checkPoints[i]['step'] && checkPoints[i]['id'] == id && checkPoints[i]['step'] == s) {
				step = i;
				found = true;
				break;
			}
		} else if (checkPoints[i]['id'] == id) {
			step = i;
			found = true;
			break;
		}
	}
	if (!found) {
		console.log("no section found");
		return false;
	} else {
		loadSection(checkPoints[step]);
		return true;
	}

}

function loadProtocol(el) {
	if(!el.protocol) $(".proto").remove();
	else if(el.protocol !== currProto) {
		currProto = el.protocol; 
		$(".proto").remove();
		$.ajax({
			url : "protocols/" + el.protocol + ".html",
			dataType : "html",
			success : function(data) {
				$('.side-all').after(data);
			}
		})
	}
}

