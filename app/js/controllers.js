'use strict';

/* Controllers */

angular.module('who.controllers', [])
  .controller('caesariansection', function($scope) {

    var nextIndex = function(index, direction){
      if(direction === "down"){
        return index;
      }
      else{
        return index-2;
        }
      }

    $scope.sections = [
      {id:"cs_intro",label:"Introduction to caesarian section", template:"chapter-intro"},
      {id:"cs_query_intro",label: "Building the corpus", template:"sub-chapter"},
      {id:"cs_query_network",step:1, template:"viz-step"},
      {id:"cs_query_analytics", template:"chapter-intro"}
      // {id:"cs_crawl_intro", label:"Mapping the web", template:"sub-chapter"},
      // {id:"cs_crawl_network",step:1, template:"viz-step"},
      // {id:"cs_text_intro",label:"Seeing what they're saying", template:"sub-chapter"},
      // {id:"cs_text_slope",step:1, template:"viz-step"},
      // {id:"cs_images_intro",label:"Perceived image of the c-section",template:"sub-chapter"}, 
      // {id:"cs_images_elastic", template:"chapter-intro"},
      // {id:"cs_aufeminin_intro",label:"Analyzing the forum discussion", template:"sub-chapter"},
      // {id:"cs_aufeminin_forum",step:1, template:"viz-step"},
      // {id:"cs_aufeminin_networkFR",step:1, template:"viz-step"},
      // {id:"cs_aufeminin_networkIT",step:1, template:"viz-step"}
    ]

    $scope.utils = {
      slideIndex: 0,
      internalCounter: 0
    }

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
              $scope.utils.slideIndex = nextIndex(index, direction);
              $scope.$apply()
              // if($scope.sections[nextIndex(index, direction)].step){
              //   $.fn.fullpage.setAllowScrolling(false);
              //   addMouseWheelHandler()
              // }
            },
            afterLoad: function(anchorLink, index){
                if($scope.sections[index-1].step){
                $.fn.fullpage.setAllowScrolling(false);
                addMouseWheelHandler()
              }
            }
          });
      });

    $scope.$on('steplimit',function(steplimitEvent){
      //$scope.utils.internalCounter = 0;
      removeMouseWheelHandler()
      $.fn.fullpage.setAllowScrolling(true);
    })

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

  });