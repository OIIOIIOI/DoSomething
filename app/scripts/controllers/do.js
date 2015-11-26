'use strict';

function findYearData (data, year)
{
	for (var i = 0 ; i < data.length ; i++) {
		if (data[i].y == year) {
			return data[i];
		}
	}
}

angular.module('doSomethingApp')
	.factory ('Country', function ($resource)
	{
		return $resource('data/:country.json', {}, {
			query: {method:'GET', params:{country:'countries'}, isArray:true},
			get: {method:'GET', params:{}}
		});
	})
	.controller('DoCtrl', function ($scope, $interval, $filter, Country)
	{
		$scope.lastYear = 0;
		// Get list of countries
		Country.query(function (data) {
			$scope.countries = data;
			$scope.selCountry = $scope.countries[0];
			$scope.chooseCountry();
		});
		// Set genders
		$scope.genders = [
			{ "name":"Female", "v":"f" },
			{ "name":"Male", "v":"m" }
		];
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
		$scope.selGender = $scope.genders[0];
		// Set month
		$scope.months = [];
		for (var i = 1 ; i < 13 ; i++) {
			$scope.months.push({ "i":i, "s":$filter('date')("2000-" + ((i < 10) ? "0" + i : i) + "-01", "MMMM") });
		}
		$scope.selMonth = $scope.months[0];
		// Set day
		$scope.days = [];
		for (i = 0 ; i < 31 ; i++) {
			$scope.days.push(i + 1);
		}
		$scope.selDay = $scope.days[0];
		// Refresh results
		$scope.refreshResults = function () {
			$scope.lifeExp = $scope.selYear[$scope.selGender.v];
			$scope.msLifeExp = $scope.lifeExp * 31556952000;
			// create/update birth date object
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
			$scope.elapsed = diff * 100 / $scope.msLifeExp;
			$scope.age = diff / 31556952000;
		};
		$interval($scope.refreshPB, 100);
	});
