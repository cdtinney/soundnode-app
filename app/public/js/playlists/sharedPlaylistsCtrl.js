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
    
    $scope.fetchPlaylists = function() {
    
        /* Get shared playlist info from SoundNode servers */
        SNapiService.get()
            .then(function(snData) {
                    
                var defer = $q.defer();
                var promises = [];
                
                /* Fetch all of the playlist information/tracks from SC */
                var endpoint = "playlists";                    
                angular.forEach(snData, function(playlist) {
                    promises.push(SCapiService.getPublicPlaylist(playlist.playlistId));
                });
                
                $q.all(promises).then(function(data) {
                
                    $scope.data = data.filter(function(obj) {
                    
                        /* Add the isOwner attribute to each playlist */
                        for (var i=0; i<snData.length; i++) {
                        
                            if (snData[i].playlistId == obj.id) { 
                                obj.isOwner = snData[i].isOwner;
                                return true;
                            }
                            
                        }
                        
                        return false;
                        
                    });
                    
                }, function(error) {
                    console.log('error', error);                    
                });
            
            }, function(error) {
                console.log('error', error);
            })
            .finally(function() {
                $rootScope.isLoading = false;
                utilsService.setCurrent();            
            });
    
    };
    
    /* Initial query */
    $scope.fetchPlaylists();

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