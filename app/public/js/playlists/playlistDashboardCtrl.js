"use strict"

app.controller('PlaylistDashboardCtrl', function($rootScope, $scope, SCapiService, SNapiService, $log, $window, $http, ngDialog, notificationFactory) {
    var endpoint = 'me/playlists'
        , params = '';

    $scope.data = '';
    $scope.snData = '';

    SCapiService.get(endpoint, params)
        .then(function(data) {
            $scope.data = data;
        
            SNapiService.getPlaylistData(function(snData) {
            
                /* Remove shared playlists from regular playlist array */
                $scope.data = data.filter(function(obj) {
                    for (var i=0; i<snData.length; i++) {
                        if (snData[i].id == obj.id) { 
                            return false;
                        }
                    }            
                    
                    return true;            
                
                });
                
                $scope.snData = snData;
                
            });
            
        }, function(error) {
            $log.log('error', error);
        }).finally(function() {
            $rootScope.isLoading = false;
        });

    /**
     * Responsible to add track to a particular playlist
     * @params playlistId [playlist id that contains the track]
     * @method saveToPlaylist
     */
    $scope.saveToPlaylist = function(playlistId) {
        var endpoint = 'users/'+  $rootScope.userId + '/playlists/'+ playlistId
            , params = '';

        SCapiService.get(endpoint, params)
            .then(function(response) {
                var track = {
                        "id": Number.parseInt($scope.playlistSongId)
                    }
                    , uri = response.uri + '.json?&oauth_token=' + $window.scAccessToken
                    , tracks = response.tracks;

                tracks.push(track);

                $http.put(uri, { "playlist": {
                        "tracks": tracks
                    }
                }).then(function(response, status) {
                    notificationFactory.success("Song added to playlist!");
                }, function(error) {
                    notificationFactory.error("Something went wrong!");
                    $log.log(response);
                    return $q.reject(response.data);
                }).finally(function() {
                    ngDialog.closeAll();
                })

            }, function(error) {
                notificationFactory.error("Something went wrong!");
            });

    };

    /**
     * Responsible to create a new playlist
     * and save the selected song
     * @method createPlaylistAndSaveSong
     */
    $scope.createPlaylistAndSaveSong = function() {
        SCapiService.createPlaylist($scope.playlistName)
            .then(function(response, status) {
                $scope.saveToPlaylist(response.id);
                notificationFactory.success("New playlist created!");
            }, function(response) {
                notificationFactory.error("Something went wrong!");
                $log.log(response);
            })
            .finally(function() {
                ngDialog.closeAll();
            });
    };
    
    $scope.saveToSharedPlaylist = function(playlistId, isOwner) {
    
        if (isOwner) {
            $scope.saveToPlaylist(playlistId);
        
        } else {
            
            var trackId = Number.parseInt($scope.playlistSongId);
            SNapiService.addTrackToPlaylist(trackId, playlistId)
                .then(function(data) {
                    notificationFactory.success("Track request created for shared playlist!");
                }, function(error) {
                    notificationFactory.error("Something went wrong!");
                })
                .finally(function() {
                    ngDialog.closeAll();
                });
        
        }
    
    };

    // Format song duration on tracks
    // for human reading
    $scope.formatSongDuration = function(duration) {
        var minutes = Math.floor(duration / 60000)
            , seconds = ((duration % 60000) / 1000).toFixed(0);

        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    };

    // Close all open modals
    $scope.closeModal = function() {
        ngDialog.closeAll();
    };

    /**
     * Responsible to check if there's a artwork
     * otherwise replace with default badge
     * @param thumb [ track artwork ]
     */
    $scope.checkForPlaceholder = function (thumb) {
        var newSize;

        if ( thumb === null ) {
            return 'public/img/logo-badge.png';
        } else {
            newSize = thumb.replace('large', 'badge');
            return newSize;
        }
    }
});