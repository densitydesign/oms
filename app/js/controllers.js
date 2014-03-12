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
      {id:"cs_intro",label:"Introduction to caesarian section", nav: true, template:"chapter-intro"},
      {id:"cs_query_intro",label: "Building the corpus", nav: true, template:"sub-chapter"},
      {id:"cs_query_network",label: "Building the corpus",step:true, template:"viz-step"},
      //{id:"cs_query_analytics",label: "Building the corpus", template:"chapter-intro"},
      {id:"cs_crawl_intro", label:"Mapping the web", nav: true, template:"sub-chapter"},
      {id:"cs_crawl_network", label:"Mapping the web", step:true, template:"viz-step"},
      {id:"cs_text_intro",label:"Seeing what they're saying",nav: true, template:"sub-chapter"}
      // {id:"cs_text_slope",label:"Seeing what they're saying", step:1, template:"viz-step"},
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
              }
            }
          });
      });

    $scope.$on('steplimit',function(steplimitEvent){
      removeMouseWheelHandler()
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

  })
 .controller('home', function($scope) {

   $scope.$on('$viewContentLoaded', function() {
   // $.fn.fullpage({
   //          resize: false,
   //          css3: true,
   //          fixedElements: 'div.navbar',
   //          scrollOverflow: true,
   //          paddingTop: '55px',
   //          verticalCentered: false
   //        })
    })

 })