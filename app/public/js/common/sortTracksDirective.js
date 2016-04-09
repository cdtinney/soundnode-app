'use strict';

app.directive('sortTracks', function (
    utilsService
) {
    return {
        restrict: 'E',
        templateUrl: function(elem, attr){
            return "views/common/sort-tracks.html";
        },
        link : function (scope, element, attrs) {
        
            var isPlaylist = attrs.isPlaylist;
        
            scope.sort = function() {

                if (isPlaylist == "true") {
                    scope.tracks = scope.data.tracks;
                    
                } else {
                    scope.data = scope.originalData;
                
                }

                utilsService.setCurrent();

            };

        }
    }
});