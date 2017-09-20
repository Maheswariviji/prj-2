module.exports = function($scope, $http, Upload, $window, $mdDialog) {
    var vm = this;
    vm.submit = function() { 
    //function to call on form submit
    console.log("vm function called")
        if (vm.upload_form.file.$valid && vm.file) { //check if from is valid
            vm.upload(vm.file); //call upload function
        }
    }

    vm.upload = function(file) {
        console.log("file");
        console.log(file);
        Upload.upload({
            url: 'http://localhost:3000/cabapi/upload', //webAPI exposed to upload the file
            data: {
                file: file
            } //pass file as data, should be user ng-model
        }).then(function(resp) { //upload function returns a promise
            if (resp.data.error_code === 0) { //validate success
                // $window.alert('Success ' + resp.config.data.file.name + 'uploaded. Response: ');
                $window.alert('Driver & Cab details saved successfully');
            } else {
                $window.alert('An error occured while uploading image');
            }
        });
    };
    var GetAllDrivers = function() {
        $http.get('/cabapi/GetAllCabDrivers').then(function(response) {
            $scope.DriverData = response.data;
        });
    }

    $scope.SaveCabDetails = function() {
        console.log(vm);
        console.log(vm.file);
        if (vm.file == undefined) {
            alert("Please select Driver Photo");
        } else {
            vm.submit();
            $scope.Cab.UserType = 'Driver';
            $scope.Cab.Password = 'password';
            $http.post('/cabapi/AddCabDetails', $scope.Cab).then(function(response) {});
            GetAllDrivers();
        }
        document.getElementById('form1').reset();
    };



    $scope.DeleteCabDetails = function(id) {
        x = confirm('Are you sure you want to delete this driver details ?');
        if (x) {
            console.log(id);
            $http.delete('/cabapi/DeleteCabDriver/' + id).then(function(response) {});
            GetAllDrivers();
        }
    }
    GetAllDrivers();
};
