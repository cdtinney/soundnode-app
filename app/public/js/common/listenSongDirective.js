"use strict";

app.directive('listenSong', function(
    $rootScope,
    $log,
    SNapiService,
    notificationFactory
) {
    return {
        restrict: 'A',
        scope: {
            listened: "="
        },
        link: function($scope, elem, attrs) {
            var userId, trackId, playlistId;

            elem.bind('click', function() {
                userId = $rootScope.userId;
                trackId = attrs.trackId;
                playlistId = attrs.playlistId;

                if ( this.classList.contains('listened') ) {
                
                    SNapiService.setTrackListened(trackId, playlistId, false)
                        .then(function(response) {
                            notificationFactory.success("Successfully marked as unlistened!");
                            $scope.listened = false;
                        
                        }, function(err) {
                            notificationFactory.error("Something went wrong!");
                            $log.log(err);
                        
                        });
                        
                } else {
                    
                    SNapiService.setTrackListened(trackId, playlistId, true)
                        .then(function(response) {
                            notificationFactory.success("Successfully marked as listened!");
                            $scope.listened = true;
                        
                        }, function(err) {
                            notificationFactory.error("Something went wrong!");
                            $log.log(err);
                        
                        });
                        
                }

            });
        }
    }
});