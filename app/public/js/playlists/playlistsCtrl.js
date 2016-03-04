'use strict';

app.controller('PlaylistsCtrl', function (
    $scope,
    SCapiService,
    $rootScope,
    notificationFactory,
    modalFactory,
    utilsService,
) {
    var endpoint = 'me/playlists'
        , params = 'representation=compact';

    $scope.title = 'Playlists';
    $scope.data = '';

    SCapiService.get(endpoint, params)
        .then(function(data) {
            $scope.data = data;
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
            .confirm('Do you really want to delete the playlist?')
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
    
});