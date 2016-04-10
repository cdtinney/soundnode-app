app.controller('TrackCtrl', function (
    $scope,
    $rootScope,
    $stateParams,
    SCapiService,
    SNapiService,
    utilsService,
    notificationFactory
) {
    var songId = $stateParams.id;
    var sharedPlaylistId = $stateParams.sharedPlaylistId;
    $scope.hover = false;

    $scope.track = '';
    $scope.busy = false;
    $scope.sharedPlaylistUsers = undefined;

    SCapiService.get('tracks/' + songId)
        .then(function(data) {
            data.description = data.description.replace(/\n/g, '<br>');

            data.created_at = data.created_at.replace(' +0000', '');

            if (data.tag_list.length > 0) {
                data.tag_list = data.tag_list.match(/"[^"]*"|[^\s"]+/g);

                for (var i = 0; i < data.tag_list.length; ++i) {
                    data.tag_list[i] = data.tag_list[i].replace(/"/g, '');
                }
            } else {
                data.tag_list = [];
            }

            data.tag_list.unshift(data.genre);

            $scope.track = data;
        }, function(error) {
            console.log('error', error);
        }).finally(function() {
            $rootScope.isLoading = false;
            utilsService.setCurrent();
        });
        
    function getComments() {

        SCapiService.getComments(songId)
            .then(function(data) {
                $scope.comments = data.collection;
            }, function(error) {
                console.log('error', error);
            }).finally(function() {
                $rootScope.isLoading = false;
            });
    
    }    
    getComments();
   
    if (sharedPlaylistId !== undefined && sharedPlaylistId !== null) {
    
        SNapiService.users(sharedPlaylistId)
            .then(function(data) {
            
                $scope.sharedPlaylistUsers = {};
                for (var i=0; i<data.length; i++) {
                    var userId = parseInt(data[i].userId);
                    $scope.sharedPlaylistUsers[userId] = data[i];
                }
            
            }, function(error) {
                console.log('error', error);
                
            });
    
    }

    $scope.loadMore = function() {
        if ( $scope.busy ) {
            return;
        }
        $scope.busy = true;

        SCapiService.getNextPage()
            .then(function(data) {
                for ( var i = 0; i < data.collection.length; i++ ) {
                    $scope.comments.push( data.collection[i] )
                }
            }, function(error) {
                console.log('error', error);
            }).finally(function(){
                $scope.busy = false;
                $rootScope.isLoading = false;
                utilsService.setCurrent();
            });
    };
    
    $scope.postComment = function() {
        
        // TODO - sanitize input
        var body = $scope.newComment;
        if (body === undefined) {
            return;
        }
        
        // TODO - user input or current time (if playing)
        var timestamp = 0; 
        
        SCapiService.postComment(songId, body, timestamp)
            .then(function(response) {
            
                if ( typeof response === 'object' ) {
                    notificationFactory.success("Comment posted!");
                    
                    // Clear the search keyword, if present
                    $scope.keyword = undefined;
                    
                    // Update the comments
                    getComments();
                    
                }
                
            }, function(error) {
                notificationFactory.error("Something went wrong!");
                
            }).finally(function() {
                $scope.newComment = undefined;
            
            });
        
    };
    
    $scope.commentUserFilter = function(comment) {
    
        if ($scope.sharedPlaylistUsers === undefined || !$scope.sharedUsersOnly) return true;        
        return $scope.sharedPlaylistUsers[comment.user.id] !== undefined;
        
    };
    
    $scope.commentSearchFilter  = function(comment) {
    
        if ($scope.keyword === undefined || comment.body === undefined) {
            return true;
        }
        
        var keyword = $scope.keyword.toLowerCase();
        return comment.body.toLowerCase().indexOf($scope.keyword) != -1 ||
            comment.user.username === keyword;
        
    };

});

'use strict';
