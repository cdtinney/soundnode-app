'use strict';

app.controller('PlaylistCtrl', function (
    $scope,
    $rootScope,
    $log,
    $window,
    $http,
    $state,
    $stateParams,
    notificationFactory,
    modalFactory,
    utilsService,
    queueService,
    SCapiService,
    SNapiService
) {    

    var playlistId = $stateParams.id;
    var playlistTitle = $stateParams.title;
    
    $scope.title = 'Playlist' + (playlistTitle !== null ? (' - ' + playlistTitle) : '');
    $scope.data = '';
    $scope.tracks = '';
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
            $scope.tracks = data.tracks;
        }, function(error) {
            console.log('error', error);
        }).finally(function(){
            $rootScope.isLoading = false;
            utilsService.setCurrent();
        });

    /**
     * Responsible to remove track from a particular playlist
     * @params trackId [track id to be removed from the playlist]
     * @method removeFromPlaylist
     */
    $scope.removeFromPlaylist = function(trackId) {
    
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
                    if ( trackId == tracks[i].id ) {
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

                    $('#' + trackId).remove();

                    var inQueue = queueService.find(trackId);
                    if ( inQueue ) {
                        queueService.remove(inQueue);
                    }
                    
                    $rootScope.isLoading = false;
                    
                })

            }, function(error) {
                console.log('error', error);
            });

    };
    
    /**
     * Responsible to remove track from a particular shared playlist that the user does not own. 
     *  A track remove request is sent to the Soundnode server. 
     * @params trackId [track id to be removed from the playlist]
     * @method removeFromPlaylist
     */
    $scope.removeTrackRequest = function(trackId) {
        
        SNapiService.removeTrackFromPlaylist(trackId, playlistId)
            .then(function(data) {
                notificationFactory.success("Successfully created remove request!");
                /* TODO - display 'pending' on remove control, so user doesn't hit it multiple times */
            
            }, function(err) {
                notificationFactory.error("Something went wrong!");
                $log.log(response);
            
            });
    
    };
    
});