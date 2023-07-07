
function vanila() {

  // Current Date
  var today = new Date();

  // Date to string
  let twoslot = function(v) {
    if (v < 9) v = "0" + v;
    return v
  }
  var date = new Date();
  var year = date.getFullYear();
  var month = twoslot(date.getMonth() + 1); // 0 - 11
  var day = twoslot(date.getDate());
  var hour = twoslot(date.getHours()); // 0 - 23
  var minute = twoslot(date.getMinutes());
  var second = twoslot(date.getSeconds());
  var strDate = day+'/'+month+'/'+year+' '+hour+':'+minute+':'+second

}

function moment() {

  // Current Date
  moment();

  // to String
  moment().format("YYYY/MM/DD HH:mm:ss");

  // to Date moment
  moment("2023/07/06 22:46:20", "YYYY/MM/DD HH:mm:ss");

  // To Date vanila
  moment().toString();

}
