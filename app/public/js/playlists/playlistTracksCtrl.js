"use strict"

app.controller('PlaylistTracksCtrl', function($rootScope, $scope, SCapiService, SC2apiService, SNapiService, $log, $window, $http, ngDialog, notificationFactory) {

    $scope.data = '';
    
    SNapiService.getTrackRequests($scope.playlistId)
        .then(function(data) {
            loadTracksInfo(data);
            
        }, function(error) {
            console.log("error " + error);
            
        });
        
    function loadTracksInfo(snData) {
    
        var ids = snData.map(function (obj) {
            return obj.trackId;
        });

        SC2apiService.getTracksByIds(ids)
            .then(function (data) {
            
                $scope.data = data;
                
                // Inject some Soundnode data into the collection for use by the templated view
                mergeTrackRequestInfo(snData, data);
                
            })
            .catch(function (error) {
                console.log('error', error);
            });
            
    }
    
    function mergeTrackRequestInfo(snData, data) {
        
        if (snData.length !== data.length) {
            $log.log("[mergeTrackRequestInfo] Soundnode track length != SoundCloud track length");
            return;
        }
        
        for (var i=0; i<snData.length; i++) {
        
            data[i].requestType = snData[i].requestType;
            
            /* TODO - fetch usernames */
            data[i].userId = snData[i].userId;
        
        }
    
    }
    
    $scope.approve = function(trackId, requestType) {
    
        SNapiService.acceptTrackRequest(trackId, $scope.playlistId)
            .then(function(data) {
            
                if (data == "1") {
                
                    // Add/remove to the actual SoundCloud playlist
                    // TODO - If this returns an error, there will be an inconsistency between our DB and the SC playlist
                    // (need to revert track request status back to pending, if this occurs)
                    
                    if (requestType === "add") {
                        $scope.saveToPlaylist(trackId, $scope.playlistId);   
                    
                    } else if (requestType === "remove") {
                        $scope.removeFromPlaylist(trackId, $scope.playlistId);   
                    
                    }                 
                    
                } else {
                    notificationFactory.error("Something went wrong!");
                    $log.log(data);                
                }
            
            }, function(error) {
                console.log("error " + error);
            
            })
            .finally(function() {
                ngDialog.closeAll();
                
            });
    
    }
    
    $scope.reject = function(trackId) {
    
        SNapiService.rejectTrackRequest(trackId, $scope.playlistId)
            .then(function(data) {
            
                if (data  == "1") {
                    notificationFactory.success("Successfully rejected track!");
                    
                } else {
                    notificationFactory.error("Something went wrong!");
                    $log.log(data);
                
                }
            
            }, function(error) {
                notificationFactory.error("Something went wrong!");
                console.log("error " + error);
            
            })
            .finally(function() {
                ngDialog.closeAll();
                
            });
            
    }
    
    /**
     * TODO - REFACTOR - This is duplicated across playlistTracksCtrl.js and playlistDashboardCtrl.js
     *
     * Responsible to add track to a particular playlist
     * @params trackId [track to be added]
     * @params playlistId [playlist id that contains the track]
     * @method saveToPlaylist
     */
    $scope.saveToPlaylist = function(trackId, playlistId) {
    
        var endpoint = 'users/'+  $rootScope.userId + '/playlists/'+ playlistId
            , params = '';

        SCapiService.get(endpoint, params)
            .then(function(response) {
                var track = {
                        "id": Number.parseInt(trackId)
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
     * TODO - REFACTOR - This is duplicated across playlistTracksCtrl.js and playlistCtrl.js
     *
     * Responsible to remove track from a particular playlist
     * @params trackId [track id to be removed from the playlist]
     * @method removeFromPlaylist
     */
    $scope.removeFromPlaylist = function(trackId, playlistId) {
    
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
                    notificationFactory.success("Song successfully removed from playlist!");
                    
                }, function(response) {
                    notificationFactory.error("Something went wrong!");
                    $log.log(response);
                    return $q.reject(response.data);
                    
                }).finally(function() {
                    $rootScope.isLoading = false;
                    
                })

            }, function(error) {
                console.log('error', error);
            });

    };

    /**
     * TODO - Move to common 
     *
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