"use strict"

app.controller('PlaylistUsersCtrl', function($rootScope, $scope, SCapiService, SNapiService, $log, $window, $http, ngDialog, notificationFactory) {

    $scope.data = '';

    SNapiService.users($scope.playlistId)
        .then(function(response) {
            $scope.data = response;
            
        }, function(error) {
            $log.log('error', error);
            
        }).finally(function() {
            $rootScope.isLoading = false;
            
        });

    /**
    * Adds a new user to the shared playlist 
    * @method add
    */
    $scope.add = function() {
        
        SCapiService.getUserByName($scope.newUserName)
            .then(function(data) {
                
                SNapiService.addUserToPlaylist(data.id, data.username, $scope.playlistId)
                    .then(function(response) {
                        notificationFactory.success("User added to playlist!");
                        
                    }, function(error) {
                        notificationFactory.error("Something went wrong!");
                        $log.log(error);
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
    * Removes a user from the shared playlist
    * @param [userId] SoundCloud user ID
    * @method remove
    */
    $scope.remove = function(userId) {
    
        SNapiService.removeUserFromPlaylist(userId, $scope.playlistId)
            .then(function(response) {
                notificationFactory.success("User removed from playlist!");                        
                $('#' + userId).remove();
                
            }, function(error) {
                notificationFactory.error("Something went wrong!");
                $log.log(error);
            
            });
    
    };

    // Close all open modals
    $scope.closeModal = function() {
        ngDialog.closeAll();
    };
    
});