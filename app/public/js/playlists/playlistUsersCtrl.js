"use strict"

app.controller('PlaylistUsersCtrl', function($rootScope, $scope, SCapiService, SNapiService, $log, $window, $http, ngDialog, notificationFactory) {

    $scope.data = '';

    SNapiService.users($scope.playlistId)
        .then(function(data) {
            $scope.data = data;
        }, function(error) {
            $log.log('error', error);
        }).finally(function() {
            $rootScope.isLoading = false;
        });

    /**
    * Adds a new user to the shared playlist 
    * @method addUser
    */
    $scope.addUser = function() {
        
        SCapiService.getUserByName($scope.newUserName)
            .then(function(data) {
                
                SNapiService.addUserToPlaylist(data.id, data.username, $scope.playlistId)
                    .then(function(response, status) {
                        notificationFactory.success("User added to playlist!");
                    }, function(response) {
                        notificationFactory.error("Something went wrong!");
                        $log.log(response);
                    })
                    .finally(function() {
                        ngDialog.closeAll();
                    });
            
            }, function (error) {
                console.log('error', error);
                notificationFactory.error("Something went wrong!");
            });
            
    };

    /**
     * Responsible to create a new playlist
     * and save the selected song
     * @method createPlaylistAndSaveSong
     */
    $scope.createPlaylistAndSaveSong = function() {
    };

    // Close all open modals
    $scope.closeModal = function() {
        ngDialog.closeAll();
    };
    
});