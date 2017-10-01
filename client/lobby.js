import angular from 'angular'

angular.module('landingPage', [])
  .controller('UrlGeneratorCtrl', ['$scope', '$window', '$http', function ($scope, $window, $http) {
    var quoteDom = document.getElementById('quote')
    var authorDom = document.getElementById('author')

    $scope.login = function (token) {
      $http({
        method: 'POST',
        url: '/recaptcha',
        data: token,
        headers: {'Content-Type': 'text/plain'}
      }).then(function (res) {
        $scope.$applyAsync(function () {
          $window.location.replace(window.location.href + res.data)
        })
      }, function (err) {
        console.log(err)
      })
    }
    $window.login = $scope.login

    $http({
      method: 'GET',
      url: '/randomquote'
    }).then(function (res) {
      console.log(res.data)
      angular.element(quoteDom).html(res.data.quote)
      angular.element(authorDom).html('&mdash; ' + res.data.author)
    }, function (err) {
      console.log(err)
    })
  }])
