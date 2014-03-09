'use strict';

/* Controllers */

angular.module('who.controllers', [])
  .controller('caesariansection', function($scope) {

    $scope.sections = [
      {id:"cs_intro",label:"Introduction to caesarian section", template:"chapter-intro"},
      {id:"cs_query_intro",label: "Building the corpus", template:"chapter-intro"},
      {id:"cs_query_network",step:1, template:"chapter-intro"},
      {id:"cs_query_analytics", template:"chapter-intro"},
      {id:"cs_crawl_intro", label:"Mapping the web", template:"chapter-intro"},
      {id:"cs_crawl_network",step:1, template:"chapter-intro"},
      {id:"cs_text_intro",label:"Seeing what they're saying", template:"chapter-intro"},
      {id:"cs_text_slope",step:1, template:"chapter-intro"},
      {id:"cs_images_intro",label:"Perceived image of the c-section",template:"chapter-intro"}, 
      {id:"cs_images_elastic", template:"chapter-intro"},
      {id:"cs_aufeminin_intro",label:"Analyzing the forum discussion", template:"chapter-intro"},
      {id:"cs_aufeminin_forum",step:1, template:"chapter-intro"},
      {id:"cs_aufeminin_networkFR",step:1, template:"chapter-intro"},
      {id:"cs_aufeminin_networkIT",step:1, template:"chapter-intro"}
    ]

  $scope.$on('docReady', function (ngRepeatFinishedEvent) {
          $.fn.fullpage({
          resize: false,
          css3: true,
          fixedElements: 'div.navbar , div.scrolldown',
          scrollOverflow: true,
          paddingTop: '55px',
          paddingBottom: '55px'
        });
    });
  });