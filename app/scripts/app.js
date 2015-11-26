'use strict';

/**
 * @ngdoc overview
 * @name doSomethingApp
 * @description
 * # doSomethingApp
 *
 * Main module of the application.
 */
angular.module('doSomethingApp', [
	'ngAnimate',
	'ngCookies',
	'ngResource',
	'ngRoute',
	'ngSanitize',
	'ngTouch',
	'ui.bootstrap',
	'LocalStorageModule'
	])
	.config(['localStorageServiceProvider', function(localStorageServiceProvider){
		localStorageServiceProvider.setPrefix('dols');
	}])
	.config(function ($routeProvider) {
		$routeProvider
		.when('/', {
			templateUrl: 'views/do.html',
			controller: 'DoCtrl',
			controllerAs: 'do'
		})
		.otherwise({
			redirectTo: '/'
		});
	});
