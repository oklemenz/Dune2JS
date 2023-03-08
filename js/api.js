// Generated by CoffeeScript 1.8.0
Epicport.API = (function() {
  function API(options) {
    var Module, progress, self, status;
    self = this;
    this.canvas = new Epicport.Canvas(options);
    this.game = options.game;
    this.audio = new Audio();
    this.audio.volume = 0.5;
    this.files = [];
    status = document.getElementById("status");
    progress = $("#progress");
    progress.progressbar({
      value: 0
    });
    Module = {
      "arguments": options["arguments"],
      screenIsReadOnly: true,
      preRun: [
        function() {
          if (options.preRun) {
            options.preRun();
          }
          return Epicport.API.createFs();
        }
      ],
      postRun: [],
      print: (function() {
        return function(text) {
          return console.log(text);
        };
      })(),
      printErr: function(text) {
        text = Array.prototype.slice.call(arguments).join(" ");
        return console.log(text);
      },
      canvas: this.canvas.el(),
      setStatus: function(text) {
        var m;
        if (Module.setStatus.interval) {
          clearInterval(Module.setStatus.interval);
        }
        m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
        if (m) {
          text = m[1];
          Epicport.API.progress(parseInt(m[2]) * 100, parseInt(m[4]) * 100);
        }
        status.innerHTML = text;
        if (text === '') {
          return self.canvas.hideOverlay();
        }
      },
      totalDependencies: 0,
      monitorRunDependencies: function(left) {
        this.totalDependencies = Math.max(this.totalDependencies, left);
        return Module.setStatus((left ? "Preparing... (" + (this.totalDependencies - left) + "/" + this.totalDependencies + ")" : "All downloads complete."));
      }
    };
    Module.setStatus("Loading...");
    this.Module = Module;
  }

  API.prototype.progress = function(value, max) {
    var progress;
    progress = $("#progress");
    progress.progressbar("option", "value", value);
    return progress.progressbar("option", "max", max);
  };

  API.prototype.module = function() {
    return this.Module;
  };

  API.prototype.canSave = function() {
    if (Epicport.profile) {
      return true;
    }
    Epicport.login({
      callback: function() {
        if (Epicport.profile) {
          Epicport.API.createFs();
          return Epicport.modalMessage(Epicport.i18n.html_login_success_title, Epicport.i18n.html_can_save_desc);
        }
      }
    });
    return false;
  };

  API.prototype.canLoad = function() {
    if (Epicport.profile) {
      return true;
    }
    Epicport.login({
      callback: function() {
        if (Epicport.profile) {
          Epicport.API.createFs();
          return Epicport.modalMessage(Epicport.i18n.html_login_success_title, Epicport.i18n.html_can_load_desc);
        }
      }
    });
    return false;
  };

  API.prototype.selectLoadFileDialog = function(extensionPtr, callback, hideFileInputField) {
    return Epicport.API.selectFileDialog(extensionPtr, callback, true);
  };

  API.prototype.selectSaveFileDialog = function(extensionPtr, callback, hideFileInputField) {
    return Epicport.API.selectFileDialog(extensionPtr, callback, false);
  };

  API.prototype.selectFileDialog = function(extensionPtr, callback, hideFileInputField) {
    var buttons, cancelButton, extension, file, filename, files, okButton, success, _i, _len;
    extension = Module['Pointer_stringify'](extensionPtr);
    if (hideFileInputField) {
      $('.select-file-input').hide();
    } else {
      $('.select-file-input').show();
    }
    $('#select-file-dialog-file').val("");
    files = Epicport.API.files;
    if (files.length) {
      $(".select-file-dialog ul").empty();
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i].name;
        filename = file.substring(file.lastIndexOf('/') + 1);
        $(".select-file-dialog ul").append("<li>" + filename + "</li>");
      }
    }
    $(".select-file-dialog ul > li").off('click');
    $(".select-file-dialog ul > li").click(function(e) {
      success($(e.target).html());
      return $(".select-file-dialog").dialog('close');
    });
    if (!(typeof Module === 'undefined')) {
      Module['disable_sdl_envents'] = true;
    }
    success = function(filename) {
      function processFile(error) {
        if (error) {
          return;
        }
        if (!Epicport.API.selectFileDialogPtr) {
          Epicport.API.selectFileDialogPtr = Module['_malloc'](128);
        }
        if (!(typeof Module === 'undefined')) {
          Module['disable_sdl_envents'] = false;
        }
        try {
          Module['writeStringToMemory'](filename, Epicport.API.selectFileDialogPtr);
          Module['dunCall']('vi', callback, [Epicport.API.selectFileDialogPtr]);
        } catch (error) {
          if (error) {
            Epicport.modalMessage(Epicport.i18n.html_error, Epicport.i18n.html_game_load_error);
          }
        }
      }
      var file = files.find(file => file.name.endsWith("/" + filename));
      if (file) {
        if (file.house) {
          API.prototype.houseArgument(file && file.house);
        }
        if (!file.loaded) {
          Epicport.API.loadFiles([file], processFile);
          return;
        }
      }
      processFile();
    };
    okButton = {
      text: Epicport.i18n.html_ok,
      click: function() {
        var selected;
        selected = $('#select-file-dialog-file').val() || "";
        selected = selected.replace(/[^\w]/gi, "");
        if (selected) {
          success(selected + "." + extension);
          return $(this).dialog("close");
        } else {
          $('#select-file-dialog-file').focus();
        }
      }
    };
    cancelButton = {
      text: Epicport.i18n.html_cancel,
      click: function() {
        $(this).dialog("close");
        if (!(typeof Module === 'undefined')) {
          return Module['disable_sdl_envents'] = false;
        }
      }
    };
    if (hideFileInputField) {
      buttons = [cancelButton];
    } else {
      buttons = [okButton, cancelButton];
    }
    return $(".select-file-dialog").dialog({
      appendTo: ".game",
      width: 650,
      modal: true,
      draggable: false,
      resizeable: false,
      buttons: buttons,
      closeText: "",
      close: function() {
        if (!(typeof Module === 'undefined')) {
          return Module['disable_sdl_envents'] = false;
        }
      }
    });
  };

  API.prototype.autoSave = function() {
    try {
      if (Epicport.profile.identity === "public") {
        return;
      }
      if (!Epicport.API.selectFileDialogPtr) {
        Epicport.API.selectFileDialogPtr = Module['_malloc'](128);
      }
      Module['writeStringToMemory'](Epicport.i18n.html_autosave, Epicport.API.selectFileDialogPtr);
      Module['dunCall']('vi', 4, [Epicport.API.selectFileDialogPtr]);
    } catch(err) {}
  }

  API.prototype.pushSave = function(filePtr) {
    var contents, done, file, fs_object, overwrite;
    done = Epicport.modalProgress();
    file = Module['Pointer_stringify'](filePtr);
    if (Module['FS_findObject']) {
      fs_object = Module['FS_findObject'](file);
    } else {
      fs_object = FS.findObject(file);
    }
    contents = fs_object.contents;
    var houseName = Epicport.API.houseName();
    var fileName = file.split("/").pop().split(".")[0];
    var { db, ts, ref, get, set, push } = firebase;
    const gameStateRef = ref(db, `gameState/${Epicport.profile.identity}/${fileName}`);
    get(gameStateRef).then((snapshot) => {
      const data = {
        profile: Epicport.profile.identity,
        name: fileName,
        house: houseName,
        content: btoa(String.fromCharCode.apply(null, new Uint8Array(contents))),
        timestamp: ts(),
      };
      let dataKey;
      if (snapshot.exists()) {
        if (snapshot.val().protected) {
          return Epicport.modalMessage(Epicport.i18n.html_info, Epicport.i18n.html_game_protected);
        }
        dataKey = snapshot.val().data;
        set(ref(db, `data/${Epicport.profile.identity}/${dataKey}`), data);
        overwrite = true;
      } else {
        const fileRef = push(ref(db, `data/${Epicport.profile.identity}`), data);
        dataKey = fileRef.key;
        overwrite = false;
      }
      set(gameStateRef, {
        profile: Epicport.profile.identity,
        name: fileName,
        house: houseName,
        data: dataKey,
        timestamp: ts(),
      }).then(function() {
        const { analytics, logEvent } = firebase;
        const autosave = (fileName + ".dat" === Epicport.i18n.html_autosave);
        const event = autosave ? "autosave" : "save";
        logEvent(analytics, event, {
          profile: data.profile,
          name: data.name,
          house: data.house,
          value: data.content.length,
          overwrite,
        });
        Epicport.API.files = Epicport.API.files.filter(function (_file) {
          return file !== _file.name;
        });
        Epicport.API.files.unshift({
          name: file,
          house: houseName,
          loaded: true,
        });
        done();
        if (!autosave) {
          return Epicport.modalMessage(Epicport.i18n.html_success, Epicport.i18n.html_game_saved);
        }
      });
    }).catch(function(error) {
      var status;
      done();
      status = 500;
      error = String(error) || "Unknown error";
      return Epicport.modalMessage("Error (" + status + ")", "(" + status + "): " + error);
    });
  };

  API.prototype.createFs = function() {
    var done;
    if (!Epicport.profile) {
      return;
    }
    if (Epicport.API.fsCreated) {
      return;
    }
    done = Epicport.modalProgress();
    var { db, ref, query, get, orderByChild, limitToLast } = firebase;
    const gameStateRef = ref(db, `gameState/${Epicport.profile.identity}`);
    get(query(gameStateRef, orderByChild("timestamp"), limitToLast(500))).then((snapshot) => {
      var files = [];
      snapshot.forEach(function(object) {
        files.unshift({
          name: "/home/caiiiycuk/play-dune/data/" + object.val().name + ".dat",
          house: object.val().house,
          loaded: false,
        });
      });
      const { analytics, logEvent } = firebase;
      logEvent(analytics, "list", {
        profile: Epicport.profile.identity,
        value: files.length,
      });
      Epicport.API.listFiles(files);
      done();
      return Epicport.API.fsCreated = true;
    }).catch(function(error) {
      var status;
      done();
      status = 500;
      error = String(error) || "Unknown error";
      return Epicport.modalMessage("Error (" + status + ")", "(" + status + "): " + error);
    });
  };

  API.prototype.listFiles = function(files) {
    for (_i = 0, _len = files.length; _i < _len; _i++) {
      file = files[_i];
      Epicport.API.files.push(file);
    }
  }

  API.prototype.loadFiles = function(files, callback) {
    var file, loaders, _i, _len;
    if (files.length) {
      $(".select-file-dialog ul > span").hide();
    }
    loaders = [];
    for (_i = 0, _len = files.length; _i < _len; _i++) {
      file = files[_i];
      loaders.push(this.loadFile(file));
    }
    return async.parallel(loaders, function(error, files) {
      var name, parent, _j, _len1;
      if (error) {
        Epicport.modalMessage("Error", error);
      }
      if (files) {
        for (_j = 0, _len1 = files.length; _j < _len1; _j++) {
          file = files[_j];
          if (!file) {
	      continue;
          }
          name = file.file.substring(file.file.lastIndexOf('/') + 1);
          parent = file.file.substring(0, file.file.lastIndexOf('/'));
          console.log("Creating file '" + name + "' in '" + parent + "'");
          Module['FS_createPath']("/", parent, true, true);
          Module['FS_createDataFile'](parent, name, file.data, true, true);
        }
      }
      return callback(error);
    });
  };

  API.prototype.loadFile = function(file) {
    return function(callback) {
      let size = 0;
      var fileName = file.name.split("/").pop().split(".")[0];
      var { db, ref, get } = firebase;
      const gameStateRef = ref(db, `gameState/${Epicport.profile.identity}/${fileName}`);
      return get(gameStateRef).then((snapshot) => {
        if (!snapshot.exists()) {
          return callback(new Error("Not Found"), null);
        }
        return Promise.resolve(snapshot.val().data).then(function (key) {
          const dataRef = ref(db, `data/${Epicport.profile.identity}/${key}`);
          return get(dataRef);
        }).then(function (snapshot) {
          size = snapshot.val().content.length;
          return atob(snapshot.val().content);
        }).then(function (data) {
          const { analytics, logEvent } = firebase;
          logEvent(analytics, "load", {
            profile: Epicport.profile.identity,
            name: fileName,
            house: file.house,
            value: size,
          });
          file.loaded = true;
          if (data.length < 500) {
            throw new Error(Epicport.i18n.html_game_load_error);
          }
          return callback(null, {
            file: file.name,
            data
          });
        });
      }).catch(function (error) {
        error = String(error) || "Unknown error";
        return callback(error, null);
      })
    };
  };

  API.prototype.playMusic = function(filePtr, loops) {
    var file, name;
    file = Module['Pointer_stringify'](filePtr);
    name = file.substring(file.lastIndexOf('/') + 1);
    Epicport.API.audio.src = "/" + name;
    return Epicport.API.audio.play();
  };

  API.prototype.volumeMusic = function(volume) {
    return Epicport.API.audio.volume = volume / 128.0;
  };

  API.prototype.haltMusic = function() {
    return Epicport.API.audio.pause();
  };

  API.prototype.houseName = function() {
    var houseName;
    var houseCode = Module['arguments'][0];
    switch (houseCode) {
      case "-a":
      default:
        houseName = "Atreides";
        break;
      case "-o":
        houseName = "Ordos";
        break;
      case "-h":
        houseName = "Harkonnen";
        break;
    }
    return houseName;
  };

  API.prototype.houseArgument = function(houseName) {
    var houseCode;
    switch (houseName) {
      case "Atreides":
      default:
        houseCode = "-a";
        break;
      case "Ordos":
        houseCode = "-o";
        break;
      case "Harkonnen":
        houseCode = "-h";
        break;
    }
    Module['arguments'] = [houseCode];
    return houseCode;
  };

  return API;

})();
