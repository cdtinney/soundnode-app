'use strict';

app.directive('playlistUsers', function ($rootScope, ngDialog, $log) {
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
                    controller: 'PlaylistUsersCtrl',
                    template: 'views/playlists/playlistUsers.html'
                });

            });
        }
    }
});