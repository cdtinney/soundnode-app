"use strict"

app.controller('PlaylistExportCtrl', function($scope, ngDialog) {

    /**
    * Exports a playlist to file
    * @method exportPlaylist
    */
    $scope.exportPlaylist = function() {

        var exportMap = {
            'json' : $scope.exportAsJSON
        };
        
        var playlist = $scope.data;
        if (playlist === null) {
            return;
        }
  
        if (exportMap[$scope.exportFormat]) {
            exportMap[$scope.exportFormat](playlist, playlist.title, $scope.closeModal);
        }
        
    }
    
    /**
     * Saves an object to file in JSON format. (taken from: http://stackoverflow.com/questions/30443238/save-json-to-file-in-angularjs)
     * @param data [data to save]
     * @param title [title of the playlist]
     * @method exportAsJSON
     */
    $scope.exportAsJSON = function (data, title, callback) {

      if (!data) {
        return;
      }

      var filename = "SoundCloud_" + title + ".json";      
      if (typeof data === 'object') {
        data = JSON.stringify(data, undefined, 2);
      }

      var blob = new Blob([data], {type: 'text/json'}),
        e = document.createEvent('MouseEvents'),
        a = document.createElement('a');

      a.download = filename;
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
      e.initMouseEvent('click', true, false, window,
          0, 0, 0, 0, 0, false, false, false, false, 0, null);
      a.dispatchEvent(e);
      
      callback();
      
    };
    
    $scope.confirm = function() {
        $scope.exportPlaylist();
    }
    
    $scope.closeModal = function() {
        ngDialog.closeAll();
    };
    
});