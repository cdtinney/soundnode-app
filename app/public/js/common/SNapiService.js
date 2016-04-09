'use strict';

// Service to work with SoundNode server API
app.service('SNapiService', function (
    $rootScope,
    $window,
    $http,
    $q,
    SCapiService,
    modalFactory
) {

    /**
     * SoundNode Server API endpoint
     * @type {String}
     */
    var SOUNDNODE_API = "http://localhost:3000/"
    
    // Public API
    
    /**
    * Get all shared playlists for the user
    * @return {promise}
    */
    this.get = function() {
        
        var params = {
            userId: $rootScope.userId,
            userName: $rootScope.userName,
        };
    
        return get('get', { params : params })
            .then(onResponseSuccess)
            .catch(onResponseError);
    
    };
    
    /**
    * Get all shared playlists for the user, including SoundCloud data for each playlist (tracks, etc)
    * @return {promise}
    */
    this.getPlaylistData = function(callback) {
    
        this.get()
            .then(function(snData) {
                    
                var defer = $q.defer();
                var promises = [];
                
                /* Fetch all of the playlist information/tracks from SC */
                var endpoint = "playlists";                    
                angular.forEach(snData, function(playlist) {
                    promises.push(SCapiService.getPublicPlaylist(playlist.playlistId));
                });
                
                return $q.all(promises).then(function(data) {
                
                   var result = data.filter(function(obj) {
                    
                        /* Add the isOwner attribute to each playlist */
                        for (var i=0; i<snData.length; i++) {
                        
                            if (snData[i].playlistId == obj.id) { 
                                obj.isOwner = snData[i].isOwner;
                                return true;
                            }
                            
                        }
                        
                        return false;
                        
                    });
                    
                    callback(result);
                    
                }, function(error) {
                    console.log('error', error);
                    
                });
            
            }, function(error) {
                console.log('error', error);
            })
            .finally(function() {
                $rootScope.isLoading = false;
                utilsService.setCurrent();            
            });
    
    };
    
    /**
    * Get all users for a shared playlist
    * @return {promise}
    */
    this.users = function(playlistId) {
        
        var params = {
            playlistId: playlistId
        };
    
        return get('users', { params : params })
            .then(onResponseSuccess)
            .catch(onResponseError);
            
    };

    /**
     * Set playlist to shared
     * @return {promise}
     */
    this.share = function(playlistId) {
        
        var params = {
            userId: $rootScope.userId,
            userName: $rootScope.userName,
            playlistId: playlistId
        };
    
        return post('share', { params : params })
            .then(onResponseSuccess)
            .catch(onResponseError);
    
    };     
    
    /**
    * Set playlist to unshared
    * @return {promise}
    */
    this.unshare = function(playlistId) {
        
        var params = {
            userId: $rootScope.userId,
            userName: $rootScope.userName,
            playlistId: playlistId
        };
    
        return post('unshare', { params : params })
            .then(onResponseSuccess)
            .catch(onResponseError);
    
    };
    
    /** 
    * Gets all pending track requests for a playlist
    * @return {promise}
    */
    this.getTrackRequests = function(playlistId) {
        
        var params = {
            userId: $rootScope.userId,
            playlistId: playlistId
        };
    
        return get('playlists/tracks', { params : params })
            .then(onResponseSuccess)
            .catch(onResponseError);  
    
    };
    
    /** 
    * Accepts a track request made by a user
    * @return {promise}
    */
    this.acceptTrackRequest = function(trackId, playlistId) {
        return changeTrackRequestStatus(trackId, playlistId, "accept");
    };
    
    /** 
    * Rejects a track request made by a user
    * @return {promise}
    */
    this.rejectTrackRequest = function(trackId, playlistId) {
        return changeTrackRequestStatus(trackId, playlistId, "reject");
    };
    
    /** 
    * Updates the status of a track request (pending/accept/reject).
    * @return {promise}
    */
    function changeTrackRequestStatus(trackId, playlistId, status) {
    
        var params = {
            userId: $rootScope.userId,
            trackId: trackId,
            playlistId: playlistId,
            status: status
        };
        
        return post('playlists/tracks/status', { params : params })
            .then(onResponseSuccess)
            .catch(onResponseError);  
    
    };
    
    /** 
    * Gets all tracks listened by the user within a specific playlist
    * @return {promise}
    */
    this.getTracksListened = function(playlistId) {
    
        var params = {
            userId: $rootScope.userId,
            playlistId: playlistId
        };
        
        return get('playlists/tracks/listen', { params : params })
            .then(onResponseSuccess)
            .catch(onResponseError);  
            
    };
    
    /** 
    * Sets a track's listened status.
    * @return {promise}
    */
    this.setTrackListened = function(trackId, playlistId, listened) {
    
        var params = {
            userId: $rootScope.userId,
            trackId: trackId,
            playlistId: playlistId,
            listened: listened
        };
        
        return post('playlists/tracks/listen', { params : params })
            .then(onResponseSuccess)
            .catch(onResponseError);  
            
    };
    
    /** 
    * Adds a track to a playlist not owned by the user, via a request.
    * @return {promise}
    */
    this.addTrackToPlaylist = function(trackId, playlistId) {
    
        var params = {
            userId: $rootScope.userId,
            trackId: trackId,
            playlistId: playlistId
        };
        
        return post('playlists/tracks/add', { params : params })
            .then(onResponseSuccess)
            .catch(onResponseError);  
            
    };
    
    /** 
    * Removes a track to a playlist not owned by the user, via a request.
    * @return {promise}
    */
    this.removeTrackFromPlaylist = function(trackId, playlistId) {
    
        var params = {
            userId: $rootScope.userId,
            trackId: trackId,
            playlistId: playlistId
        };
        
        return post('playlists/tracks/remove', { params : params })
            .then(onResponseSuccess)
            .catch(onResponseError);  
            
    };
    
    /** 
    * Adds a user to a playlist 
    * @return {promise}
    */
    this.addUserToPlaylist = function(userId, userName, playlistId) {
        
        var params = {
            userId: userId,
            userName: userName,
            playlistId: playlistId
        };
    
        return post('playlists/users/add', { params : params })
            .then(onResponseSuccess)
            .catch(onResponseError);
            
    };
    
    /**
    * Removes a user from a playlist
    * @return {promise}
    */
    this.removeUserFromPlaylist = function(userId, playlistId) {
        
        var params = {
            userId: userId,
            playlistId: playlistId
        };
    
        return httpDelete('playlists/users', { params : params })
            .then(onResponseSuccess)
            .catch(onResponseError);
    
    
    };

    // Private methods
    
    /**
    * Utility method to send an HTTP GET request
    * TODO - add params
    */
    function get(resource, config, options) {    
        config = config || {};
        config.method = "GET";
        return sendRequest(resource, config, options);        
    }
    
    /**
    * Utility method to send an HTTP POST request
    * TODO - add params
    */
    function post(resource, config, options) {    
        config = config || {};
        config.method = "POST";
        return sendRequest(resource, config, options);        
    }
    
    /**
    * Utility method to send an HTTP DELETE request
    * TODO - add params
    */
    function httpDelete(resource, config, options) {    
        config = config || {};
        config.method = "DELETE";
        return sendRequest(resource, config, options);        
    }


    /**
     * Utility method to send http request
     * @param  {resource} resource - url part with resource name
     * @param  {object} config   - options for $http
     * @param  {object} options  - custom options (show loading, etc)
     * @return {promise}
     */
    function sendRequest(resource, config, options) {
        config = config || {};
        
        // Check if passed absolute url
        if (resource.indexOf('http') === 0) {
            config.url = resource;
        } else {
            config.url = SOUNDNODE_API + resource;
        }
        
        config.params = config.params || {};
        options = options || {};
        return $http(config);
    }

    /**
     * Response success handler
     * @param  {object} response - $http response object
     * @return {object}          - response data
     */
    function onResponseSuccess(response) {
        if (response.status !== 200) {
            return $q.reject(response.data);
        }
        return response.data;
    }

    /**
     * Response error handler
     * @param  {object} response - $http response object
     * @return {promise}
     */
    function onResponseError(response) {
        if (response.status === 429) {
            modalFactory.rateLimitReached();
        }
        return $q.reject(response.data);
    }

});
