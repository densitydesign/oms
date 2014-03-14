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
  .directive('vizStepSlope',['fileService', '$timeout', function (fileService, $timeout) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'partials/vizstep.html',
      link: function postLink(scope, element, attrs) {

        var counter = 0,
          dataTF,
          slope,
          chart;

        // var network = who.graph()
        //               .sectionid(scope.section.id)
        //               .on("steplimit", function(){
        //                 scope.$emit('steplimit');
        //                 counter  = counter < 0 ? 0 : (counter-1);
        //               });

        var container = element.find("#graph")[0];

          var filterTF = [
            'baby',
            'caesarean',
            'woman',
            'caesarean section',
            'risk',
            'mother',
            'cesarean delivery',
            'birth',
            'delivery',
            'doctor',
            'hospital',
            'sections',
            'labour',
            'incision',
            'labor',
            'surgery',
            'birth vaginal',
            'pregnancy',
            'delivery vaginal',
            'uterus'
          ]

        var init = function(){
          fileService.getFile('data/' + scope.section.id + '/CS_tf.json').then(
            function(data){
              dataTF = data;
              dataTF.forEach(function(d){

                d.values = d.values.filter(function(f){
                  var check = filterTF.indexOf(f['key']);
                  return check >= 0
                })

                d.values.sort(function(a, b) {
                    return b['value'] -a['value'] ;
                });

                  d.values.forEach(function(f){
                    f['value'] = d3.round(f['value'],2)
                })
              })

              slope = who.slopeChart()
                .graphHeight(element.find("#graph").height()-3)
                .graphWidth(element.find("#graph").width())
                .on("clicked", function(d){
                  slope.wordStep([d])
                  chart.call(slope)
                })

              chart = d3.select(container).append("svg")
                      .attr("width", element.find("#graph").width())
                      .attr("height", element.find("#graph").height()-3)

              
              chart.datum(dataTF).call(slope)

            },
            function(error){
              element.find('#graph').html(error)
            }
          );
        };

        if (scope.$parent.$last === true) {
                  scope.$emit('docReady');
                  $timeout(function () {
                       init()
                       console.log(element.find("#graph").height(), element.find("#graph").width())
                  });
        }
        else {
           $timeout(function (){
              init();
          })

         }

        var step = [
          {init: function(){
            slope.showCat(false)
            chart.call(slope)
            }
          },
          {init: function(){
            slope.showCat(["M", "C", "E"])
            chart.call(slope)
            }
          },
          {init: function(){
            slope.showLines(true).wordStep(["risk", "incision"])
            chart.call(slope)
            }
          },
          {init: function(){
            slope.showLines(true).wordStep([])
            chart.call(slope)
            }
          },
          {init: function(){
            slope.showCat(["E", "V"])
            chart.call(slope)
            }
          },
          {init: function(){
            slope.showCat(["M", "C", "E"])
            chart.call(slope)
            }
          }
        ]

        scope.$watch('slopetfidf', function(newValue, oldValue){
            console.log(newValue, oldValue)
        });


        scope.$watch('utils.internalCounter',function(newValue, oldValue){
          if(newValue !== oldValue && scope.utils.section === scope.section.id){
              if(newValue > oldValue){

                counter++
              }else{
                counter--
              }
              if(step[counter]){
                step[counter].init()
              }else{
                scope.$emit('steplimit')
                counter = counter < 0 ? 0 : counter - 1;
              }
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

              var tagHeight = element.find(".catcont").height() - element.find(".cattit").height();
              element.find("#category").height(tagHeight-2)
              var domainHeight = element.find(".domcont").height() - element.find(".domtit").height();
              element.find("#domain").height(domainHeight-2)
              var queryHeight = element.find(".quecont").height() - element.find(".quetit").height();
              element.find("#query").height(queryHeight-2)

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
  .directive('navBar',[ 'fileService', '$timeout', function (fileService, $timeout){
    return {
      restrict: 'A',
      replace: false,
      templateUrl: 'partials/navbar.html',
      link: function(scope, element, attrs) {

        var triggerBttn = element.find("#main-index"),
        overlay;

        function toggleOverlay() {
          
          if (scope.utils.windowWidth < 768){ 
            return;
          }
          if( overlay.hasClass( "open" )) {
            overlay.removeClass("open")
          }
          else if( !overlay.hasClass( "open" ) ) {
            overlay.addClass("open")
          }
        }

        triggerBttn.click(toggleOverlay);

        if (scope.$parent.$last === true) {
                    scope.$emit('docReady');
                    $timeout(function () {
                       // scope.$emit('docReady');
                    });
                }
        else {
          $timeout(function () {
            overlay = $( 'div.overlay' );
          });
        }
      }
    };
  }])
  .directive('navMenu',[ 'fileService', '$timeout', function (fileService, $timeout){
    return {
      restrict: 'A',
      replace: false,
      templateUrl: 'partials/navmenu.html',
      link: function(scope, element, attrs) {

        var closeBttn = element.find( 'div.overlay > button.overlay-close' ),
            overlay = element.find( 'div.overlay' );



        function toggleOverlay() {
          if (scope.utils.windowWidth < 768){ 
            return;
          }

          if( overlay.hasClass( "open" )) {
            overlay.removeClass("open")
          }
          else if( !overlay.hasClass( "open" ) ) {
            overlay.addClass("open")
          }
        }
        
        closeBttn.click(toggleOverlay);

          if (scope.$parent.$last === true) {
                    scope.$emit('docReady');
                    $timeout(function () {
                       // scope.$emit('docReady');
                    });
                }
          else{
              $timeout(function () {
             });
          }
      }
    };
  }])
