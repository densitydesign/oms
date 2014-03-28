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
  .directive('subChapter',[ 'fileService', '$timeout', '$compile', function (fileService, $timeout, $compile) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'partials/subchapter.html',
      link: function(scope, element, attrs) {

          var txt;

          fileService.getFile('data/' + scope.section.id + '/txt.html').then(
            function(data){
              //txt = data;
              //element.find('.section-text').html(txt)
              var e = angular.element(data);
              element.find('.section-text').append(e);
              $compile(e)(scope);
            },
            function(error){
              element.find('.section-text').html(error)
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
  .directive('protocol',[ 'fileService', '$timeout', function (fileService, $timeout) {
    return {
      restrict: 'A',
      replace: false,
      templateUrl: 'partials/protocol.html',
      link: function(scope, element, attrs) {

        var protoContainer = element.find("#proto-title-container"),
            proto = element.find("#protocol"),
            closeBtn = element.find(".close-btn"),
            protoContent = element.find('.proto-content');

          
        protoContainer.click(function() {
        if(proto.css("right") != '0px'){ 
          proto.css("right",0);
          closeBtn.css('-webkit-transform','rotate(90deg)');
          closeBtn.css('-moz-transform','rotate(90deg)');
          protoContainer.css("right","360px")
        }
         else if(proto.css("right")=="0px") {
          proto.css("right","-360px");
          closeBtn.css('-webkit-transform','rotate(45deg)');
          closeBtn.css('-moz-transform','rotate(45deg)');
          protoContainer.css("right","0")
        }
      })
      
      protoContent.slimScroll({
            height: 'auto',
            size: '5px',
            alwaysVisible: false
          });

      var update = function(protocol){
          protoContent.empty()
          fileService.getFile('data/protocol/' + protocol + '.html').then(
            function(data){
              protoContent.html(data)
            },
            function(error){
              protoContent.html(error)
            }
          );
      }

      scope.$watch('utils.protocol',function(newValue, oldValue){
        if(newValue !== oldValue){
          if(newValue){
            if(protoContainer.css("right") == "-40px")
              {protoContainer.css("right","0px")}
              update(newValue)
          }
          else{
            protoContainer.css("right","-40px")
            closeBtn.css('-webkit-transform','rotate(45deg)');
            closeBtn.css('-moz-transform','rotate(45deg)');
            proto.css("right","-360px");
          }
        }
      });
      }
    };
  }])
  .directive('vizStep',['fileService', '$timeout', '$compile', function (fileService, $timeout, $compile) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'partials/vizstep.html',
      link: function postLink(scope, element, attrs) {

        var counter = 0,
            loaded = false,
            chart,
            network,
            container = element.find("#graph")[0],
            containerPagination = element.find("#paginationStep")[0];

        var init = function(){
          fileService.getFile('data/' + scope.section.id + '/' + scope.section.id + '_graph.json').then(
              function(data){
                network = who.graph()
                  .sectionid(scope.section.id)
                  .on("steplimit", function(){
                    //scope.$emit('steplimit');
                    //counter  = counter < 0 ? 0 : (counter-1);
                  });

                chart = d3.select(container);

                chart.datum(data).call(network)

                scope.ctrlmodels[scope.section.id].totalItems = network.step()

                loaded = true;
              },
              function(error){
                container.html(error)
              }
            );
        }    



        if (scope.$parent.$last === true) {
                  scope.$emit('docReady');
                    $timeout(function () {
                         //init()
                    });
        }
        else {
           $timeout(function (){
              //init();
            })
         }

        
        var pag = "<pagination max-size='ctrlmodels." + scope.section.id + ".maxItems' previous-text='&lsaquo;' next-text='&rsaquo;' class='pagination-sm' total-items='ctrlmodels." + scope.section.id + ".totalItems' page='ctrlmodels." + scope.section.id + ".currentStep' items-per-page='ctrlmodels." + scope.section.id + ".itemsPerPage'></pagination>"
        var e = angular.element(pag)
        $(containerPagination).append(e)
        $compile(e)(scope)


        //lazy loading
        scope.$watch('utils.section', function(newValue, oldValue){
         if(newValue == scope.section.id && loaded === false){
           $timeout(function (){
            //scope.loadingstart()
            init()
            });
          }
        })

        scope.$watch('ctrlmodels.'+ scope.section.id + '.currentStep', function(newValue, oldValue){
          if(newValue !== oldValue && scope.utils.section === scope.section.id && loaded){
                //step[newValue-1].init()
                network.internalView(newValue-1)
                chart.call(network)
            }
        })

        scope.$watch('ctrlmodels.'+ scope.section.id + '.zoom', function(newValue, oldValue){
          if(newValue !== oldValue && scope.utils.section === scope.section.id && loaded){
                network.zoomCluster('clusters',newValue)
                //chart.call(network)
            }
        })

        scope.$watch('ctrlmodels.'+ scope.section.id + '.size', function(newValue, oldValue){
          if(newValue !== oldValue && scope.utils.section === scope.section.id && loaded){
                network.toggleSize(newValue)
                //chart.call(network)
            }
        })

        // scope.$watch('utils.internalCounter',function(newValue, oldValue){
        //   if(newValue !== oldValue && scope.utils.section === scope.section.id && loaded){
        //       if(newValue > oldValue){
        //         counter++
        //       }else{
        //         counter--
        //       }
        //       network.internalView(counter)
        //       chart.call(network)
        //     }
        // })

      }
    };
  }])
  .directive('vizStepToc',['fileService', '$timeout','$compile', function (fileService, $timeout, $compile) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'partials/tocstep.html',
      link: function postLink(scope, element, attrs) {

        var counter = 0,
          chart,
          chartLegend,
          wikitoc,
          wikitoclegend,
          loaded = false;

        var containerViz = element.find("#tocGraph")[0],
            containerLegend = element.find("#tocLegend")[0],
            containerPagination = element.find("#paginationStep")[0]

        var init = function(){

          fileService.getFile('data/' + scope.section.id + '/toc_final.json').then(
            function(data){
              
              //scope.loadingcomplete()
              chart = d3.select(containerViz)

              wikitoc = who.wikitoc()
                            .height($(containerViz).height()-3)
                            .morePixel($(containerViz).width())

              chart.datum(data).call(wikitoc)

              chartLegend = d3.select(containerLegend)

              wikitoclegend = who.wikitoclegend()
                .height($(containerViz).height()-3)
                .width($(containerLegend).width())

              var dataLegend = d3.select("[transform='translate(0,0)']").data()[0].value.clusters

              chartLegend.datum(dataLegend).call(wikitoclegend)
              
              loaded = true;

            },
            function(error){
              element.find('#graph').html(error)
            }
          );
        };

        if (scope.$parent.$last === true) {
                  scope.$emit('docReady');
                  $timeout(function () {
                       //init()
                  });
        }
        else {
           $timeout(function (){
              //init();
          })

         }

        var step = { 
          "fp_wiki_toc_fp" : [
          {init: function(){
            click = true
            var p = wikitoc.getPixel("2006-04-22T04:02:54Z")
            $(containerViz).animate( { scrollLeft: p }, 500, "swing")
            var dl = d3.select("[transform='translate(" + p + ",0)']").data()[0].value.clusters;
            chartLegend.datum(dl).call(wikitoclegend)
            click =false
            }
          },
          {init: function(){
            click = true
            var p = wikitoc.getPixel("2006-08-15T09:38:40Z")
            $(containerViz).animate( { scrollLeft: p }, 500, "swing")
            var dl = d3.select("[transform='translate(" + p + ",0)']").data()[0].value.clusters;
            chartLegend.datum(dl).call(wikitoclegend)
            click =false
            }
          },
          {init: function(){
            click = true
            var p = wikitoc.getPixel("2008-03-08T08:41:54Z")
            $(containerViz).animate( { scrollLeft: p }, 500, "swing")
            var dl = d3.select("[transform='translate(" + p + ",0)']").data()[0].value.clusters;
            chartLegend.datum(dl).call(wikitoclegend)
            click =false
            }
          },
          {init: function(){
            click = true
            var p = wikitoc.getPixel("2008-05-01T10:01:42Z")
            $(containerViz).animate( { scrollLeft: p }, 500)
            var dl = d3.select("[transform='translate(" + p + ",0)']").data()[0].value.clusters;
            chartLegend.datum(dl).call(wikitoclegend)
            click =false
            }
          },
          {init: function(){
            click = true
            var p = wikitoc.getPixel("2012-12-13T16:36:51Z")
            $(containerViz).animate( { scrollLeft: p }, 500)
            var dl = d3.select("[transform='translate(" + p + ",0)']").data()[0].value.clusters;
            chartLegend.datum(dl).call(wikitoclegend)
            click =false
            }
          },
          {init: function(){
            click = true
            var p = wikitoc.getPixel("2006-04-22T04:02:54Z")
            $(containerViz).animate( { scrollLeft: p }, 500, "swing")
            var dl = d3.select("[transform='translate(" + p + ",0)']").data()[0].value.clusters;
            chartLegend.datum(dl).call(wikitoclegend)
            click =false
            }
          }
        ],
        "fp_wiki_toc_bc" : [
          {init: function(){
            click = true
            var p = wikitoc.getPixel("2001-11-09T05:40:54Z")
            $(containerViz).animate( { scrollLeft: p }, 500, "swing")
            var dl = d3.select("[transform='translate(" + p + ",0)']").data()[0].value.clusters;
            chartLegend.datum(dl).call(wikitoclegend)
            click =false
            }
          },
          {init: function(){
            click = true
            var p = wikitoc.getPixel("2004-03-03T00:40:47Z")
            $(containerViz).animate( { scrollLeft: p }, 500, "swing")
            var dl = d3.select("[transform='translate(" + p + ",0)']").data()[0].value.clusters;
            chartLegend.datum(dl).call(wikitoclegend)
            click =false
            }
          },
          {init: function(){
            click = true
            var p = wikitoc.getPixel("2006-07-25T00:50:10Z")
            $(containerViz).animate( { scrollLeft: p }, 500, "swing")
            var dl = d3.select("[transform='translate(" + p + ",0)']").data()[0].value.clusters;
            chartLegend.datum(dl).call(wikitoclegend)
            click =false
            }
          },
          {init: function(){
            click = true
            var p = wikitoc.getPixel("2011-05-21T09:14:42Z")
            $(containerViz).animate( { scrollLeft: p }, 500, "swing")
            var dl = d3.select("[transform='translate(" + p + ",0)']").data()[0].value.clusters;
            chartLegend.datum(dl).call(wikitoclegend)
            click =false
            }
          },
          {init: function(){
            click = true
            var p = wikitoc.getPixel("2002-02-25T15:51:15Z")
            $(containerViz).animate( { scrollLeft: p }, 500, "swing")
            var dl = d3.select("[transform='translate(" + p + ",0)']").data()[0].value.clusters;
            chartLegend.datum(dl).call(wikitoclegend)
            click =false
            }
          },
          {init: function(){
            click = true
            var p = wikitoc.getPixel("2004-03-03T00:40:47Z")
            $(containerViz).animate( { scrollLeft: p }, 500, "swing")
            var dl = d3.select("[transform='translate(" + p + ",0)']").data()[0].value.clusters;
            chartLegend.datum(dl).call(wikitoclegend)
            click =false
            }
          },
          {init: function(){
            click = true
            var p = wikitoc.getPixel("2006-07-26T21:07:17Z")
            $(containerViz).animate( { scrollLeft: p }, 500, "swing")
            var dl = d3.select("[transform='translate(" + p + ",0)']").data()[0].value.clusters;
            chartLegend.datum(dl).call(wikitoclegend)
            click =false
            }
          },
          {init: function(){
            click = true
            var p = wikitoc.getPixel("2006-10-06T06:45:19Z")
            $(containerViz).animate( { scrollLeft: p }, 500, "swing")
            var dl = d3.select("[transform='translate(" + p + ",0)']").data()[0].value.clusters;
            chartLegend.datum(dl).call(wikitoclegend)
            click =false
            }
          },
          {init: function(){
            click = true
            var p = wikitoc.getPixel("2011-05-21T09:14:42Z")
            $(containerViz).animate( { scrollLeft: p }, 500, "swing")
            var dl = d3.select("[transform='translate(" + p + ",0)']").data()[0].value.clusters;
            chartLegend.datum(dl).call(wikitoclegend)
            click =false
            }
          },
          {init: function(){
            click = true
            var p = wikitoc.getPixel("2012-08-09T23:00:26Z")
            $(containerViz).animate( { scrollLeft: p }, 500, "swing")
            var dl = d3.select("[transform='translate(" + p + ",0)']").data()[0].value.clusters;
            chartLegend.datum(dl).call(wikitoclegend)
            click =false
            }
          },
          {init: function(){
            click = true
            var p = wikitoc.getPixel("2001-11-09T05:40:54Z")
            $(containerViz).animate( { scrollLeft: p }, 500, "swing")
            var dl = d3.select("[transform='translate(" + p + ",0)']").data()[0].value.clusters;
            chartLegend.datum(dl).call(wikitoclegend)
            click =false
            }
          }
        ]
      }



        var loading = false,
            click = false;
        $(containerViz).scroll(function(){
          if(!loading && !click){
            var threshold = 10
            for(var i = threshold; i >= 0; i--){
              var p = $( containerViz ).scrollLeft() + i
              var dl = d3.select("[transform='translate(" + p + ",0)']").data()[0]
              if(typeof dl == "object" && !loading){
                 if(!dl.value) break;
                 dl = dl.value.clusters;
                loading = true
                chartLegend.datum(dl).call(wikitoclegend)
                loading = false
                break;
              }
            }
          }
        })

        scope.ctrlmodels[scope.section.id].totalItems = step[scope.section.id].length
        var pag = "<pagination max-size='ctrlmodels." + scope.section.id + ".maxItems' previous-text='&lsaquo;' next-text='&rsaquo;' class='pagination-sm' total-items='ctrlmodels." + scope.section.id + ".totalItems' page='ctrlmodels." + scope.section.id + ".currentStep' items-per-page='ctrlmodels." + scope.section.id + ".itemsPerPage'></pagination>"
        var e = angular.element(pag)
        $(containerPagination).append(e)
        $compile(e)(scope)

        //lazy loading
        scope.$watch('utils.section', function(newValue, oldValue){
         if(newValue == scope.section.id && loaded === false){
           $timeout(function (){
            //scope.loadingstart()
            init()
            });
          }
        })

        scope.$watch('ctrlmodels.'+ scope.section.id + '.currentStep', function(newValue, oldValue){
          if(newValue !== oldValue && scope.utils.section === scope.section.id && loaded){
                step[scope.section.id][newValue-1].init()
            }
        })
      }
    };
  }])
  .directive('vizStepSlope',['fileService', '$timeout', '$compile', function (fileService, $timeout, $compile) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'partials/vizstep.html',
      link: function postLink(scope, element, attrs) {

        var counter = 0,
          dataslope = {},
          slope,
          chart,
          loaded = false;

        var container = element.find("#graph")[0],
            containerPagination = element.find("#paginationStep")[0]

        var init = function(){

          fileService.getFile('data/' + scope.section.id + '/slope_tfidf.json').then(
            function(data){
              dataslope.dataTFIDF = data;
              dataslope.dataTFIDF.forEach(function(d){

                // d.values = d.values.filter(function(f){
                //   var check = filterIDF.indexOf(f['key']);
                //   return check >= 0
                // })

                d.values.sort(function(a, b) {
                    return b['value'] -a['value'] ;
                });

                  d.values.forEach(function(f){
                    f['value'] = d3.round(f['value'],2)
                })
              })

              console.log(dataslope.dataTFIDF)
            },
            function(error){
              element.find('#graph').html(error)
            }
          );

          fileService.getFile('data/' + scope.section.id + '/slope_tf.json').then(
            function(data){
              
              //scope.loadingcomplete()

              dataslope.dataTF = data;
              dataslope.dataTF.forEach(function(d){

                // d.values = d.values.filter(function(f){
                //   var check = filterTF.indexOf(f['key']);
                //   return check >= 0
                // })

                d.values.sort(function(a, b) {
                    return b['value'] -a['value'] ;
                });

                  d.values.forEach(function(f){
                    f['value'] = d3.round(f['value'],2)
                })
              })
              var len = data[0].values.length;
              slope = who.slopeChart()
                .graphHeight(len*15)
                .graphWidth(element.find("#graph").width())
                .on("clicked", function(d){
                  var words = slope.wordStep();
                  if(words.indexOf(d) < 0){
                    slope.wordStep([d])
                    chart.call(slope)
                  }else {
                    slope.wordStep([])
                    chart.call(slope)                    
                  }
                })

              chart = d3.select(container).style("overflow-y", "scroll").style("overflow-x", "hidden").append('div').attr("class", "slope-cont")
                      .append("svg")
                      .attr("width", element.find("#graph").width())
                      .attr("height", len*15)

              chart.datum(dataslope.dataTF).call(slope)

              loaded = true;

            },
            function(error){
              element.find('#graph').html(error)
            }
          );
        };

        if (scope.$parent.$last === true) {
                  scope.$emit('docReady');
                  $timeout(function () {
                       //init()
                  });
        }
        else {
           $timeout(function (){
              //init();
          })

         }

        var step = [
          {init: function(){
            slope.showCat(false).showLines(false)
            chart.call(slope)
            }
          },
          {init: function(){
            slope.showLines(true).showCat(["CONTROVERSIES", "CONTROVERSIES. RISKS&BENEFITS", "CONTROVERSIES. YOUTH", "MEDICAL", "NATURAL FAMILY PLANNING"])
            chart.call(slope)
            }
          }
        ]

        // var slopeCat = {
        //   "CONTROVERSIES" : ["C|advocacy","C|development","C|educationlifestyle/sexual health","C|family size","C|finances","C|human rights","C|law","C|politics","C|population growth", "C|programme","C|religion"],
        //   "CONTROVERSIES. RISKS&BENEFITS": ["CRB|birth spacing","CRB|cancer","CRB|HIV","CRB|others","CRB|VTE"], 
        //   "CONTROVERSIES. YOUTH": ["CY|capacity building","CY|communication","CY|education contraception","CY|law","CY|politics","CY|religion","CY|services","CY|statistics"],
        //   "MEDICAL": ["M|lifestyle/sexual health", "M|methods","M|sales","M|services"]
        // }

        scope.ctrlmodels[scope.section.id].totalItems = step.length
        var pag = "<pagination previous-text='&lsaquo;' next-text='&rsaquo;' class='pagination-sm' total-items='ctrlmodels." + scope.section.id + ".totalItems' page='ctrlmodels." + scope.section.id + ".currentStep' items-per-page='ctrlmodels." + scope.section.id + ".itemsPerPage'></pagination>"
        var e = angular.element(pag)
        $(containerPagination).append(e)
        $compile(e)(scope)

        //lazy loading
        scope.$watch('utils.section', function(newValue, oldValue){
         if(newValue == scope.section.id && loaded === false){
           $timeout(function (){
            //scope.loadingstart()
            init()
            });
          }
        })

        scope.$watch('ctrlmodels.slopetfidf', function(newValue, oldValue){
            if (newValue !== oldValue){
              chart.datum(dataslope[newValue]).call(slope.wordStep([]))
            }
        });

        scope.$watch('ctrlmodels.slopescale', function(newValue, oldValue){
            if (newValue !== oldValue){
              slope.normalized(newValue)
              chart.call(slope)
            }
        });

        scope.$watch('ctrlmodels.fp_text_slope.slopeCatSel["CONTROVERSIES"]', function(newValue, oldValue){
            if (newValue !== oldValue){
                var slopeCat = slope.showCat()
                slopeCat[0] = newValue;
                slope.showCat(slopeCat)
                chart.call(slope)               
            }
        });

        scope.$watch('ctrlmodels.fp_text_slope.slopeCatSel["CONTROVERSIES. RISKS&BENEFITS"]', function(newValue, oldValue){
            if (newValue !== oldValue){
                var slopeCat = slope.showCat()
                slopeCat[1] = newValue;
                slope.showCat(slopeCat)
                chart.call(slope)               
            }
        });

        scope.$watch('ctrlmodels.fp_text_slope.slopeCatSel["CONTROVERSIES. YOUTH"]', function(newValue, oldValue){
            if (newValue !== oldValue){
                var slopeCat = slope.showCat()
                slopeCat[2] = newValue;
                slope.showCat(slopeCat)
                chart.call(slope)               
            }
        });

        scope.$watch('ctrlmodels.fp_text_slope.slopeCatSel["MEDICAL"]', function(newValue, oldValue){
            if (newValue !== oldValue){
                var slopeCat = slope.showCat()
                slopeCat[3] = newValue;
                slope.showCat(slopeCat)
                chart.call(slope)               
            }
        });


        scope.$watch('ctrlmodels.'+ scope.section.id + '.currentStep', function(newValue, oldValue){
          if(newValue !== oldValue && scope.utils.section === scope.section.id && loaded){
                step[newValue-1].init()
            }
        })


      }
    };
  }])
  .directive('vizStepSlopeTwo',['fileService', '$timeout', '$compile', function (fileService, $timeout, $compile) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'partials/vizstep.html',
      link: function postLink(scope, element, attrs) {

        var counter = 0,
          dataslope = {},
          slope,
          chart,
          loaded = false;

        var container = element.find("#graph")[0],
            containerPagination = element.find("#paginationStep")[0]

        var init = function(){

          fileService.getFile('data/' + scope.section.id + '/slope_tfidf.json').then(
            function(data){
              dataslope.dataTFIDF = data;
              dataslope.dataTFIDF.forEach(function(d){

                // d.values = d.values.filter(function(f){
                //   var check = filterIDF.indexOf(f['key']);
                //   return check >= 0
                // })

                d.values.sort(function(a, b) {
                    return b['value'] -a['value'] ;
                });

                  d.values.forEach(function(f){
                    f['value'] = d3.round(f['value'],2)
                })
              })

              console.log(dataslope.dataTFIDF)
            },
            function(error){
              element.find('#graph').html(error)
            }
          );

          fileService.getFile('data/' + scope.section.id + '/slope_tf.json').then(
            function(data){
              
              //scope.loadingcomplete()

              dataslope.dataTF = data;
              dataslope.dataTF.forEach(function(d){

                // d.values = d.values.filter(function(f){
                //   var check = filterTF.indexOf(f['key']);
                //   return check >= 0
                // })

                d.values.sort(function(a, b) {
                    return b['value'] -a['value'] ;
                });

                  d.values.forEach(function(f){
                    f['value'] = d3.round(f['value'],2)
                })
              })

              var len = data[0].values.length;
              slope = who.slopeChart()
                .graphHeight(len*15)
                .graphWidth(element.find("#graph").width())
                .on("clicked", function(d){
                  var words = slope.wordStep();
                  if(words.indexOf(d) < 0){
                    slope.wordStep([d])
                    chart.call(slope)
                  }else {
                    slope.wordStep([])
                    chart.call(slope)                    
                  }
                })

              chart = d3.select(container).style("overflow-y", "scroll").style("overflow-x", "hidden").append('div').attr("class", "slope-cont")
                      .append("svg")
                      .attr("width", element.find("#graph").width())
                      .attr("height", len*15)

              chart.datum(dataslope.dataTF).call(slope)

              loaded = true;

            },
            function(error){
              element.find('#graph').html(error)
            }
          );
        };

        if (scope.$parent.$last === true) {
                  scope.$emit('docReady');
                  $timeout(function () {
                       //init()
                  });
        }
        else {
           $timeout(function (){
              //init();
          })

         }

        var step = [
          {init: function(){
            slope.showCat(false).showLines(false)
            chart.call(slope)
            }
          },
          {init: function(){
            slope.showLines(true).showCat(["advocacy", "climate change", "cohercion", "community issues"])
            chart.call(slope)
            }
          }
        ]

        //var slopeCat = ["advocacy", "climate change", "cohercion", "community issues", "contraception issues", "corruption", "development issues", "economic issues", "education", "environment issues", "eugenics", "fertility rate", "fp methods", "funding", "health issues", "islamic view", "law", "malthusian dispute", "misconceptions", "negative", "policy", "population  demographic issues", "positive", "poverty", "racism", "religion", "rights", "socio", "sustainability", "unmet need", "women issues", "youth", "balanced", "imperialism"]

        scope.ctrlmodels[scope.section.id].totalItems = step.length
        var pag = "<pagination previous-text='&lsaquo;' next-text='&rsaquo;' class='pagination-sm' total-items='ctrlmodels." + scope.section.id + ".totalItems' page='ctrlmodels." + scope.section.id + ".currentStep' items-per-page='ctrlmodels." + scope.section.id + ".itemsPerPage'></pagination>"
        var e = angular.element(pag)
        $(containerPagination).append(e)
        $compile(e)(scope)

        //lazy loading
        scope.$watch('utils.section', function(newValue, oldValue){
         if(newValue == scope.section.id && loaded === false){
           $timeout(function (){
            //scope.loadingstart()
            init()
            });
          }
        })

        scope.$watch('ctrlmodels.slopetfidf', function(newValue, oldValue){
            if (newValue !== oldValue){
              chart.datum(dataslope[newValue]).call(slope.wordStep([]))
            }
        });

        scope.$watch('ctrlmodels.slopescale', function(newValue, oldValue){
            if (newValue !== oldValue){
              slope.normalized(newValue)
              chart.call(slope)
            }
        });

        scope.$watch('ctrlmodels.'+ scope.section.id + '.currentStep', function(newValue, oldValue){
          if(newValue !== oldValue && scope.utils.section === scope.section.id && loaded){
                step[newValue-1].init()
            }
        })

        scope.$watch('ctrlmodels.fp2_text_slope.slopeCatSel.one', function(newValue, oldValue){
            if (newValue !== oldValue){
                var slopeCat = slope.showCat()
                slopeCat[0] = newValue;
                slope.showCat(slopeCat)
                chart.call(slope)               
            }
        });

        scope.$watch('ctrlmodels.fp2_text_slope.slopeCatSel.two', function(newValue, oldValue){
            if (newValue !== oldValue){
                var slopeCat = slope.showCat()
                slopeCat[1] = newValue;
                slope.showCat(slopeCat)
                chart.call(slope)               
            }
        });

        scope.$watch('ctrlmodels.fp2_text_slope.slopeCatSel.three', function(newValue, oldValue){
            if (newValue !== oldValue){
                var slopeCat = slope.showCat()
                slopeCat[2] = newValue;
                slope.showCat(slopeCat)
                chart.call(slope)               
            }
        });

        scope.$watch('ctrlmodels.fp2_text_slope.slopeCatSel.four', function(newValue, oldValue){
            if (newValue !== oldValue){
                var slopeCat = slope.showCat()
                slopeCat[3] = newValue;
                slope.showCat(slopeCat)
                chart.call(slope)               
            }
        });


      }
    };
  }])
  .directive('vizStepTreemap',['fileService', '$timeout', function (fileService, $timeout) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'partials/vizstep.html',
      link: function postLink(scope, element, attrs) {
		
		$(document).on("click",".tt .glyphicon",function(e){
			$(this).parent().remove();
		})
		
        var counter = 0,
            dsv_egg = d3.dsv(";", "text/plain"),
            data,
            treemap,
            cell,
            rects,
            node,
            x,
            y,
            root,
            n,
            rows,
            step,
            btnaction,
            loaded = false;

        var container = element.find("#graph")[0];

        var init = function(){

          fileService.getFile('data/' + scope.section.id + '/threads.csv').then(
            function(_data){

              rows = dsv_egg.parse(_data,function(d) {
                  return {
                    lang : d.lang,
                    forum : d.forum,
                    title : d.title,
                    orig_author : d.original_author,
                    time : +d.time,
                    nb_authors : +d.nb_authors,
                    nb_replies : +d.nb_replies,
                    post_length : +d.avg_post_length
                  };
              });

              rows = rows.filter(function(row) {
                    if (row.lang == "en")
                      return false;
                    else
                      return true;
                  });

                  data = d3.nest().key(function(d) {
                    return d.lang;
                  }).key(function(d) {
                    return d.forum;
                  }).entries(rows);

                var margin = {
                  top : 10,
                  right : 10,
                  bottom : 10,
                  left : 10
                }, 
                width = $(container).width()  - margin.left - margin.right, 
                height = $(container).height() - margin.top - margin.bottom -3;

              var txtScale = d3.scale.linear().domain([1, 4]).range([1, 0.4])
              x = d3.scale.linear().range([0, width / 2])
              y = d3.scale.linear().range([0, height / 2])

              var color = d3.scale.ordinal().range(["#D5C23A", "#E83931", "#83A493", "#415762", "#351D11"]);

              var treemap = d3.layout.treemap().size([width, height]).sticky(true).padding(function(d) {
                return 8 - (d.depth * 2)
              }).children(function(d) {
                return d.values;
              }).value(function(d) {
                return 1
              });

              var div = d3.select(container).append("svg").attr("width", (width + margin.left + margin.right)).attr("height", (height + margin.top + margin.bottom))
              var tt = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

              function viz() {

                data = {
                  "key" : "data",
                  "values" : data
                }
                n = root = data;
                //console.log(n);

                node = div.datum(data).selectAll(".node").data(treemap.nodes).enter().append("rect").attr("class", "node").call(position).style("fill", function(d) {
                  if (!d.depth > 1)
                    return "#83A493";
                  else if (d.depth > 0)
                    return d.lang == 'it' || d.key == 'it' || d.parent.key == 'it' ? "#83A493" : '#D6C33B';
                  else
                    return "none"
                }).style("opacity", 1).on("click", function(d) {
                  console.log(d)
                }).attr("class", function(d) {
                  return "lvl-" + d.depth
                }).on('click', function(d) {
                  if (l == d.depth) {
                    
                      drawTt(d);
                      
                    
                  }
                })
                //.text(function(d) { return d.children ? null : d.depth; });

                createText(1);

                // d3.selectAll("input").on("change", function change() {
                //   var value = this.value === "count" ? function(d) {
                //     return d.nb_authors;
                //   } : function(d) {
                //     return 1.00;
                //   };

                //   node.data(treemap.value(value).nodes).transition().duration(500).call(position);

                //   d3.selectAll(".label-tree").transition().duration(500).attr("x", function(d) {
                //     return d.x
                //   }).attr("y", function(d) {
                //     return d.y
                //   })
                // });
              };
              
              function drawTt(d) {
                var myx=0;
                if(d3.event.pageX>width-250) myx = d3.event.pageX-260
                else myx = d3.event.pageX;
                
                tt.style("opacity", 1);
                if(d.depth==1) {
                  tt.html('<div class="tt"><span class="glyphicon glyphicon-remove"></span><div><b>Site language</b> <p>'+d.key+'</p> </div><div><b>Forum count</b> '+d.values.length+'</div></div>').style("left", (myx) + "px").style("top", (d3.event.pageY - 28) + "px");
                }
                else if(d.depth==2) {
                  tt.html('<div class="tt"><span class="glyphicon glyphicon-remove"></span><div><b>Forum title</b> <p>'+d.key+'</p></div><div><b>Post count</b> '+d.values.length+'</div></div>').style("left", (myx) + "px").style("top", (d3.event.pageY - 28) + "px");
                }
                else if(d.depth==3) {
                  tt.html('<div class="tt"><span class="glyphicon glyphicon-remove"></span><div><b>Post title</b><p> '+d.title+'</p></div><div><b>Author</b><p>'+d.orig_author+'</p></div><div><b>Forum</b> <p>'+d.forum+'</p></div></div>').style("left", (myx) + "px").style("top", (d3.event.pageY - 28) + "px");
                }
              }
              
              function position() {
                this.attr("x", function(d) {
                  return d.x;
                }).attr("y", function(d) {
                  return d.y;
                }).attr("width", function(d) {
                  return Math.max(0, d.dx - 1);
                }).attr("height", function(d) {
                  return Math.max(0, d.dy - 1);
                });
              }

              function setLvl(n) {

                tt.style("opacity", 0);
                l = n;
                for ( var i = 0; i < 4; i++) {
                  if (i != n)
                    $(".lvl-" + i).css("pointer-events", "none"); //fix selection
                }
                $(".lvl-" + n).css("pointer-events", "auto"); //fix selection
              }

              function createText(lvl) {

                d3.selectAll(".label-tree").remove();

                div.selectAll(".label-tree").data(treemap.nodes).enter().append("text").filter(function(d) {
                  if (d.depth == lvl && d.dx > 100 && d.dy > 20)
                    return true;
                  else
                    return false;
                }).attr("class", "label-tree").attr("font-family", "Montserrat").attr("font-size", txtScale(lvl) + "em").attr("fill", "#000").transition().duration(500).attr("opacity", 1).attr("x", function(d) {
                  //console.log(d);
                  return d.x
                }).attr("y", function(d) {
                  return d.y
                }).attr("dx", txtScale(lvl) * 0.7 + "em").attr("dy", txtScale(lvl) * 1.4 + "em").text(function(d) {
                  return d.key
                });
              }

              var l = 0;

              viz();

              step = [
                {init: function(){
                    node/*.transition().duration(500)*/.style("opacity", 1)
                    createText(1);
                    setLvl(1)
                  }
                },
                {init: function(){
                    node/*.transition().duration(500)*/.style("opacity", function(d) {
                      if (d.depth > 1)
                        return 1;
                      else
                        return 0
                    })
                    createText(2);
                    setLvl(2)
                  }
                },
                {init: function(){
                  node.data(treemap.value(function(d) {
                    return 1;
                  }).nodes)/*.transition().duration(500)*/.call(position).style("opacity", function(d) {
                    if (d.depth < 3)
                      return 0;
                    else
                      return 1
                  
                  });
                  setLvl(3)
                  d3.selectAll(".label-tree").remove();
                  }
                },
                {init: function(){
                    var val = function(d) {
                      return d.nb_replies;
                    }

                    node.data(treemap.value(val).nodes)/*.transition().duration(500)*/.call(position).style("opacity", function(d) {
                      if (d.depth < 3)
                        return 0;
                      else
                        return 1
                    });
                    setLvl(3)
                    d3.selectAll(".label-tree").remove();

                  }
                },
                {init: function(){
                    node.data(treemap.value(function(d) {
                      return d.time;
                    }).nodes)/*.transition().duration(500)*/.call(position).style("opacity", function(d) {
                      if (d.depth < 3)
                        return 0;
                      else
                        return 1
                    });
                    setLvl(3)
                    d3.selectAll("label-tree").remove();
                  }
                },
                {init: function(){
                    node.data(treemap.value(function(d) {
                      return d.nb_authors;
                    }).nodes)/*.transition().duration(500)*/.call(position).style("opacity", function(d) {
                      if (d.depth < 3)
                        return 0;
                      else
                        return 1
                    })
                    setLvl(3)
                    d3.selectAll(".label-tree").remove();
                  }
                },
                {init: function(){
                    node.data(treemap.value(function(d) {
                      return d.nb_authors;
                    }).nodes)/*.transition().duration(500)*/.call(position).style("opacity", function(d) {
                      if (d.depth < 3)
                        return 0;
                      else
                        return 1
                    })
                    setLvl(3)
                    d3.selectAll(".label-tree").remove();
                  }
                }
            ]

            btnaction = {
              language : function(){
                console.log("ciao")
                    node.filter(function(d) {
                        return d.depth == 1
                      })/*.transition().duration(500)*/.style("opacity", 1)
                      
                      setLvl(1);

                      createText(1);
              },
              forum : function(){
                node.filter(function(d) {
                  return d.depth > 1
                })/*.transition().duration(500)*/.style("opacity", 1)
                node.filter(function(d) {
                  return d.depth <= 1
                })/*.transition().duration(500)*/.style("opacity", 0)
                setLvl(2)

                createText(2);                
              },
              post : function(){
                d3.selectAll(".label-tree").remove();
                setLvl(3)

                node.filter(function(d) {
                  return d.depth <= 2
                })/*.transition().duration(500)*/.style("opacity", 0)   
              },
              reply: function() {
                var val = function(d) {
                  return d.nb_replies;
                }
                node.data(treemap.value(val).nodes)/*.transition().duration(500)*/.call(position)
                if (l > 0)
                  createText(l);
                tt.style("opacity", 0);               
              },
              time : function(){
                var val = function(d) {
                  return d.time;
                }
                node.data(treemap.value(val).nodes)/*.transition().duration(500)*/.call(position)
                if (l > 0)
                  createText(l);
                tt.style("opacity", 0);
              },
              author : function(){
                
                var val = function(d) {
                  return d.nb_authors;
                }
                node.data(treemap.value(val).nodes)/*.transition().duration(500)*/.call(position)
                if (l > 0)
                  createText(l);
                tt.style("opacity", 0);
              }
            }
              loaded = true;
            },
            function(error){
              element.find('#graph').html(error)
            }
          );
        };

        if (scope.$parent.$last === true) {
                  scope.$emit('docReady');
                  $timeout(function () {
                       //init()
                  });
        }
        else {
           $timeout(function (){
              //init();
          })

         }

        //lazy loading
        scope.$watch('utils.section', function(newValue, oldValue){
         if(newValue == scope.section.id && loaded === false){
           $timeout(function (){
            //scope.loadingstart()
            init()
            });
          }
        })

        scope.$watch('ctrlmodels.treemaphierarchy',function(newValue, oldValue){
          if(newValue !== oldValue){
            btnaction[newValue]()
          }
        });

        scope.$watch('ctrlmodels.treemapsort',function(newValue, oldValue){
          if(newValue !== oldValue){
            btnaction[newValue]()
          }
        });

        scope.$watch('utils.internalCounter',function(newValue, oldValue){
          if(newValue !== oldValue && scope.utils.section === scope.section.id && loaded){
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
  .directive('legendStep', ['fileService', '$timeout', '$compile', function (fileService, $timeout, $compile) {
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
            var e = angular.element(txt);
            element.append(e);
            limit = element.children().length;
            $compile(e)(scope);

          },
          function(error){
            txt = error
            element.html(txt)
            
          }
        );

        // scope.$watch('utils.internalCounter',function(newValue, oldValue){
        //   if(newValue !== oldValue && scope.utils.section === scope.section.id){

        //     if(newValue > oldValue){

        //       if(counter < 0){counter = 0}
        //         counter++
        //       }else{
        //         if(counter >= limit){counter = counter -1}
        //         counter--
        //       }

        //       if(element.children(".step" + (counter)).length){
        //         element.animate({scrollTop: element.scrollTop() + element.children(".step" + (counter)).position().top}, 500);
        //       }
        //     }

        // })
        
        scope.$watch('ctrlmodels.'+ scope.section.id + '.currentStep', function(newValue, oldValue){
          if(newValue !== oldValue && scope.utils.section === scope.section.id){
                //step[newValue-1].init()
                element.animate({scrollTop: element.scrollTop() + element.children(".step" + (newValue-1)).position().top}, 500);
            }
        })

      }
    };
  }])
  .directive('legendStatic', ['fileService', '$timeout', '$compile', function (fileService, $timeout, $compile) {
    return {
      restrict: 'A',
      replace: false,
      //templateUrl: '../partials/legendstep.html',
      link: function postLink(scope, element, attrs) {

        var limit,
              txt,
              counter = 0;

        fileService.getFile('data/' + scope.section.id + '/legendstatic.html').then(
          function(data){
            var e = angular.element(data);
            element.append(e);
            limit = element.children().length;
            $compile(e)(scope);

          },
          function(error){
            element.html(error)
            
          }
        );
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
              queryChart,
              loaded = false;

              var tagHeight = element.find(".catcont").height() - element.find(".cattit").height();
              element.find("#category").height(tagHeight-2)
              var domainHeight = element.find(".domcont").height() - element.find(".domtit").height();
              element.find("#domain").height(domainHeight-2)
              var queryHeight = element.find(".quecont").height() - element.find(".quetit").height();
              element.find("#query").height(queryHeight-2)

           var init = function(){
            fileService.getFile('data/' + scope.section.id + '/fp_analytics.csv').then(
              function(data){
                csv = d3.tsv.parse(data);
                // Create the crossfilter for the relevant dimensions and groups.
                var category = crossfilter(csv),
                all = category.groupAll(),
                // host = category.dimension(function(d) { return d.HOST; }),
                // hosts = host.group(),
                query = category.dimension(function(d) { return d.QUERY; }),
                queries = query.group(),
                tag = category.dimension(function(d) { return d.TAG; }),
                tags = tag.group(),
                tld = category.dimension(function(d) { return d.TLD; }),
                tlds = tld.group()
                // url = category.dimension(function(d) { return d.URL; }),
                // urls = tld.group();

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

                loaded = true;                       
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
                       //init()
                  });
        }
        else {
           $timeout(function (){
              //init();
          })

         }

        //lazy loading
        scope.$watch('utils.section', function(newValue, oldValue){
         if(newValue == scope.section.id && loaded === false){
           $timeout(function (){
            //scope.loadingstart()
            init()
            });
          }
        })

      }
    };
  }])
  .directive('imagesElastic',['fileService', '$timeout', function (fileService, $timeout) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'partials/imageselastic.html',
      link: function postLink(scope, element, attrs) {

      var col=true,
          rows,
          siz=50,
          data,
          load=0,
          count=0,
          currArray,
          langsArr=[],
          tagsArr=[],
          paginate,
          scrollEnd=false,
          langLvl=0,
          langScale,
          tagScale,
          vizContainer = element.find('#viz_googleimages')[0],
          sliderContainer,
          radContainer,
          imgsContainer,
          dsv_egg = d3.dsv(";", "text/plain"),
          loaded = false;

      var init = function(){

        fileService.getFile('data/' + scope.section.id + '/CS_img.csv').then(
          function(_data){
            rows = dsv_egg.parse(_data,function(d) {
                      return {
                        keyword: d.keyword,
                        image: d.image,
                        lang: d.lang,
                        rank: +d.rank,
                        color: d.color
                      };
                    });
            
            data = d3.nest()
              .key(function(d) {return d.lang; })
                .key(function(d) {return d.keyword; })
                .entries(rows);
                
            var maxH=0
                
            data.forEach(function (d,i) {
              d.count=0;
              d.y=maxH
              d['values'].forEach(function(e,j) {
                maxH+=e['values'].length
                d.count+=e['values'].length
                
              });
            });

            var margin = {top: 40, right: 10, bottom: 10, left: 10},
            width = $(vizContainer).width()*.45 - margin.left - margin.right,
            height =  $(vizContainer).height() - margin.top - margin.bottom;
             
             var listW = width*0.45;
             
             var svg, langs, tags;
             svg = d3.select(vizContainer).append("svg")
            .attr("width", (width + margin.left + margin.right))
            .attr("height", (height + margin.top + margin.bottom))
            .attr("style", "float:left")
            
            d3.select(vizContainer).append("div")
            .attr("class","slider")

            sliderContainer = element.find(".slider")[0]
            
            $(sliderContainer).slider({'min':40,'max':100, 'value':50})
            .on('slide', function(ev){
              changeSize(ev.value)
            });
            
            d3.select(vizContainer).append("div")
            .attr("class","rad")
            .attr("style","float:left; clear:right")

            radContainer = element.find(".rad")[0]
            
            $(radContainer).append('<div class="btn-group show-lvl"><button id="language" type="button" class="btn btn-default elstc">Images</button><button id="forum" type="button" class="btn btn-default elstc">Colors</button></div>')
            
            
            d3.select(vizContainer).append("div")
            .attr("class","imgs")
            
            imgsContainer = element.find(".imgs")[0]

            var offset = $(imgsContainer).position().top
            $(imgsContainer).height(height);
            
            paginate=$(imgsContainer).width()*$(imgsContainer).height()/(siz*siz);
            console.log("paginate",paginate)
            
            
            //var t = d3.select("svg").append("g").attr("class","tag-group")
            var t = svg.append("g").attr("class","tag-group")
            
             function viz_googleimages() {
            
            //scale function  
          langScale = d3.scale.linear().domain([0, maxH]);
          langScale.range([0, height]) 

          //draw lang rects
            langs = svg.selectAll(".lang").data(data)
            .enter()
            .append("rect")
            .attr("class", "lang")
          .attr("x",  20)
          .attr("y", function(d){return langScale(d.y)+2})
            .attr("width", listW)
          .attr("height", function(d) {return langScale(d.count) })
            .style("fill", function(d) {return "#dddddd";})
            .style("stroke","#999999")
            .on("click", function(d){
              console.log(d)
              if(!d3.select(this).classed("sel")) {
              		d.sel=true;
              		
	                d3.select(this).classed("sel",true)
	                var index = langsArr.indexOf(d.key);
              		if (index == -1) {
					    langsArr.push(d.key);
					}
	                //ealstify list
              		elastify();
              		loadImages();
              	}
              	else {
              		d.sel=false;
              		d3.select(this).classed("sel",false)
              		var index = langsArr.indexOf(d.key);
              		if (index > -1) {
					    langsArr.splice(index, 1);
					}
					if(!langsArr.length) {
						tagsArr=[];
						$(".tag.sel").removeClass("sel")
						}
					elastify();
					loadImages();
              	}
              
              	console.log(langsArr)
              
              });
            
            //labels for languages 
            svg.selectAll(".lang-txt")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "lang-txt")
            .attr("font-family", "serif")
          .attr("font-size", "1em")
          .attr("x",  20)
          .attr("y", function(d){return langScale(d.y)+2})
          .attr("dx", "0.4em")
          .attr("dy", "1.3em")
          .style("fill","#222222")
          .text(function(d){return d.key})
              
              loadWhole();
              
            }

			
			function loadWhole() {
				
				var dt={}
				dt.values = d3.nest()
                .key(function(d) {return d.keyword; })
                .entries(rows);
                elastify(dt);
                
                var x={}
                x.values=rows
                loadImages(x);
			}
			
             function elastify() {
            
            	var dt = rows.filter(function(e){return langsArr.indexOf(e.lang)>=0})
            	console.log("dt",dt)
            	var d = d3.nest()
                .key(function(f) {return f.keyword; })
                .entries(dt);
                
                console.log("d",d)
            
              //compute height
              var tagH=0
            
            //t.attr("transform","rotate(30)")
            
              d.sort(function(a,b) {
                return b['values'].length-a['values'].length
                })
              
              d.forEach(function(e,i){
           
                //e.y=tagH;
                tagH+=e['values'].length  
              })
              
              //rescale the scale 
              
              tagScale = d3.scale.linear().range([height/37, height/1.75]); 
              tagScale.domain([0, tagH]).clamp(true)
              var vals=0
              d.forEach(function(e,i){
                
                e.y=vals;
                e.h=tagScale(e['values'].length)
                vals+=e.h 
              })

              //draw section
              
              tags= t.selectAll(".tag").data(d,function(e){return e.key})
              
              var enter = tags.enter()
              .append("rect")
              
              //enter new elements
              enter.attr("class","tag")
              .attr("x",  width*.1+listW)
            .attr("y", function(e){return e.y})
              .attr("width", listW)
            .attr("height", function(e) {return e.h })
              .style("fill", function(e) {return "#dddddd";})
              .style("stroke","#999999")
              .on("click", function(d){
              	console.log(d)
              	if(!d.sel) {
              		d.sel=true;
              		var index = tagsArr.indexOf(d.key);
              		if (index == -1) {
					    tagsArr.push(d.key);
					}
	                d3.select(this).classed("sel",true)
	                loadImages();
              	}
              	else {
              		d.sel=false;
              		d3.select(this).classed("sel",false)
              		var index = tagsArr.indexOf(d.key);
              		console.log(index)
              		if (index > -1) {
					    tagsArr.splice(index, 1);
					}
					loadImages();
              	}
              	
              });
              
              //transition on existing
              tags.transition().duration(500)
              .attr("y", function(e){return e.y})
            .attr("height", function(e) {return e.h })
            .each("end",function() {
              
              var rawH=t[0][0].getBBox().height;
              
              t.transition().duration(100).attr("transform","scale(1,"+height/rawH+")")
            })
              
              //remove old elements
              tags.exit().remove();
              
              //Text
              var txt = t.selectAll(".tag-txt")
              .data(d,function(e){return e.key})
              
              var txtEnt=txt.enter()
              .append("text")
              
              txtEnt
              .attr("class", "tag-txt")
              .attr("font-family", "serif")
	            .attr("font-size", "1em")
	            .attr("x",  width*.12+listW)
	            .attr("y", function(e){return e.y})
	            .attr("dx", "0.4em")
	            .attr("dy", "1.3em")
	            .style("fill","#222222")
	            .text(function(d){return d.key})
	            
	            txt.transition().duration(500)
	            .attr("y", function(e){return e.y})
	
	            txt.exit().remove()
             }
             
             
             
             
             function loadImages() {
				console.log("arrays",langsArr,tagsArr)
           		$(imgsContainer).empty();
           		$(imgsContainer).scrollTop(0);
           		scrollEnd=false;
           		load=0;
           		currArray=rows.filter(function(e){
           			if(tagsArr.length)
              		return langsArr.indexOf(e.lang)>=0 && tagsArr.indexOf(e.keyword)>=0
              		else return langsArr.indexOf(e.lang)>=0
              	})
           		count=currArray.length;
           		if(count<=paginate) load=count
           		else load=paginate
              	
              currArray.slice(0,load-1).forEach(function(e,i) {
                $(imgsContainer).append("<div class='img-cont' style='width:"+siz+"px;height:"+siz+"px;background:"+e.color+"'><img class='smallImg' src='data/cs_images_elastic/img/cs_thumb/"+e.lang+"/t_"+e.image+"'/></div>")
                
              })
              if (!col) {
                  $(".imgs img").hide();
                }
              
              $(".imgs").on("scroll",function(e){
              	
              	if($(this).scrollTop()>=this.scrollHeight-800 && !scrollEnd) {
              		
              	if(count<=load+paginate) {
              		scrollEnd=true;
              		
              		currArray.splice(load,count-1).forEach(function(e,i) {
                $(imgsContainer).append("<div class='img-cont' style='width:"+siz+"px;height:"+siz+"px;background:"+e.color+"'><img class='smallImg' src='data/cs_images_elastic/img/cs_thumb/"+e.lang+"/t_"+e.image+"'/></div>")
              		})
              		if (!col) {
                  $(".imgs img").hide();
                }     
              		
              	}
              	
              	else{
              		
              		currArray.slice(load,load+paginate-1).forEach(function(e,i) {
                $(imgsContainer).append("<div class='img-cont' style='width:"+siz+"px;height:"+siz+"px;background:"+e.color+"'><img class='smallImg' src='data/cs_images_elastic/img/cs_thumb/"+e.lang+"/t_"+e.image+"'/></div>")
              		})
              		if (!col) {
	                  $(".imgs img").hide();
	                }     
              		load+=paginate;
              		
              	}
              	}
              	
              	
              	
              })
             }
             
             function changeSize(n) {
               siz=n;
               paginate=$(imgsContainer).width()*$(imgsContainer).height()/(siz*siz);
               if($(".imgs").children.length<=paginate && currArray.length>=$(".imgs").children.length) {
               		currArray.slice(load,load+paginate-1).forEach(function(e,i) {
               		 $(imgsContainer).append("<div class='img-cont' style='width:"+siz+"px;height:"+siz+"px;background:"+e.color+"'><img class='smallImg' src='data/cs_images_elastic/img/cs_thumb/"+e.lang+"/t_"+e.image+"'/></div>")
              		})
              		if (!col) {
	                  $(".imgs img").hide();
	                }     
              		load+=paginate;
               }
               $(".img-cont").css("width",n+"px")
               $(".img-cont").css("height",n+"px")
             }

             $(".elstc").on("click",function(e){
              col=!col;
              if(col) $(".imgs img").fadeIn(300)
              else $(".imgs img").fadeOut(300)
             })
             
             d3.select(window).on("resize", function() {
            //   width=$("#viz_googleimages").width()*0.45
            //   listW = width*0.45;
            // d3.select("svg").attr("width", width);
            // d3.select("svg").attr("height", $("#viz_googleimages").height());
            // d3.selectAll("rect").attr("width", listW)
            // d3.selectAll(".tag") .attr("x",  width*.1+listW)
            // d3.selectAll(".tag-txt").attr("x",  width*.1+listW)
          });

            viz_googleimages();

            //end elastic mess
            loaded = true
          },
          function(error){

          }
          );
      }

      if (scope.$parent.$last === true) {
        scope.$emit('docReady');
        $timeout(function () {
            //init()
        });
      }
      else {
         $timeout(function (){
          //init()
        })

       }

      //lazy loading
      scope.$watch('utils.section', function(newValue, oldValue){
       if(newValue == scope.section.id && loaded === false){
         $timeout(function (){
          //scope.loadingstart()
          init()
          });
        }
      })

      }
    }
  }])
  
   .directive('anonMap',['fileService', '$timeout', '$compile', function (fileService, $timeout, $compile) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'partials/map.html',
      link: function postLink(scope, element, attrs) {
      	var vizContainer = element.find('#wikimap')[0]
      	var mapdata;
      	var loaded = false;
      	var containerPagination = element.find("#paginationStep")[0];
		var s = d3.scale.linear().range([20,80]).domain([2,100]).clamp(true)
		var step, map, markers_cs, markers_fp, markers_sp_cs, markers_sp_fp;
		
		
		d3.tsv('data/' + scope.section.id + '/wiki_map.tsv',function(error, data) {
		
			mapdata=data;
			drawMap();
		});
		
		function drawMap() {
			
			console.log(mapdata)
		
		    map = L.mapbox.map('wikimap', 'fenicento.ha4jo7ff',{scrollWheelZoom:false})
		        .setView([18.95, 18.08333], 2);
		        
		        console.log(map)
			
		    markers_cs = new L.MarkerClusterGroup({showCoverageOnHover:false,iconCreateFunction: bcCluster,spiderfyOnMaxZoom:true});
		    markers_fp = new L.MarkerClusterGroup({showCoverageOnHover:false, iconCreateFunction: fpCluster,spiderfyOnMaxZoom:true});
		    markers_sp_cs = new L.MarkerClusterGroup({showCoverageOnHover:false,iconCreateFunction: bcCluster,spiderfyOnMaxZoom:true});
		    markers_sp_fp = new L.MarkerClusterGroup({showCoverageOnHover:false, iconCreateFunction: fpCluster,spiderfyOnMaxZoom:true});
		
		 	addAllMarkers();	
		 
		 	if (map.hasLayer(markers_sp_cs)) map.removeLayer(markers_sp_cs);
		   	if (map.hasLayer(markers_sp_fp)) map.removeLayer(markers_sp_fp);
		   	
		   	map.addLayer(markers_cs);
		   	map.addLayer(markers_fp);
			
			map.setView([18.95, 18.08333], 2,{animate:true});
			
			loaded=true;

		}
		
		function bcCluster(cluster) {
			var childCount = cluster.getChildCount();
	
			var c = ' marker-cluster-';
			if (childCount < 10) {
				c += 'small';
			} else if (childCount < 100) {
				c += 'medium';
			} else {
				c += 'large';
			}
			c+="-2"
			return new L.DivIcon({ html: '<div><span style="line-height:'+s(childCount)+'px;">' + childCount + '</span></div>', className: 'marker-cluster' + c, iconSize: new L.Point(s(childCount), s(childCount)) });
		}
	
	
		 function fpCluster(cluster) {
			var childCount = cluster.getChildCount();
	
			var c = ' marker-cluster-';
			if (childCount < 10) {
				c += 'small';
			} else if (childCount < 100) {
				c += 'medium';
			} else {
				c += 'large';
			}
	
			return new L.DivIcon({ html: '<div><span style="line-height:'+s(childCount)+'px;">' + childCount + '</span></div>', className: 'marker-cluster' + c, iconSize: new L.Point(s(childCount), s(childCount)) });
		}
		
		
		function addAllMarkers () {
		   	for (var i = 0; i < mapdata.length; i++) {
		        var a = mapdata[i];
		       
		        var title = a['revid'];
		        var type = a['type'];
		        var date = a['date'];
		        var comment = a['comment'];
		        var user = a['user'];
		       
		        if(a.lat!="" && a.lon!="" && a.page=="Birth Control") {
		       
		        var marker = L.circleMarker(new L.LatLng(a['lat'].replace(",","."), a['lon'].replace(",",".")), {
		            //icon: L.mapbox.marker.icon({ 'marker-color': 'd45158'}),
		            radius: 5,
		        	fillColor: "#78CCD3",
		        	stroke: false,
		        	fillOpacity: 0.69,
		            title: title,
		            date: date,
		            user: user,
		            comment: comment,
		            type: type
		        });
		        marker.bindPopup("<br/><div><b>Date:</b> "+date+"</div><div><b>User:</b> "+user+"</div><div><b>Revision id:</b> "+title+"</div><div><b>type:</b> "+type+"</div><div><b>Comment:</b> "+comment+"</div>");
		        markers_cs.addLayer(marker);
		        
		       }
		       
		       if(a.lat!="" && a.lon!="" && a.page=="Birth Control" && a.type=="spoil") {
		       
		        var marker = L.circleMarker(new L.LatLng(a['lat'].replace(",","."), a['lon'].replace(",",".")), {
		            //icon: L.mapbox.marker.icon({ 'marker-color': 'd45158'}),
		            radius: 5,
		        	fillColor: "#78CCD3",
		        	stroke: false,
		        	fillOpacity: 0.69,
		            title: title,
		            date: date,
		            user: user,
		            comment: comment,
		            type: type
		        });
		        marker.bindPopup("<br/><div><b>Date:</b> "+date+"</div><div><b>User:</b> "+user+"</div><div><b>Revision id:</b> "+title+"</div><div><b>type:</b> "+type+"</div><div><b>Comment:</b> "+comment+"</div>");
		        markers_sp_cs.addLayer(marker);
		        
		        
		       }
		       
		       if(a.lat!="" && a.lon!="" && a.page=="Family Planning") {
		       	
		        
		        var marker = L.circleMarker(new L.LatLng(a['lat'].replace(",","."), a['lon'].replace(",",".")), {
		            //icon: L.mapbox.marker.icon({ 'marker-color': '34CD87'}),
		            radius: 5,
		        	fillColor: "#005862",
		        	stroke: false,
		        	fillOpacity: 0.69,
		            title: title,
		            date: date,
		            user: user,
		            comment: comment,
		            type: type
		        });
		        marker.bindPopup("<br/><div><b>Date:</b> "+date+"</div><div><b>User:</b> "+user+"</div><div><b>Revision id:</b> "+title+"</div><div><b>type:</b> "+type+"</div><div><b>Comment:</b> "+comment+"</div>");
		        markers_fp.addLayer(marker);
		        
		       }
		       
		       if(a.lat!="" && a.lon!="" && a.page=="Family Planning" && a.type=="spoil") {
		       
		        var marker = L.circleMarker(new L.LatLng(a['lat'].replace(",","."), a['lon'].replace(",",".")), {
		            //icon: L.mapbox.marker.icon({ 'marker-color': 'd45158'}),
		            radius: 5,
		        	fillColor: "#005862",
		        	stroke: false,
		        	fillOpacity: 0.69,
		            title: title,
		            date: date,
		            user: user,
		            comment: comment,
		            type: type
		        });
		        marker.bindPopup("<br/><div><b>Date:</b> "+date+"</div><div><b>User:</b> "+user+"</div><div><b>Revision id:</b> "+title+"</div><div><b>type:</b> "+type+"</div><div><b>Comment:</b> "+comment+"</div>");
		        markers_sp_fp.addLayer(marker);
		 
		       }
		    }
		   } 
		   
		   
		   /*steps*/
		  step = [
                {init: function(){
                    if (map.hasLayer(markers_sp_cs)) map.removeLayer(markers_sp_cs);
				   	if (map.hasLayer(markers_sp_fp)) map.removeLayer(markers_sp_fp);
				   	
				   	map.addLayer(markers_cs);
				   	map.addLayer(markers_fp);
				
					map.setView([18.95, 18.08333], 2,{animate:true});
					
                  }
                },
                {init: function(){
                    if (map.hasLayer(markers_cs)) map.removeLayer(markers_cs);
				   	if (map.hasLayer(markers_fp)) map.removeLayer(markers_fp);
				   	
				  
				   	map.addLayer(markers_sp_cs);
				   	map.addLayer(markers_sp_fp);
				  
				   	
				   	map.setView([18.95, 18.08333], 2,{animate:true});
				   	
                  }
                }
               /* {init: function(){
                  if (map.hasLayer(markers_cs)) map.removeLayer(markers_cs);
				   	if (map.hasLayer(markers_fp)) map.removeLayer(markers_fp);
				   	
				  
				   	map.addLayer(markers_sp_cs);
				   	map.addLayer(markers_sp_fp);
				   	map.setView([11.583333, 122.75],6,{animate:true});
				   	
                  }
                }*/
                ]
                
                
                scope.ctrlmodels[scope.section.id].totalItems = step.length
		        var pag = "<pagination previous-text='&lsaquo;' next-text='&rsaquo;' class='pagination-sm' total-items='ctrlmodels." + scope.section.id + ".totalItems' page='ctrlmodels." + scope.section.id + ".currentStep' items-per-page='ctrlmodels." + scope.section.id + ".itemsPerPage'></pagination>"
		        var e = angular.element(pag)
		        $(containerPagination).append(e)
		        $compile(e)(scope)
		        
		        
		        scope.$watch('ctrlmodels.'+ scope.section.id + '.currentStep', function(newValue, oldValue){
		          if(newValue !== oldValue && scope.utils.section === scope.section.id && loaded){
		                step[newValue-1].init()
		            }
		        })
		
      }
      }
     }])
     
      .directive('wikiEdits',['fileService', '$timeout', '$compile', function (fileService, $timeout, $compile) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'partials/stacked.html',
      link: function postLink(scope, element, attrs) {
      
      	var bc = d3.select("#birthcontrol");
		var bcdata;
			
		var bcChart = who.chart()
		.w($("#birthcontrol").width())
		.h($("#birthcontrol").height());
		
		d3.tsv('data/' + scope.section.id + '/birtcontrol.csv',function(error, data) {	
			bcdata=data;
			bc.datum(bcdata).call(bcChart)	
		});
		
		
		var fp = d3.select("#familyplanning");
		var fpdata;
		
		var fpChart = who.chart()
		.w($("#familyplanning").width())
		.h($("#familyplanning").height());
		
		d3.tsv('data/' + scope.section.id + '/familyplanning.csv',function(error, data) {
			fpdata=data;
			fp.datum(fpdata).call(fpChart)
		});
		
  
		$('.wiki-stacked').on("click","button", function() {
			var v=$(this).html().toLowerCase()
			console.log(v)
			//v=$( "input:radio:checked" ).val()
			fpChart.change(v);
			bcChart.change(v);
		});
      
      }
      
     }
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
