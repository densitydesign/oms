'use strict';


// Declare app level module which depends on filters, and services
angular.module('who', [
  'ngRoute',
  'ui.bootstrap',
  'who.filters',
  'who.services',
  'who.directives',
  'who.controllers',
  'chieffancypants.loadingBar',
  'ngAnimate'
])
.config(function ($routeProvider, $locationProvider) {
  $routeProvider.when('/', {templateUrl: 'partials/familyplanning.html', controller: 'familyplanning'});
  $routeProvider.otherwise({redirectTo: '/'});
  //$locationProvider.html5Mode(true);
});
