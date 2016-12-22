function doGet(e) {
  var texts = e.parameter.text.split(" ");
  var subCommand = texts.shift();
  if (subCommand == "list") {
    return _list();
  } else if(subCommand == "thx") {
    return _incrementUsers(texts);
  } else {
    return _invalidCommand();
  }
}

function _list() {
  var range = _karmaRange(_limit());
  var values = range.getValues();
  var compact = _compact(values);
  var formatted = _u().map(compact, function(e){ return _formattedUser(e[0]) + ":" + _formattedCount(e[1]); });
  var res = {"response_type": "ephemeral", "text": formatted.join("\n") };
  return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
}

function _incrementUsers(users) {
  var messages = _u().reduce(users, function(memo, user){
    var incrementedUser = _increment(_without_at(user));
    memo.push(_without_at(incrementedUser[0]) + "の徳 :star2: が" + incrementedUser[1] + "に :up: しました");
    return memo;
  }, []);
  var res = {"response_type": "ephemeral", "text": messages.join("\n") };
  return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
}

function _invalidCommand() {
  var res = {"response_type": "ephemeral", "text": "`/karma list` か `/karma thx name1 name2` を指定してください" };
  return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
}

function _without_at(user) {
  return user.replace(/@/g, "");
}


function _limit() {
  return 50;
}

function _increment(user) {
  var range = _karmaRange(_limit());
  var values = range.getValues();
  var baseSize = values.length;
  var compact = _compact(values);
  var incremented = _incrementKarma(compact, user);
  var filled = _fillEmpty(incremented, baseSize)
  range.setValues(filled);
  range.sort([{column: 2, ascending: false}]);
  return _u().find(incremented, function(e){ return e[0] == user; });
}

function _formattedUser(user) {
  var spacingUser = _u().chars(user).join(" ");
  return _u().rpad(spacingUser, 30, ' ');
}

function _formattedCount(count) {
  return _u().lpad(count, 5, ' ');
}


function _karmaRange(limit) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  return sheet.getRange("A2:B" + limit);
}

function _compact(array) {
  return _u().filter(array, function(e){ return e[0] && e[1]; });
}

function _incrementKarma(array, user) {
  var ary = _u().clone(array);
  var target = _u().find(array, function(e){ return e[0] == user; });
  if (typeof target === "undefined") {
    ary.push([user, 1]);
  } else {
    target[1]++;
  }
  return ary;
}

function _fillEmpty(array, baseSize) {
  var afterSize = array.length;
  var ary = _u().clone(array);
  for (var i= afterSize;i < baseSize;i++) {
    ary.push(['','']);
  }
  return ary;
}

function _u() {
  return UnderscoreString.load(Underscore.load(), true);
}
