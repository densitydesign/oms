'use strict';

/* Directives */


angular.module('who.directives', [])
  .directive("appSections", function ($compile) {
      return {
          replace: false,
          link: function (scope, elements, attrs) {
              var html = '<div ' + scope.section.template + '></div>';
              var e = angular.element(html);
              elements.append(e);
              $compile(e)(scope);
          }
      };
  })
  .directive('chapterIntro',[ 'fileService', '$timeout', function (fileService, $timeout){
    return {
      restrict: 'A',
      replace: false,
      templateUrl: '../partials/chapterintro.html',
      link: function(scope, element, attrs) {

          var txt;

          fileService.getFile('../data/' + scope.section.id + '/txt.html').then(
            function(data){
              txt = data;
              element.html(txt)
            },
            function(error){
              txt = error
              element.html(txt)
            }
          );

      	  if (scope.$parent.$last === true) {
                    scope.$emit('docReady');
                    $timeout(function () {
                       // scope.$emit('docReady');
                    });
                }
      }
    };
  }])
  .directive('subChapter',[ 'fileService', '$timeout', function (fileService, $timeout) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: '../partials/subchapter.html',
      link: function(scope, element, attrs) {

          var txt;

          fileService.getFile('../data/' + scope.section.id + '/txt.html').then(
            function(data){
              txt = data;
              element.find('.section-text').html(txt)
            },
            function(error){
              txt = error
              element.find('.section-text').html(txt)
            }
          );

          if (scope.$parent.$last === true) {
                    scope.$emit('docReady');
                    $timeout(function () {
                        //scope.$emit('docReady');
                    });
                }
      }
    };
  }])
  .directive('vizStep',['fileService', '$timeout', function (fileService, $timeout) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: '../partials/vizstep.html',
      link: function postLink(scope, element, attrs) {

        var counter = 0;

        var network = who.graph()
                      .sectionid(scope.section.id)
                      .on("steplimit", function(){
                        scope.$emit('steplimit');
                        counter  = counter < 0 ? 0 : (counter-1);
                      });

        var container = element.find("#graph")[0];

        var update = function(){
          d3.select(container)
                .call(network)
        };
        if (scope.$parent.$last === true) {
                  scope.$emit('docReady');
                  $timeout(function () {
                       update()
                  });
        }
        else {
           $timeout(function (){
              update();
          })

         }

        scope.$watch('utils.internalCounter',function(newValue, oldValue){
          if(newValue !== oldValue && scope.utils.section === scope.section.id){
              if(newValue > oldValue){
                counter++
              }else{
                counter--
              }
              network.internalView(counter)
              update()
            }
        })

      }
    };
  }])
  .directive('legendStep', ['fileService', '$timeout', function (fileService, $timeout) {
    return {
      restrict: 'A',
      replace: false,
      //templateUrl: '../partials/legendstep.html',
      link: function postLink(scope, element, attrs) {

        var limit,
              txt,
              counter = 0;

        fileService.getFile('../data/' + scope.section.id + '/legend.html').then(
          function(data){
            txt = data;
            element.html(txt)
            limit = element.children().length;
          },
          function(error){
            txt = error
            element.html(txt)
            limit = element.children().length;
          }
        );

        scope.$watch('utils.internalCounter',function(newValue, oldValue){
          if(newValue !== oldValue){

            if(newValue > oldValue){

              if(counter < 0){counter = 0}
                counter++
              }else{
                if(counter >= limit){counter = counter -1}
                counter--
              }

              if(element.children(".step" + (counter)).length){
                element.animate({scrollTop: element.scrollTop() + element.children(".step" + (counter)).position().top}, 500);
              }
            }

        })

      }
    };
  }])
