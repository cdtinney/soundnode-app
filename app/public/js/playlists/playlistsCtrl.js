'use strict';

app.controller('PlaylistsCtrl', function (
    $scope,
    SCapiService,
    SNapiService,
    $rootScope,
    notificationFactory,
    modalFactory,
    utilsService
) {
    var endpoint = 'me/playlists'
        , params = 'representation=compact';

    $scope.title = 'Playlists';
    $scope.data = '';
    
    SCapiService.get(endpoint, params)
        .then(function(data) {
    
            SNapiService.getPlaylists()
                .then(function(snData) {
                    
                    $scope.data = data.filter(function(obj) {
                    
                        for (var i=0; i<snData.length; i++) {
                            if (snData[i].playlistId == obj.id) return false;
                        }
                        
                        return true;
                        
                    });
                
                }, function(error) {
                    console.log('error', error);
                });
                
        }, function(error) {
            console.log('error', error);
        }).finally(function(){
            $rootScope.isLoading = false;
            utilsService.setCurrent();
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
    
        SNapiService.sharePlaylist(playlistId)
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