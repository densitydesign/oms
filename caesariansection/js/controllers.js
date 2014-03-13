'use strict';

/* Controllers */

angular.module('who.controllers', [])
  .controller('caesariansection', function($scope, $window) {

    var nextIndex = function(index, direction){
      if(direction === "down"){
        return index;
      }
      else{
        return index-2;
        }
      }

    $scope.sections = [
      {id:"cs_intro",label:"Introduction to caesarian section", nav: true, step:false, template:"chapter-intro"},
      {id:"cs_query_intro",label: "Building the corpus", nav: true, step:false, template:"sub-chapter"},
      {id:"cs_query_network",label: "Building the corpus",nav: false,step:true, template:"viz-step"},
      {id:"cs_query_analytics",label: "Building the corpus",nav: false, step:false, template:"analytics"},
      {id:"cs_crawl_intro", label:"Mapping the web", nav: true, step:false, template:"sub-chapter"},
      {id:"cs_crawl_network", label:"Mapping the web", nav: false, step:true, template:"viz-step"},
      {id:"cs_text_intro",label:"Seeing what they're saying",nav: true, step:false,template:"sub-chapter"},
      {id:"cs_text_slope",label:"Seeing what they're saying", nav: false, step:true, template:"viz-step-slope"}
      // {id:"cs_images_intro",label:"Perceived image of the c-section",nav: true, template:"sub-chapter"}, 
      // {id:"cs_images_elastic",label:"Perceived image of the c-section", template:"chapter-intro"},
      // {id:"cs_aufeminin_intro",label:"Analyzing the forum discussion", nav: true, template:"sub-chapter"},
      // {id:"cs_aufeminin_forum",label:"Analyzing the forum discussion",step:true, template:"viz-step"},
      // {id:"cs_aufeminin_networkFR",label:"Analyzing the forum discussion",step:true, template:"viz-step"},
      // {id:"cs_aufeminin_networkIT",label:"Analyzing the forum discussion",step:true, template:"viz-step"}
    ]

    $scope.labels = d3.nest().key(function(d){return d.label}).entries($scope.sections).map(function(d){return d.key});

    $scope.utils = {
      internalCounter: 0,
      section: $scope.sections[0].id
    }

    angular.element($window).bind('resize',function(){
      $scope.utils.windowWidth = $window.outerWidth;
      $scope.utils.windowHeight = $window.outerHeight;
    });

    $scope.$on('docReady', function (docReadyEvent) {
            $.fn.fullpage({
            resize: false,
            css3: true,
            fixedElements: 'div.navbar , div.scrolldown',
            scrollOverflow: true,
            paddingTop: '55px',
            paddingBottom: '55px',
            verticalCentered: false,
            onLeave: function(index, direction){
              var nextId = $scope.sections.filter(function(d){return d.label == $scope.sections[nextIndex(index, direction)].label && d.nav == true })[0].id;
              if($scope.utils.section != $scope.sections[nextIndex(index, direction)].id){
               $('#main-index').animate({scrollTop: $('#main-index').scrollTop() + $('#nav_' + nextId).position().top}, 700);
              }

            },
            afterLoad: function(anchorLink, index){
                $scope.utils.section = anchorLink;
                if($scope.sections[index-1].step){
                  $.fn.fullpage.setAllowScrolling(false);
                  addMouseWheelHandler()
                  addTouchHandler()
              }
            }
          });
      });

    $scope.$on('steplimit',function(steplimitEvent){
      removeMouseWheelHandler()
      removeTouchHandler()
      $.fn.fullpage.setAllowScrolling(true);
    })

    //TO DO: extend library
    var isMoving = false;
    function MouseWheelHandler(e) {
        // cross-browser wheel delta
        e = window.event || e;
        var delta = Math.max(-1, Math.min(1,
            (e.wheelDelta || -e.deltaY || -e.detail)));

        if(!isMoving){
          if (delta < 0) {
            $scope.utils.internalCounter++;
            $scope.$apply()
            isMoving = true;
            setTimeout(function () {
              isMoving = false;
            }, 1200);
              
          }
          else{
            $scope.utils.internalCounter--;
            $scope.$apply()
            isMoving = true;
            setTimeout(function () {
              isMoving = false;
            }, 1200);
          }
        }

        return false;
    }

    function addMouseWheelHandler(){
      if (document.addEventListener) {
        document.addEventListener("mousewheel", MouseWheelHandler, false); //IE9, Chrome, Safari, Oper
        document.addEventListener("wheel", MouseWheelHandler, false); //Firefox
      } else {
        document.attachEvent("onmousewheel", MouseWheelHandler); //IE 6/7/8
      }
    }

    function removeMouseWheelHandler(){
      if (document.addEventListener) {
        document.removeEventListener('mousewheel', MouseWheelHandler, false); //IE9, Chrome, Safari, Oper
        document.removeEventListener('wheel', MouseWheelHandler, false); //Firefox
      } else {
        document.detachEvent("onmousewheel", MouseWheelHandler); //IE 6/7/8
      }
    }

    var touchStartY = 0;
    var touchStartX = 0;
    var touchEndY = 0;
    var touchEndX = 0;

    var isTablet = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|Windows Phone)/);

        /**
    * Adds the possibility to auto scroll through sections on touch devices.
    */
    function addTouchHandler(){
      if(isTablet){
        $(document).off('touchstart MSPointerDown').on('touchstart MSPointerDown', touchStartHandler);
        $(document).off('touchmove MSPointerMove').on('touchmove MSPointerMove', touchMoveHandler);
      }
    }
    
    /**
    * Removes the auto scrolling for touch devices.
    */
    function removeTouchHandler(){
      if(isTablet){
        $(document).off('touchstart MSPointerDown');
        $(document).off('touchmove MSPointerMove');
      }
    }

    function touchStartHandler(event){
    
      //if(options.autoScrolling){
        var e = event.originalEvent;
        var touchEvents = getEventsPage(e);
        touchStartY = touchEvents['y'];
        touchStartX = touchEvents['x'];
      //}
    }
    /**
    * Gets the pageX and pageY properties depending on the browser.
    * https://github.com/alvarotrigo/fullPage.js/issues/194#issuecomment-34069854
    */
    function getEventsPage(e){
      var events = new Array();
      if (window.navigator.msPointerEnabled){
        events['y'] = e.pageY;
        events['x'] = e.pageX;
      }else{
        events['y'] = e.touches[0].pageY;
        events['x'] =  e.touches[0].pageX;
      }

      return events;
    }

    /* Detecting touch events 
    
    * As we are changing the top property of the page on scrolling, we can not use the traditional way to detect it.
    * This way, the touchstart and the touch moves shows an small difference between them which is the
    * used one to determine the direction.
    */    
    function touchMoveHandler(event){
    
      //if(options.autoScrolling){
        //preventing the easing on iOS devices
        event.preventDefault();
        
        var e = event.originalEvent;
    
        var touchMoved = false;
        //var activeSection = $('.section.active');
        //var scrollable;

        if (!isMoving) { //if theres any #
          var touchEvents = getEventsPage(e);
          touchEndY = touchEvents['y'];
          touchEndX = touchEvents['x'];
                    
          //if movement in the X axys is greater than in the Y and the currect section has slides...
          if (Math.abs(touchStartX - touchEndX) > (Math.abs(touchStartY - touchEndY))) {
              
          }

          //vertical scrolling
          else{            
            //is the movement greater than the minimum resistance to scroll?
            if (Math.abs(touchStartY - touchEndY) > ($(window).height() / 100 * 15)) {
              if (touchStartY > touchEndY) {
                  //move down
                  $scope.utils.internalCounter++;
                    $scope.$apply()
                    isMoving = true;
                    setTimeout(function () {
                      isMoving = false;
                  }, 1200);

              } else if (touchEndY > touchStartY) {
                //move up
                  $scope.utils.internalCounter--;
                  $scope.$apply()
                  isMoving = true;
                  setTimeout(function () {
                      isMoving = false;
                  }, 1200);
              }
            }
          }         
        }
      //}
    }
    

  })