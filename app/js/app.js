'use strict';


// Declare app level module which depends on filters, and services
angular.module('who', [
  'ngRoute',
  'ui.bootstrap',
  'who.filters',
  'who.services',
  'who.directives',
  'who.controllers'
]).
config(function ($routeProvider, $locationProvider) {
  //$routeProvider.when('/familyplanning', {templateUrl: 'partials/familyplanning.html', controller: 'familyplanning'});
  $routeProvider.when('/caesariansection', {templateUrl: 'partials/caesariansection.html', controller: 'caesariansection'});
  $routeProvider.otherwise({redirectTo: '/caesariansection'});

  //$locationProvider.html5Mode(true);
});
