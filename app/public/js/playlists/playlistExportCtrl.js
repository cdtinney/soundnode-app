"use strict"

app.controller('PlaylistExportCtrl', function($scope, ngDialog) {

    /**
    * Exports a playlist to file.
    * @method exportPlaylist
    */
    $scope.exportPlaylist = function() {

        var filePrefix = "SoundNode";
        var exportFunctions = {
            'json' : $scope.exportJson,
            'plaintext' : $scope.exportPlaintext,
            'plaintextLinks' : $scope.exportPlaintextLinks
        };
        var extensions = {
            'json' : '.json',
            'plaintext' : '.txt',
            'plaintextLinks' : '.txt'
        }
        
        var playlist = $scope.data;
        if (playlist === null) {
            return;
        }
  
        if (exportFunctions[$scope.exportFormat]) {
            var filename = filePrefix + "_" + playlist.title + extensions[$scope.exportFormat];
            exportFunctions[$scope.exportFormat](playlist, filename, $scope.closeModal);
        }

    }
    
    $scope.exportPlaintextLinks = function(data, filename, callback) {
        $scope.exportData($scope.formatTracks(data.tracks, true), 'text/plain', filename, callback);
    }
    
    $scope.exportPlaintext = function(data, filename, callback) {
        $scope.exportData($scope.formatTracks(data.tracks, false), 'text/plain', filename, callback);
    }
    
    /**
     * Saves an object to file in JSON format. (taken from: http://stackoverflow.com/questions/30443238/save-json-to-file-in-angularjs)
     * @param data [data to save]
     * @param filename [default filename]
     * @method exportJson
     */
    $scope.exportJson = function (data, filename, callback) {
   
      if (typeof data === 'object') {
        data = JSON.stringify(data, undefined, 2);
      }
      
      $scope.exportData(data, 'text/json', filename, callback);
      
    };
    
    $scope.exportData = function(data, type, filename, callback) { 
    
        var blob = new Blob([data], {type: type}),
        e = document.createEvent('MouseEvents'),
        a = document.createElement('a');

        a.download = filename;
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':');
        e.initMouseEvent('click', true, false, window,
            0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(e);

        callback();
    
    }
    
    $scope.formatTracks = function(tracks, link) {

      var str = "";
      for (var i=0; i<tracks.length; i++) {
        str += $scope.formatTrack(tracks[i], link) + "\n";
      }
      
      return str;
    
    }
    
    $scope.formatTrack = function(track, link) {
    
        var str = track.user.username + " -- " + track.title
        if (link) str += " [" + track.permalink_url + "]";   
        return str;
        
    }
    
    $scope.confirm = function() {
        $scope.exportPlaylist();
    }
    
    $scope.closeModal = function() {
        ngDialog.closeAll();
    };
    
});