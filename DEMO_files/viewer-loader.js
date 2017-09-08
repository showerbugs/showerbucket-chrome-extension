var PreziViewerModule = function(Module, onLoad, baseName, onError) {

  Module = Module || {};

  Module['sendLoadStatus'] = (function () {
    var chrono_now = undefined;
    if (typeof window['performance'] === 'object' && typeof window['performance']['now'] === 'function') {
      chrono_now = window['performance']['now'].bind(window['performance']);
    } else {
      chrono_now = Date.now;
    }

    var hostInterface = Module['hostInterface'];
    return function (status) {
      if (hostInterface && (typeof hostInterface.sendLog === 'function')) {
        hostInterface.sendLog("loading_status", "machine", {
          status: status,
          table: "loading_time",
          chrono_now: chrono_now()
        });
      }
    }
  })();

  function loadScript(src, onLoad) {
    var script = document.createElement('script');
    script.src = src;
    script.onload = onLoad;
    script.crossOrigin = 'anonymous';
    document.body.appendChild(script);
  }

  function loadEmscriptenScripts(asmjs, js, onLoad) {
    Module['sendLoadStatus']('viewer_download_start');
    loadScript(asmjs,
      function() {
        setTimeout(loadScript, 1, js, onLoad);
      }
    );
  }

  baseName = baseName || 'viewer';

  var asmjs = baseName + '.asm.js';
  var js = baseName + '.js';
  if (typeof Module['locateFile'] === 'function') {
    asmjs = Module['locateFile'](asmjs);
    js = Module['locateFile'](js);
  }

  loadEmscriptenScripts(asmjs, js, function() {
    if (typeof PreziViewerModuleInternal === 'function') {
        Module = PreziViewerModuleAsm(Module)
        var Viewer = PreziViewerModuleInternal(Module);

        Module['sendLoadStatus']('viewer_download_complete');

        if (typeof onLoad === 'function') {
          onLoad(Viewer);
        }
    } else if (typeof onError === 'function') {
        onError();
    }
  });
}
