module.exports = function init(site) {

var http = require('http');

// function SendMsg(token, message) {
//   // Build the post string from an object
//   var post_data = JSON.stringify({
// 	  'registration_ids' : [token],
// 	  'data' :{ 'message' : message	}
//   });

//   // An object of options to indicate where to post to
//   var post_options = {
//       host: 'fcm.googleapis.com',
// 	  path: '/fcm/send',
//       method: 'POST',
//       headers: {
// 		  'Authorization': 'AIzaSyCMQxR6ERB-XbjtAXFG9H1Sy5BYnABNEAk',
//           'Content-Type': 'application/json',
//           'Content-Length': post_data.length
//       }
//   };

//   // Set up the request
//   var post_req = http.request(post_options, function(res) {
//       res.setEncoding('utf8');
// 	  var responseString = '';
//       res.on('data', function (data) {
// 		  responseString += data;
//       });
// 	  res.on('end', function() {
// 		var resultObject = JSON.parse(responseString);
// 		console.log(resultObject);
// 	  });
//   });

//   // post the data
//   post_req.write(post_data);
//   post_req.end();

// }

// SendMsg('eEoUGvO_65...', 'Hello world')
}
