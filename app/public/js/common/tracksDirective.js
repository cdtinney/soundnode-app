'use strict';

app.directive('tracks', function () {
    return {
        restrict: 'AE',
        scope: {
            data: '=',
            user: '=',
            type: '=',
            sharedPlaylistId: '='
        },
        templateUrl: "views/common/tracks.html"
    };
});