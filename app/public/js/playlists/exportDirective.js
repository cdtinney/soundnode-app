'use strict';

app.directive('export', function ($rootScope, ngDialog, $log) {
    return {
        restrict: 'A',
        link: function ($scope, elem, attrs) {

            elem.bind('click', function () {

                ngDialog.open({
                    showClose: false,
                    scope: $scope,
                    controller: 'PlaylistExportCtrl',
                    template: 'views/playlists/playlistExport.html'
                });

            });
        }
    }
});