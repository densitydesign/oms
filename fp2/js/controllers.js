'use strict';

/* Controllers */

angular.module('who.controllers', [])
  .controller('familyplanning', function($scope, $window, cfpLoadingBar) {

    $scope.loadingstart = function() {
      cfpLoadingBar.start();
    };

    $scope.loadingcomplete = function () {
      cfpLoadingBar.complete();
    }

    var nextIndex = function(index, direction){
      if(direction === "down"){
        return index;
      }
      else{
        return index-2;
        }
      }

    $scope.sections = [
      {id:"fp_intro",label:"Introduction to family planning", nav: true, step:false, template:"chapter-intro", protocol: false},
      // {id:"fp_query_intro",label: "The web corpus", nav: true, step:false, template:"sub-chapter", protocol: false},
      // {id:"fp_query_network",label: "The web corpus",nav: false,step:true, template:"viz-step", protocol: 'fp_query', legend:true},
      // {id:"fp_query_analytics",label: "The web corpus",nav: false, step:false, template:"analytics", protocol: 'fp_query'},
      // {id:"fp_crawl_intro", label:"The web cartography", nav: true, step:false, template:"sub-chapter", protocol: false},
      // {id:"fp_crawl_network", label:"The web cartography", nav: false, step:true, template:"viz-step", protocol: 'fp_crawl', legend:true},
      // {id:"fp_text_intro",label:"The Issue analysis",nav: true, step:false,template:"sub-chapter", protocol: false},
      // {id:"fp_text_slope",label:"The Issue analysis", nav: false, step:true, template:"viz-step-slope", protocol: 'fp_text'},  
      {id:"fp_wiki_network_intro",label:"Family Planning and its sisters",nav: true, step:false,template:"sub-chapter", protocol: false},
      {id:"fp_wiki_network_fp",label: "Family Planning and its sisters",nav: false,step:true, template:"viz-step", protocol: 'fp_wikinetwork', legend:true},
      {id:"fp_wiki_edits_intro",label:"The geology of Wikipedia", nav: true, step:false, template:"sub-chapter", protocol: false},
      {id:"fp_wiki_edits_stacked",label:"The geology of Wikipedia", nav: false, step:false, template:"wiki-edits", protocol: 'fp_wikiedits'},
      {id:"fp_wiki_anon_intro",label:"Hidden behind an IP address",nav: true, step:false, template:"sub-chapter", protocol: false},
      {id:"fp_wiki_anon_map",label:"Hidden behind an IP address",nav: false, step:true, template:"anon-map", protocol: 'fp_wikimap',legend:true},
      {id:"fp_wiki_toc_intro",label:"Wikipedia TOC evolution",nav: true, step:false, template:"sub-chapter", protocol: false},
      {id:"fp_wiki_toc_bc",label:"Wikipedia TOC evolution",nav: false, step:true, template:"viz-step-toc", protocol: 'fp_wikitoc', legend:true},
      {id:"fp_wiki_toc_fp",label:"Wikipedia TOC evolution",nav: false, step:true, template:"viz-step-toc", protocol: 'fp_wikitoc', legend:true},
      // {id:"fp2_query_intro",label: "Building the corpus 2", nav: true, step:false, template:"sub-chapter", protocol: false},
      // {id:"fp2_query_network",label: "Building the corpus 2",nav: false,step:true, template:"viz-step", protocol: 'fp_query2', legend:true},
      // {id:"fp2_crawl_intro", label:"Mapping the web 2", nav: true, step:false, template:"sub-chapter", protocol: false},
      // {id:"fp2_crawl_network", label:"Mapping the web 2", nav: false, step:true, template:"viz-step", protocol: 'fp_crawl2', legend:true},
      // {id:"fp2_text_intro",label:"The Issue analysis 2",nav: true, step:false,template:"sub-chapter", protocol: false},
      // {id:"fp2_text_slope",label:"The Issue analysis 2", nav: false, step:true, template:"viz-step-slope-two", protocol: 'fp_text2'},
      //{id:"fp2_geo_intro",label:"The final map",nav: true, step:false,template:"sub-chapter", protocol: 'fp_text'},
      //{id:"fp2_geo_map",label:"The final map",nav: false, step:true,template:"fp2-geo-map", protocol: 'fp_text', legend:false},
      {id:"fp_outro",label:"Conclusion to family planning",nav: true, step:false, template:"sub-chapter", protocol: false}
    ]

    $scope.labels = d3.nest().key(function(d){return d.label}).entries($scope.sections).map(function(d){return d.key});

    $scope.utils = {
      internalCounter: 0,
      section: $scope.sections[0].id,
      protocol: $scope.sections[0].protocol
    }

    $scope.ctrlmodels = {
      "slopetfidf" : 'dataTF',
      "slopescale" : true,
      "slopeexpand" : "all",
      "sgnafmax" : $scope.sections.length-1,
      "sgnafindex": 0,
      "fp_wiki_toc_fp":{
          totalItems: 4,
          currentStep: 1,
          itemsPerPage: 1,
          maxItems: 5,       
          url: "https://en.wikipedia.org/w/index.php?title=Family_planning&oldid="
        },
      "fp_wiki_toc_bc":{
          totalItems: 4,
          currentStep: 1,
          itemsPerPage: 1,
          maxItems: 5,
          url: "https://en.wikipedia.org/w/index.php?title=Birth_control&oldid="
        },
      "fp_crawl_network":{
          totalItems: 5,
          currentStep: 1,
          itemsPerPage: 1,
          maxItems: 5,
          zoom : false,
          size:"deg"
        },
      "fp_query_network":{
          totalItems: 5,
          currentStep: 1,
          itemsPerPage: 1,
          maxItems: 5
        },
        "fp_text_slope":{
          totalItems: 5,
          currentStep: 1,
          itemsPerPage: 1,
          maxItems: 5,
          "slopeCat": {
          "CONTROVERSIES" : ["CONTROVERSIES", "C|advocacy","C|development","C|educationlifestyle/sexual health","C|family size","C|finances","C|human rights","C|law","C|politics","C|population growth", "C|programme","C|religion"],
          "CONTROVERSIES. RISKS&BENEFITS": [ "CONTROVERSIES. RISKS&BENEFITS","CRB|birth spacing","CRB|cancer","CRB|HIV","CRB|others","CRB|VTE"], 
          "CONTROVERSIES. YOUTH": ["CONTROVERSIES. YOUTH", "CY|capacity building","CY|communication","CY|education contraception","CY|law","CY|politics","CY|religion","CY|services","CY|statistics"],
          "MEDICAL": ["MEDICAL", "M|lifestyle/sexual health", "M|methods","M|sales","M|services"]
          },
          "slopeCatSel":{
          "CONTROVERSIES" : "CONTROVERSIES",
          "CONTROVERSIES. RISKS&BENEFITS": "CONTROVERSIES. RISKS&BENEFITS", 
          "CONTROVERSIES. YOUTH": "CONTROVERSIES. YOUTH",
          "MEDICAL": "MEDICAL"
          }
        },
        "fp_wiki_network_fp":{
          totalItems: 5,
          currentStep: 1,
          itemsPerPage: 1,
          maxItems: 5
        },
        "fp2_crawl_network":{
          totalItems: 5,
          currentStep: 1,
          itemsPerPage: 1,
          maxItems: 5,
          zoom : false,
          size:"deg"
        },
        "fp2_query_network":{
          totalItems: 5,
          currentStep: 1,
          itemsPerPage: 1,
          maxItems: 5
        },
        "fp2_text_slope":{
          totalItems: 5,
          currentStep: 1,
          itemsPerPage: 1,
          maxItems: 5,
          slopeCat:["advocacy", "climate change", "cohercion", "community issues", "contraception issues", "corruption", "development issues", "economic issues", "education", "environment issues", "eugenics", "fertility rate", "fp methods", "funding", "health issues", "islamic view", "law", "malthusian dispute", "misconceptions", "negative", "policy", "population  demographic issues", "positive", "poverty", "racism", "religion", "rights", "socio", "sustainability", "unmet need", "women issues", "youth", "balanced", "imperialism"],
          slopeCatSel : {
            one : "advocacy", 
            two: "climate change",
            three: "cohercion", 
            four: "community issues"
          }
        },
        "fp_wiki_anon_map":{
          totalItems: 3,
          currentStep: 1,
          itemsPerPage: 1,
          maxItems: 3
        }
      }

    angular.element($window).bind('resize',function(){
      $scope.utils.windowWidth = $window.outerWidth;
      $scope.utils.windowHeight = $window.outerHeight;
    });

    $scope.$on('docReady', function (docReadyEvent) {
            $.fn.fullpage({
            resize: false,
            css3: true,
            fixedElements: 'div.navbar , div.scrolldown, div.overlay, div.proto, #loading-bar, #loading-bar-spinner, .sgnaf-container',
            scrollOverflow: true,
            paddingTop: '55px',
            paddingBottom: '55px',
            verticalCentered: false,
            normalScrollElements: '#viz_googleimages .imgs, #tocGraph, .slope-cont, div.proto',
            onLeave: function(index, direction){

                $(".tt").remove();

                $scope.ctrlmodels.sgnafindex = nextIndex(index, direction);
                //$scope.$apply()
              //if(nextIndex(index, direction)+1 != $scope.sections.length){
                var nextId = $scope.sections.filter(function(d){return d.label == $scope.sections[nextIndex(index, direction)].label && d.nav == true })[0].id;
                if($scope.utils.section != $scope.sections[nextIndex(index, direction)].id){
                 $('#main-index').animate({scrollTop: $('#main-index').scrollTop() + $('#nav_' + nextId).position().top}, 700);
                }
              //}

            },
            afterLoad: function(anchorLink, index){

                $('.scrollable').slimScroll({ scrollTo: '0px' }) //get back to top scrolled section
                
                $('div.overlay').removeClass("open");
             	
                $scope.utils.section = anchorLink;
                $scope.utils.protocol = $scope.sections[index-1].protocol;
                $scope.ctrlmodels.sgnafindex = index-1;
                $scope.$apply()


                if($scope.sections[index-1].step){
                  //$.fn.fullpage.setAllowScrolling(false);
                  //addMouseWheelHandler()
                  //addTouchHandler()

                  //$(document).on('mouseout', 'div.proto',function () {
                  //$.fn.fullpage.setAllowScrolling(false);
                  //addMouseWheelHandler()
                  //addTouchHandler()
                  //});
                  
                  //$(document).on('mouseover', 'div.proto',function () {
                    //$.fn.fullpage.setAllowScrolling(false);
                   //removeMouseWheelHandler()
                   //removeTouchHandler()
                  //});
              }else{

                // $.fn.fullpage.setAllowScrolling(true);

                // $(document).on('mouseover', 'div.proto',function () {
                //   $.fn.fullpage.setAllowScrolling(false);
                // });

                // $(document).on('mouseout', 'div.proto',function () {
                //   $.fn.fullpage.setAllowScrolling(true);
                // });
              }
            }

          });
        
        $scope.utils.scrollToSection = function(section){
          $.fn.fullpage.moveTo(section);
          //$scope.$emit('steplimit');
          $('#main-index').animate({scrollTop: $('#main-index').scrollTop() + $('#nav_' + section).position().top}, 700);    
        }

        // $(document).on('mouseover', 'div.proto',function () {
        //   $.fn.fullpage.setAllowScrolling(false);
        // });

        // $(document).on('mouseout', 'div.proto',function () {
        //   $.fn.fullpage.setAllowScrolling(true);
        // });


      });

    $scope.$on('steplimit',function(steplimitEvent){
      // removeMouseWheelHandler()
      // removeTouchHandler()
      // $.fn.fullpage.setAllowScrolling(true);
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