"use strict"

app.controller('PlaylistExportCtrl', function($scope, ngDialog, SCapiService) {

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
        
        // Fetch playlist tracks
        SCapiService.getPlaylist(playlist.id).then(function(data) {
        
            if (data === undefined) {
                console.log("Error - could retrieve playlist information - id: " + playlist.id);
                
            } else {
            
                if (exportFunctions[$scope.exportFormat]) {
                    var filename = filePrefix + "_" + data.title + extensions[$scope.exportFormat];
                    exportFunctions[$scope.exportFormat](data, filename, $scope.closeModal);
                }
                
            }
        
        
        });

    }
    
    /**
     * Saves playlist to file in plaintext, with track links included.
     * @param data [playlist to save]
     * @param filename [default filename]
     * @param callback [function to eval after completion)
     * @method exportPlaintextLinks
     */
    $scope.exportPlaintextLinks = function(data, filename, callback) {
        $scope.exportData($scope.formatTracks(data.tracks, true), 'text/plain', filename, callback);
    }
    
    /**
     * Saves playlist to file in plaintext.
     * @param data [playlist to save]
     * @param filename [default filename]
     * @param callback [function to eval after completion)
     * @method exportPlaintext
     */
    $scope.exportPlaintext = function(data, filename, callback) {
        $scope.exportData($scope.formatTracks(data.tracks, false), 'text/plain', filename, callback);
    }
    
    /**
     * Saves playlist to file in JSON (original) format.
     * @param data [playlist to save]
     * @param filename [default filename]
     * @param callback [function to eval after completion)
     * @method exportJson
     */
    $scope.exportJson = function (data, filename, callback) {
   
      if (typeof data === 'object') {
        data = JSON.stringify(data, undefined, 2);
      }
      
      $scope.exportData(data, 'text/json', filename, callback);
      
    };
    
    /**
     * Saves data to file.
     * @param data [data to save]
     * @param type [content type, either JSON or plain]
     * @param filename [default filename]
     * @param callback [function to eval after completion)
     * @method exportData
     */
    $scope.exportData = function(data, type, filename, callback) { 
    
        var blob = new Blob([data], {type: type}),
        e = document.createEvent('MouseEvents'),
        a = document.createElement('a');

        a.download = filename;
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = [type, a.download, a.href].join(':');
        e.initMouseEvent('click', true, false, window,
            0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(e);

        callback();
    
    }
    
    /**
    * Formats a list of tracks into a single string.
    * @param tracks [list of tracks, in JSON format]
    * @param link [if true, includes the permalink for each track]
    * @method formatTracks
    */
    $scope.formatTracks = function(tracks, link) {

      var str = "";
      for (var i=0; i<tracks.length; i++) {
        str += $scope.formatTrack(tracks[i], link) + "\n";
      }
      
      return str;
    
    }
    
    /**
    * Formats a track into a string.
    * @param track [single track, in JSON format]
    * @param link [if true, includes the permalink for the track]
    * @method formatTrack
    */
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