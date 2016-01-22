'use strict';

app.directive('filterTracks', function (
    utilsService
) {
    return {
        restrict: 'E',
        templateUrl: function(elem, attr){
            return "views/common/filter-tracks.html";
        },
        link : function (scope, element, attrs) {

            /**
             * Filter and return an new array of tracks
             * with duration higher than 30mins
             * @param obj [track data]
             * @returns {boolean}
             */
            function filterByTime(obj) {
                var minutesInMilliseconds = 1800000; // 30 minutes in milliseconds
                var duration = (obj.track !== undefined) ? obj.track.duration : obj.duration;

                return duration >= minutesInMilliseconds
            }

            /**
             * Filter and return an new array of tracks not reposted by user logged in
             * @param obj [track data]
             * @returns {boolean}
             */
            function filterByUserReposts(obj) {
                var userReposted = (obj.track !== undefined) ? obj.track.user_reposted : obj.user_reposted;

                return userReposted === false;
            }

            /**
             * Filter and return an new array of tracks not reposted by any user
             * @param obj [track data]
             * @returns {boolean}
             */
            function filterByAllReposts(obj) {
                var reposted = (obj !== undefined) ? obj.type === 'track-repost' : false;

                return reposted === false;
            }

            /**
             * Filter and return an new array of the tracks
             * with more than 10k plays
             * @param obj [track data]
             * @returns {boolean}
             */
            function filterByListens(obj) {
                var playbackCount = (obj.track !== undefined) ? obj.track.playback_count : obj.playback_count;

                return playbackCount > 10000;
            }
            
            /**
             * Filter and return a new array of the tracks that can be downloaded.
             * @param obj [track data]
             * @returns {boolean}
             */
            function filterByDownloads(obj) {
                var downloadable = (obj.track !== undefined) ? obj.track.downloadable : obj.downloadable;
                
                return downloadable === true;
            }

            /**
             * Filter tracks by time ( higher than 30 mins )
             * by reposted and by listens ( higher than 10k listens )
             */
            scope.filter = function() {

                scope.data = scope.originalData;

                if ( scope.time ) {
                    scope.data = scope.data.filter(filterByTime);
                }

                if ( scope.user_reposts ) {
                    scope.data = scope.data.filter(filterByUserReposts);
                }

                if ( scope.all_reposts ) {
                    scope.data = scope.data.filter(filterByAllReposts);
                }

                if ( scope.listens ) {
                    scope.data = scope.data.filter(filterByListens);
                }
                
                if ( scope.downloads ) {
                    scope.data = scope.data.filter(filterByDownloads);
                }

                utilsService.setCurrent();

            };

        }
    }
});