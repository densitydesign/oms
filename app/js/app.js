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
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'caesariansection'});
  $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
  $routeProvider.otherwise({redirectTo: '/view1'});
}]);
