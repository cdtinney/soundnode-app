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

    $scope.playlistId = $stateParams.id;
    $scope.playlistTitle = $stateParams.title;
    
    $scope.title = 'Playlist' + ($scope.playlistTitle !== null ? (' - ' + $scope.playlistTitle) : '');
    $scope.data = '';
    $scope.tracks = '';
    $scope.isOwner = $stateParams.isOwner;
    $scope.shared = $stateParams.shared;
    $scope.isPlaylist = true;
    
    SCapiService.get('me/playlists/' + $scope.playlistId)
        .then(function(data) {
        
            var l = data.tracks.length;
            while(l--) {
                if(!data.tracks[l].streamable) {
                    data.tracks.splice(l, 1);
                }
            }
            
            if ($scope.shared) {
                setListenedTracks(data);
                
            } else {
                setData(data);
            
            }
            
        }, function(error) {
            console.log('error', error);
            
        }).finally(function(){
            
            if (!$scope.shared) {
                $rootScope.isLoading = false;
            }
        
            utilsService.setCurrent();
            
        });
        
    function setListenedTracks(data) {
            
        SNapiService.getTracksListened($scope.playlistId)
            .then(function(snData) {
    
                for (var j=0; j<data.tracks.length; j++) {
                    var track = data.tracks[j];
                    track.listened = false;
                    
                    for (var i=0; i<snData.length; i++) {
                    
                        if (track.id == parseInt(snData[i].trackId)) {
                            track.listened = (snData[i].listened == 'true');
                            break;
                        }
                    }
                    
                }
                
                setData(data);
    
            }, function(error) {
                console.log('error', error);
            
            })
            .finally(function() {
                $rootScope.isLoading = false;
            });
    
    
    }
    
    function setData(data) {
        
        $scope.data = data;
        $scope.tracks = data.tracks;
        utilsService.updateTracksLikes(data.tracks, true);
        utilsService.updateTracksReposts(data.tracks, true);    
        
    }

    /**
     * Responsible to remove track from a particular playlist
     * @params trackId [track id to be removed from the playlist]
     * @method removeFromPlaylist
     */
    $scope.removeFromPlaylist = function(trackId) {
    
        var endpoint = 'users/'+  $rootScope.userId + '/playlists/'+ $scope.playlistId
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
        
        SNapiService.removeTrackFromPlaylist(trackId, $scope.playlistId)
            .then(function(data) {
                notificationFactory.success("Successfully created remove request!");
                /* TODO - display 'pending' on remove control, so user doesn't hit it multiple times */
            
            }, function(err) {
                notificationFactory.error("Something went wrong!");
                $log.log(response);
            
            });
    
    };
     
});