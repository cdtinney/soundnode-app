'use strict';

// Service to work with SoundNode server API
app.service('SNapiService', function (
    $rootScope,
    $window,
    $http,
    $q,
    modalFactory
) {

    /**
     * SoundNode Server API endpoint
     * @type {String}
     */
    var SOUNDNODE_API = "http://localhost:9000/";
    
    // Public API

    /**
     * Set playlist as shared
     * @return {promise}
     */
    this.sharePlaylist = function (playlistId) {
        
        var params = {
            id: playlistId
        };
    
        return postRequest('sharePlaylist', { params : params })
            .then(onResponseSuccess)
            .catch(onResponseError);
    
    };     

    // Private methods
    
    /**
    * Utility method to send HTTP post request
    * TODO - add params
    */
    function postRequest(resource, config, options) {
    
        config = config || {};
        config.method = "POST";
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
        if (options.loading !== false) {
            $rootScope.isLoading = true;
        }

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
