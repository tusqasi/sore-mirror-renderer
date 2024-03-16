var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Composite = Matter.Composite,
    World = Matter.World,
    Vector = Matter.Vector;

let ground;
let engine;

const max_reconnects = 10;
let reconnects = 0;
let socket;

/**
* Connect to a websocket server
*
* @param url string
* @return WebSocket
*/
function connectWebsocket(url) {
	socket = new WebSocket(url);
	socket.onmessage = function onmessage_callback(message) {
		if (message.data == undefined) {
			return;
		}
		console.log(message.data);

	};
	socket.onopen = function onopen_callback() {
		console.log("Connected to: " + socket.url);
		socket.send("ping");
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
}

/**
 * @type {Drone}
 */
let drone ;
let drone_image;
let world ;
const setpoint = createVector(100,100);

let altitude_controller = new PID(0.4, 0, 0.2 , setpoint, [-4,4], p5.Vector.sub);
function setup() {
	createCanvas(800, 600);
	world = new World(1,height -100, 0);
	drone = new Drone(100, height - 200, world );
	drone_image.resize(100,100)
}
function preload(){
	drone_image = loadImage("assets/drone.png")
}
function draw() {
	background("#eee"); drone.draw();
	drone.update(altitude_controller.update(drone.position.y));
}
