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
    var endpoint = 'me/playlists'
        , params = 'representation=compact';

    $scope.title = 'Shared Playlists';
    $scope.data = '';
    
    SCapiService.get(endpoint, params)
        .then(function(data) {
    
            SNapiService.get()
                .then(function(snData) {
                    
                    $scope.data = data.filter(function(obj) {
                    
                        for (var i=0; i<snData.length; i++) {
                            if (snData[i].playlistId == obj.id) return true;
                        }
                        
                        return false;
                        
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