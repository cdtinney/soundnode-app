'use strict';

app.controller('SharedPlaylistsCtrl', function (
    $scope,
    SCapiService,
    SNapiService,
    $rootScope,
    notificationFactory,
    modalFactory,
    utilsService
) {

    $scope.title = 'Shared Playlists';
    $scope.data = '';
    
    SNapiService.getPlaylists($rootScope.userId)
        .then(function(data) {
            console.log(data);
            // TODO - Get SC playlist information
        }, function(error) {
            console.log('Unable to load shared playlists - ', error);
        });

    /**
     * Responsible to delete entire playlist
     * @params playlistId [playlist id]
     * @method removePlaylist
     */
    $scope.removePlaylist = function(playlistId) {
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
    * Converts a regular playlist into a shared playlist.
    * @params playlistID [the ID of the playlist to convert]
    * @method sharePlaylist
    */
    $scope.sharePlaylist = function(playlistId) {
    
        SNapiService.sharePlaylist($rootScope.userId, playlistId)
            .then(function(response) {
                if ( typeof response === 'object' ) {
                    notificationFactory.success("Playlist shared!");
                        $('#' + playlistId).remove();
                }
            }, function(error) {
                notificationFactory.error("Something went wrong!");
            });
            
    };
    
});