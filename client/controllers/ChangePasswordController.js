module.exports = function($scope, $http, $cookies) {
    $scope.ChangePass = function() {
        var p = document.getElementById('newpassword').value;
        var cp = document.getElementById('confirmpassword').value;
        if (p == cp) {
            var authUser = $cookies.getObject('authUser');
            $scope.User.Email = authUser.currentUser.userInfo.email;
            $http.post('/userapi/ChangePassword', $scope.User).then(function(response) {
                if (response.data.success == false) {
                    alert('Incorrect Old Password');
                } else if (response.data.success == true) {
                    alert('Password Changed Successfully');
                }
            });
        } else {
            alert('Password and confirm password does not match');
        }
        document.getElementById("form1").reset();
    }
}
