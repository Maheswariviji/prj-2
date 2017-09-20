module.exports = function($scope, $http, $mdDialog) {
    $('#starttimepicker').timepicki();
    $('#endtimepicker').timepicki();

    //   $(document).ready(function() {
    //     $("#button1").click(function() {
    //         alert($("#starttimepicker").val());
    //     });
    // });

    $scope.addTariff = function() {
        $scope.Tariff.StartPeakHour = $("#starttimepicker").val();
        $scope.Tariff.EndPeakHour = $("#endtimepicker").val();
        $http.post('/api/tariff', $scope.Tariff).then(function(response) {});
        getTariff();
        document.getElementById("form1").reset();
    };
    var getTariff = function() {
        $http.get('/api/gettariff').then(function(response) {
            $scope.tariffdata = response.data;
        });
    };
    $scope.getTariffById = function(STariff) {
        $http.get('/api/gettariffbyid/' + STariff._id).then(function(response) {
            $scope.Tariff = response.data[0];
            $("#mymodal").modal();
        });
    };
    getTariff();

    $scope.showConfirm = function(Tariff) {
        // Appending dialog to document.body to cover sidenav in docs app
        var confirm = $mdDialog.confirm()
            .title('Are you sure you want to delete this tariff plan ?')
            .textContent('This action cannot be rolled back.')
            // .ariaLabel('Lucky day')
            // .targetEvent(ev)
            .ok('Yes')
            .cancel('No');
        $mdDialog.show(confirm).then(function() {
            $http.delete('api/deletetariff/' + Tariff._id).success(function(response) {});
            getTariff();
        }, function() {
            //$scope.status = 'You decided to keep your debt.';
        });
    };
};
