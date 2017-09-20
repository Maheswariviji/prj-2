module.exports = function($scope, $http, $state) {
    $scope.RegisterUser = function() {
        $http.post('/userapi/register', $scope.User).then(function(response) {});
        alert('User Registration Successful');
        $state.go('Login');
    }
}
