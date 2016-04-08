'use strict';

app.directive('playlistTracks', function ($rootScope, ngDialog, $log) {
    return {
        restrict: 'A',
        link: function ($scope, elem, attrs) {
            $scope.playlistId = '';
            $scope.playlistTitle = '';

            elem.bind('click', function () {
                $scope.playlistId = attrs.playlistId;
                $scope.playlistTitle = attrs.playlistTitle;

                ngDialog.open({
                    showClose: false,
                    scope: $scope,
                    controller: 'PlaylistTracksCtrl',
                    template: 'views/playlists/playlistTracks.html'
                });

            });
        }
    }
});