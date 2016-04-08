'use strict';

app.controller('SharedPlaylistsCtrl', function (
    $scope,
    $rootScope,
    $q,
    SCapiService,
    SNapiService,
    notificationFactory,
    modalFactory,
    utilsService
) {

    $scope.title = 'Shared Playlists';
    $scope.data = '';
    
    SNapiService.getPlaylistData(function(data) {
        $scope.data = data;
    });

    /**
     * Delete entire playlist.
     * @params playlistId [playlist id]
     * @method remove
     */
    $scope.remove = function(playlistId) {
        modalFactory
            .confirm('Are you sure? Deleting is forever – you won’t be able to get this playlist back.')
            .then(function () {
                SCapiService.removePlaylist(playlistId)
                    .then(function(response) {
                        if ( typeof response === 'object' ) {
                            notificationFactory.success("Playlist removed!");
                        }
                    }, function(error) {
                        notificationFactory.error("Something went wrong!");
                    })
                    .finally(function() {
                        $('#' + playlistId).remove();
                    });
            });
    };
    
    /**
     * Stop sharing a playlist.
     * @params playlistId [playlist id]
     * @method unshare
     */
    $scope.unshare = function(playlistId) {
        modalFactory
            .confirm('Are you sure you want to unshare this playlist? Collaborators will no longer be able to access it.')
            .then(function () {
                SNapiService.unshare(playlistId)
                    .then(function(response) {
                        if ( typeof response === 'object' ) {
                            notificationFactory.success("Playlist unshared!");                            
                            $('#' + playlistId).remove();
                        }
                    }, function(error) {
                        notificationFactory.error("Something went wrong!");
                    });
            });
    };
    
});