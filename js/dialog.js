// Generated by CoffeeScript 1.8.0
Epicport.modalMessage = function(title, message, callback) {
  var div;
  div = $('<div title="' + title + '">' + message + '</div>');
  return div.dialog({
    dialogClass: "modal",
    modal: true,
    closeText: "",
    buttons: {
      'Ok': function() {
        $(this).dialog('close');
        if (callback) {
          return callback($(this));
        }
      }
    }
  });
};

Epicport.modalProgress = function() {
  var div;
  div = $('<div class="progress_modal"></div>');
  $(document.body).append(div);
  return function() {
    return div.remove();
  };
};
