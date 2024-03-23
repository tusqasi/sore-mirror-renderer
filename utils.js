let reconnects  = 0;
let max_reconnects = 5;
/**
* Connect to a websocket server
*
* @param url string
* @return WebSocket
*/
function connectWebsocket(url) {
	let socket = new WebSocket(url);

	// socket.onmessage = function onmessage_callback(message) {
	// 	if (message.data == undefined) {
	// 		return;
	// 	}
	//
	// };
	socket.onopen = function onopen_callback() {
		console.log("Connected to: " + socket.url);
		socket.send(JSON.stringify({is_drone: true}))
	};

	socket.onclose = function onclose_callback(event) {
		console.error("Connection Closed: ");
		reconnects++;
		if (reconnects > max_reconnects) {
			console.error(`Tried reconnecting ${reconnects} times`);
		} else {
			console.warn("Trying to reconnect");
			setTimeout(function() {
				connectWebsocket(url);
			}, 5000);
		}
	};
	socket.onerror = function onerror_callback(_) {
		console.warn("Error Occured. Trying to reconnect.");
		setTimeout(function() {
			connectWebsocket(url);
		}, 5000);
	};
	return socket;
}
