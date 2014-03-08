'use strict';

/* Controllers */

angular.module('who.controllers', []).
  controller('MyCtrl1', [function() {

  }])
  .controller('MyCtrl2', [function() {

  }])
  .controller('caesariansection', function($scope) {

    $scope.menuElements =  [
          'intro bella lunga che ci stà',
          'un bel capitolo',
          'che storia sto cs',
          'immagini inguardabili',
          "finalmente l'ultimo"
        ]

  });