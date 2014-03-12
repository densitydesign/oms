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
      templateUrl: 'partials/chapterintro.html',
      link: function(scope, element, attrs) {

          var txt;

          fileService.getFile('data/' + scope.section.id + '/txt.html').then(
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
      templateUrl: 'partials/subchapter.html',
      link: function(scope, element, attrs) {

          var txt;

          fileService.getFile('data/' + scope.section.id + '/txt.html').then(
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
      templateUrl: 'partials/vizstep.html',
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

        fileService.getFile('data/' + scope.section.id + '/legend.html').then(
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
          if(newValue !== oldValue && scope.utils.section === scope.section.id){

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
  .directive('analytics',['fileService', '$timeout', function (fileService, $timeout) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'partials/analytics.html',
      link: function postLink(scope, element, attrs) {

          var csv,
              tagContainer = element.find("#category")[0],
              domainContainer = element.find("#domain")[0],
              queryContainer = element.find("#query")[0],
              tagChart,
              domainChart,
              queryChart;

          function init(){
            fileService.getFile('data/' + scope.section.id + '/cs_analytics.csv').then(
              function(data){
                csv = d3.csv.parse(data);
                // Create the crossfilter for the relevant dimensions and groups.
                var category = crossfilter(csv),
                all = category.groupAll(),
                host = category.dimension(function(d) { return d.HOST; }),
                hosts = host.group(),
                query = category.dimension(function(d) { return d.QUERY; }),
                queries = query.group(),
                tag = category.dimension(function(d) { return d.TAG; }),
                tags = tag.group(),
                tld = category.dimension(function(d) { return d.TLD; }),
                tlds = tld.group(),
                url = category.dimension(function(d) { return d.URL; }),
                urls = tld.group();

                tagChart = who.barChart()
                        //.xMax(tags.top(1)[0].value)
                        .xMax(tlds.top(1)[0].value)
                        .dimension(tag)
                        .group(tags)
                        .responsive(true)

                domainChart = who.barChart()
                    .xMax(tlds.top(1)[0].value)
                    .dimension(tld)
                    .group(tlds)
                    .responsive(true)

                queryChart = who.bubbleChart()
                   .xMax(queries.top(1)[0].value)
                   .dimension(query)
                   .group(queries)
                   .responsive(true)

                tagContainer = d3.select(tagContainer)
                                .on("click", function(){
                                  domainContainer.call(domainChart)
                                  queryContainer.call(queryChart)
                                })
                                .call(tagChart)

                domainContainer = d3.select(domainContainer)
                                  .on("click", function(){
                                    tagContainer.call(tagChart)
                                    queryContainer.call(queryChart)
                                  })
                                .call(domainChart)

                queryContainer = d3.select(queryContainer)
                                .on("click", function(){
                                  tagContainer.call(tagChart)
                                  domainContainer.call(domainChart)
                                })
                                .call(queryChart)                           
              },
              function(error){
                txt = error
                  queryContainer.html(txt)
              }
            );
          }

        // var counter = 0;

        // var network = who.graph()
        //               .sectionid(scope.section.id)
        //               .on("steplimit", function(){
        //                 scope.$emit('steplimit');
        //                 counter  = counter < 0 ? 0 : (counter-1);
        //               });


        var update = function(){
          // d3.select(container)
          //       .call(network)
        };
        if (scope.$parent.$last === true) {
                  scope.$emit('docReady');
                  $timeout(function () {
                       init()
                  });
        }
        else {
           $timeout(function (){
              init();
          })

         }

      }
    };
  }])
