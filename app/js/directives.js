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
  .directive('vizStep', function ($timeout) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: '../partials/vizstep.html',
      link: function postLink(scope, element, attrs) {

        var network = who.graph()
                      .on("steplimit", function(){
                        scope.$emit('steplimit');
                      })

        var container = element.find("#graph")[0]

        if (scope.$parent.$last === true) {
                  $timeout(function () {
                      scope.$emit('docReady');
                  });
              }
        else {
           $timeout(function (){
              d3.select(container)
                .call(network)
          })
        };

        scope.$watch('utils.internalCounter',function(newValue, oldValue){
          if(newValue !== oldValue){
              network.internalView(newValue)
              d3.select(container)
                .call(network)
            }
        })

      }
    };
  })
