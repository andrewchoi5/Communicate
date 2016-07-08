
(function () {
  'use strict';
  /**
   * Watson Theaters Dialog angular application.
   */
  angular.module('app', [
    'gettext',
    'ngRoute',
    'templates',
    'ngAnimate',
    'dialog'
  ])
    .config(function ($routeProvider) {
      $routeProvider.otherwise({ 'redirectTo': '/' });
    })
    .run(function ($rootScope, gettextCatalog) {
      gettextCatalog.debug = true;
    });
}());
