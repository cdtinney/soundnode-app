"use strict"

app.controller('PlaylistTracksCtrl', function($rootScope, $scope, SCapiService, SC2apiService, SNapiService, $log, $window, $http, ngDialog, notificationFactory) {

    $scope.data = '';
    
    SNapiService.getTrackRequests($scope.playlistId)
        .then(function(data) {
            loadTracksInfo(data);
            
        }, function(error) {
            console.log("error " + error);
            
        });
        
    function loadTracksInfo(collection) {
    
        var ids = collection.map(function (obj) {
            return obj.trackId;
        });

        SC2apiService.getTracksByIds(ids)
            .then(function (data) {
                $scope.data = data;
            })
            .catch(function (error) {
                console.log('error', error);
            });
            
    }
    
    $scope.approve = function(trackId) {
    
        SNapiService.acceptTrackRequest(trackId, $scope.playlistId)
            .then(function(data) {
            
                if (data == "1") {
                
                    // Add to the actual SoundCloud playlist
                    // TODO - If this returns an error, there will be an inconsistency between our DB and the SC playlist
                    // (need to revert track request status back to pending, if this occurs)
                    $scope.saveToPlaylist(trackId, $scope.playlistId);                    
                    
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
     * TODO - This is duplicated across playlistTracksCtrl.js and playlistDashboardCtrl.js
     *
     * Responsible to add track to a particular playlist
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