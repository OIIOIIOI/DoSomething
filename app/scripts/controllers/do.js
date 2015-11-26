'use strict';

var msInYear = 31556952000;
function findYearData (data, value) {
	for (var i = 0 ; i < data.length ; i++) {
		if (data[i].y == value) {
			return data[i];
		}
	}
}
function findGenderData (data, value) {
	for (var i = 0 ; i < data.length ; i++) {
		if (data[i].v == value) {
			return data[i];
		}
	}
}
function findCountryData (data, value) {
	for (var i = 0 ; i < data.length ; i++) {
		if (data[i].fileName == value) {
			return data[i];
		}
	}
}

angular.module('doSomethingApp')
	.factory ('Country', function ($resource)
	{
		return $resource('data/:country.json', {}, {
			query: {method:'GET', params:{country:'_countries'}, isArray:true},
			get: {method:'GET', params:{}}
		});
	})
	.controller('DoCtrl', function ($scope, $interval, $filter, localStorageService, Country)
	{
		// Get local storage
		var doParams = localStorageService.get('doParams');
		$scope.doParams = doParams || {};
		$scope.$watch('doParams', function () {
			localStorageService.set('doParams', $scope.doParams);
		}, true);
		
		// Get year from storage
		if ($scope.doParams.year != undefined) {
			$scope.lastYear = $scope.doParams.year;
		} else {
			$scope.lastYear = 0;
		}
		
		// Get list of countries
		Country.query(function (data) {
			$scope.countries = data;
			if ($scope.doParams.country != undefined) {
				$scope.selCountry = findCountryData($scope.countries, $scope.doParams.country);
			} else {
				$scope.selCountry = $scope.countries[0];
			}
			$scope.chooseCountry();
		});
		
		// Set genders
		$scope.genders = [
			{ "name":"Female", "v":"f" },
			{ "name":"Male", "v":"m" }
		];
		// Get gender from storage
		if ($scope.doParams.gender != undefined) {
			$scope.selGender = findGenderData($scope.genders, $scope.doParams.gender);
		} else {
			$scope.selGender = $scope.genders[0];
		}
		
		// Get data for selected country
		$scope.chooseCountry = function () {
			Country.get({ country:$scope.selCountry.fileName }, function (data) {
				$scope.country = data;
				if ($scope.lastYear == 0) {
					$scope.lastYear = $scope.country.data[0].y;
				}
				$scope.selYear = findYearData($scope.country.data, $scope.lastYear);
				$scope.refreshResults();
			});
		};
		
		// Select year
		$scope.chooseYear = function () {
			$scope.lastYear = $scope.selYear.y;
			$scope.refreshResults();
		};
		
		// Set month
		var sel = 1;
		if ($scope.doParams.month != undefined) {
			sel = $scope.doParams.month;
		}
		$scope.months = [];
		for (var i = 1 ; i < 13 ; i++) {
			var o = { "i":i, "s":$filter('date')("2000-" + ((i < 10) ? "0" + i : i) + "-01", "MMMM") };
			$scope.months.push(o);
			if (i == sel) {
				$scope.selMonth = o;
			}
		}
		
		// Set day
		$scope.days = [];
		for (i = 1 ; i < 32 ; i++) {
			$scope.days.push(i);
		}
		// Get day from storage
		if ($scope.doParams.day != undefined) {
			$scope.selDay = $scope.doParams.day;
		} else {
			$scope.selDay = $scope.days[0];
		}
		
		// Refresh results
		$scope.refreshResults = function () {
			// Update storage
			$scope.doParams.country = $scope.selCountry.fileName;
			$scope.doParams.gender = $scope.selGender.v;
			$scope.doParams.year = $scope.selYear.y;
			$scope.doParams.month = $scope.selMonth.i;
			$scope.doParams.day = $scope.selDay;
			// Get life expectancy data
			$scope.lifeExp = $scope.selYear[$scope.selGender.v];
			// Create/update birth date object
			if ($scope.birthDate == null) {
				$scope.birthDate = new Date();
			}
			$scope.birthDate.setUTCFullYear(parseInt($scope.selYear.y));
			$scope.birthDate.setUTCMonth(parseInt($scope.selMonth.i-1));
			$scope.birthDate.setUTCDate(parseInt($scope.selDay));
			$scope.birthDate.setUTCHours(12);
			$scope.birthDate.setUTCMinutes(0);
			$scope.birthDate.setUTCSeconds(0);
			$scope.birthDate.setUTCMilliseconds(0);
		};
		
		// Refresh progress bar
		$scope.refreshPB = function () {
			if ($scope.birthDate == null) {
				return;
			}
			var diff = new Date().getTime() - $scope.birthDate.getTime();
			$scope.elapsed = diff * 100 / ($scope.lifeExp * msInYear);
			$scope.age = diff / msInYear;
		};
		$interval($scope.refreshPB, 100);
	});
