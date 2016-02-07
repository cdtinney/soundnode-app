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
        
            scope.sort = function() {

                scope.data = scope.originalData;

                /*if ( scope.length ) {
                    scope.data = scope.data.filter(filterByLength);
                }*/

                utilsService.setCurrent();

            };

        }
    }
});