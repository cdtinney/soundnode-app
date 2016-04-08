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
            })
            .catch(function (error) {
                console.log('error', error);
            });
            
    }

    /**
     * TODO - Move to common 
     *
     * Responsible to check if there's a artwork
     * otherwise replace with default badge
     * @param thumb [ track artwork ]
     */
    $scope.checkForPlaceholder = function (thumb) {
        var newSize;

        if ( thumb === null ) {
            return 'public/img/logo-badge.png';
        } else {
            newSize = thumb.replace('large', 'badge');
            return newSize;
        }
    }
    
});