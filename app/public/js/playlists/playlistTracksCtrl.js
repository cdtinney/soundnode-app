"use strict"

app.controller('PlaylistTracksCtrl', function($rootScope, $scope, SCapiService, SC2apiService, SNapiService, $log, $window, $http, ngDialog, notificationFactory) {

    $scope.data = '';
    
    SNapiService.getTrackRequests($scope.playlistId)
        .then(function(data) {
            loadTracksInfo(data);
            
        }, function(error) {
            console.log("error " + error);
            
        });
        
    function loadTracksInfo(collection) {
    
        var ids = collection.map(function (obj) {
            return obj.trackId;
        });

        SC2apiService.getTracksByIds(ids)
            .then(function (data) {
                $scope.data = data;
                console.log(data);
            })
            .catch(function (error) {
                console.log('error', error);
            });
            
    }
    
});