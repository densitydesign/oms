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
  .directive('chapterIntro', function ($timeout) {
    return {
      restrict: 'A',
      replace: false,
      templateUrl: '../partials/chapterintro.html',
      link: function(scope, element, attrs) {
      	  if (scope.$parent.$last === true) {
                    $timeout(function () {
                        scope.$emit('docReady');
                    });
                }
      }
    };
  })
  .directive('subChapter', function ($timeout) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: '../partials/subchapter.html',
      link: function(scope, element, attrs) {
          if (scope.$parent.$last === true) {
                    $timeout(function () {
                        scope.$emit('docReady');
                    });
                }
      }
    };
  })
  .directive('vizStep',['fileService', '$timeout', function (fileService, $timeout) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: '../partials/vizstep.html',
      link: function postLink(scope, element, attrs) {

        // fileService.getFile('../data/cs_query.json').then(
        //   function(data){
        //     console.log(data['nodes'][0]);
        //   },
        //   function(error){ }
        //   );

        var network = who.graph()
                      .on("steplimit", function(){
                        scope.$emit('steplimit');
                      });

        var container = element.find("#graph")[0];

        var update = function(){
          d3.select(container)
                .call(network)
        };

        if (scope.$parent.$last === true) {
                  $timeout(function () {
                      scope.$emit('docReady');
                      update()
                  });
        }
        else {
           $timeout(function (){
              update();
          })
        };

        scope.$watch('utils.internalCounter',function(newValue, oldValue){
          if(newValue !== oldValue){
              network.internalView(newValue)
              update()
            }
        })

      }
    };
  }])
  .directive('legendStep', function ($timeout) {
    return {
      restrict: 'A',
      replace: false,
      templateUrl: '../partials/legendstep.html',
      link: function(scope, element, attrs) {

        var limit = element.children().length;

        scope.$watch('utils.internalCounter',function(newValue, oldValue){
          if(newValue !== oldValue && newValue >= 0 && newValue < limit){
               element.animate({scrollTop: element.scrollTop() + element.children(".step" + (newValue+1)).position().top}, 500);
            }
        })

      }
    };
  })
