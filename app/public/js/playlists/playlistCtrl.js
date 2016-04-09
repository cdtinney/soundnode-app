'use strict';

app.controller('PlaylistCtrl', function (
    $scope,
    SCapiService,
    $rootScope,
    $log,
    $window,
    $http,
    $state,
    $stateParams,
    notificationFactory,
    modalFactory,
    utilsService,
    queueService
) {    

    var playlistId = $stateParams.id;
    var playlistTitle = $stateParams.title;
    
    $scope.title = 'Playlist' + (playlistTitle !== null ? (' - ' + playlistTitle) : '');
    $scope.data = '';
    $scope.isOwner = $stateParams.isOwner;
    $scope.shared = $stateParams.shared;
    
    SCapiService.get('me/playlists/' + playlistId)
        .then(function(data) {
            var l = data.tracks.length;
            while(l--) {
                if(!data.tracks[l].streamable) {
                    data.tracks.splice(l, 1);
                }
            }
            $scope.data = data;
        }, function(error) {
            console.log('error', error);
        }).finally(function(){
            $rootScope.isLoading = false;
            utilsService.setCurrent();
        });

    /**
     * Responsible to remove track from a particular playlist
     * @params songId [track id to be removed from the playlist]
     * @method removeFromPlaylist
     */
    $scope.removeFromPlaylist = function(songId) {
    
        var endpoint = 'users/'+  $rootScope.userId + '/playlists/'+ playlistId
            , params = '';

        SCapiService.get(endpoint, params)
            .then(function(response) {
                var uri = response.uri + '.json?&oauth_token=' + $window.scAccessToken
                    , tracks = response.tracks
                    , songIndex
                    , i = 0;

                // finding the track index
                for ( ; i < tracks.length ; i++ ) {
                    if ( songId == tracks[i].id ) {
                        songIndex = i;
                    }
                }

                // Removing the track from the tracks list
                tracks.splice(songIndex, 1);

                $http.put(uri, { "playlist": {
                    "tracks": tracks
                }
                }).then(function(response) {
                    notificationFactory.success("Song removed from playlist!");
                    
                }, function(response) {
                    notificationFactory.error("Something went wrong!");
                    $log.log(response);
                    return $q.reject(response.data);
                    
                }).finally(function() {

                    $('#' + songId).remove();

                    var inQueue = queueService.find(songId);
                    if ( inQueue ) {
                        queueService.remove(inQueue);
                    }
                    
                    $rootScope.isLoading = false;
                    
                })

            }, function(error) {
                console.log('error', error);
            });

    };
    
    $scope.removeTrack = function(trackId) {
    
        if ($scope.isOwner === "true") {
            $scope.removeFromPlaylist(trackId);
            
        } else {
            // TODO - remove request
            
        }
    
    };
    
});