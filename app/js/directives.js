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
      // scope: {
      //   's-data': '='
      // },
      link: function(scope, element, attrs) {
      	  if (scope.$parent.$last === true) {
                    $timeout(function () {
                        scope.$emit('docReady');
                    });
                }

        function update(){
          // if(scope.request.cells.length){
          //   apiService.getInOut(scope.request)
          //     .done(function(data){

          //       var callsList = data['contactsChart']
          //       callsList.forEach(function(f){
          //         f.count = Math.round(f.count)
          //         if(f.location == 'international'){
          //         f.countryCode = scope.toCountryName(f.countryCode)
          //         }
          //       })

          //       scope.inout = callsList;
          //       scope.$apply();
          //     })
          //     .fail(function(error){
          //       scope.error = error;
          //     })
          // }
          // else{
          //   scope.inout = []
          // }
        }

        // scope.$watch('request', function(){
        //       update()
        // },true)

      }
    };
  })
