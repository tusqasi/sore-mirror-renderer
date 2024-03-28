// Mostly copied from https://github.com/kapetan/simple-pid/tree/master
/**
 * Limits the given input into the given range
 *
 * @param {number} input
 * @param {[number, number]} limits 
 */
function clamp(input, limits) {
	if (limits == undefined) return input;
	const [min, max] = limits;
	if (input > max) return max;
	else if (input < min) return min;
	return input;
}

class PID {
	/**
	 * A Simple PID controller
	 * @constructor 
	 * @param {number} kp
	 * @param {number} ki
	 * @param {number} kd
	 * @param {number} setpoint
	 * @param {[number, number]} limits
	 */ constructor(kp, ki, kd, setpoint, limits) {
		this.kp = kp;
		this.ki = ki;
		this.kd = kd;
		this.limits = limits;
		this.setpoint = setpoint;
		this.last_error = 0;
		this.integral = 0;
		this.last_input = 0;
		this.last_errors = [];
		this.last_output = 0;
		this.last_time = Date.now();
		this.sample_time = 10;
		this.max_error_deviation = 0.5;
	}
	/**
	 * Updates the controller
	 *
	 * @param { number} input
	 * @param { number} dt
	 */
	update(input, dt) {
		dt = 1;
		if (Date.now() - this.last_time < this.sample_time) {
			return this.last_output;
		}
		this.last_time = Date.now();
		const error = this.setpoint - input
		const propotional = error;
		this.integral = clamp(this.integral + this.ki * error, this.limits);

		const d_input = input - this.last_input;
		this.last_error = error;
		this.last_input = input;

		const output = clamp(
			this.kp * propotional + this.ki * this.integral * dt - this.kd * d_input / dt, this.limits);
		this.last_output = output;
		this.last_errors.push(Math.abs(error));
		if (this.last_errors.length > 10) {
			this.last_errors.shift();
		}
		return output;
	}
	get is_steady_state() {
		let avg = 0;
		for (let i = 0; i < this.last_errors.length; i++) {
			avg += this.last_errors[i];
		}
		avg = avg / this.last_errors.length;
		let max_deviation = Number.NEGATIVE_INFINITY;
		for (let i = 0; i < this.last_errors.length; i++) {
			if (max_deviation < Math.abs(this.last_errors[i] - avg)) {
				max_deviation = Math.abs(this.last_errors[i] - avg);
			}
		}
		return max_deviation < this.max_error_deviation;
	}
}

/**
 * @function createVector
 * @param {number} x
 * @param {number} x
 * @returns {Vector}
 */


/**
 * @class Drone
 */
class Drone {
	/**
	 *
	 * @param {number} x 
	 * @param {number} y 
	 * @param {World} world 
	 */
	constructor(x, y, world) {
		this.velocity = createVector(0, 0);
		this.acceleration = createVector(0, 0);
		this.max_velocity = 10;
		this.world = world;
		this.position = createVector(x, y);
	}
	update(thrust) {


	}
	draw() {
		image(DRONE_IMAGE, this.position.x, this.position.y);
	}
}

let RECONNECTS = 0;
let MAX_RECONNECTS = 5;
/**
* Connect to a websocket server
*
* @param url string
* @return WebSocket
*/
function connectWebsocket(url) {
	let socket = new WebSocket(url);

	// socket.onmessage = function onmessage_callback(message) {
	// 	if (message.data) {
	// 		console.log(message.data) 
	// 	}
	//
	// };
	socket.onopen = function onopen_callback() {
		socket.send(JSON.stringify({ ping: "pong" }))
		// socket.send("ping")	;
	};

	socket.onclose = function onclose_callback(_event) {
		console.error("Connection Closed: ");
		RECONNECTS++;
		if (RECONNECTS > MAX_RECONNECTS) {
			console.error(`Tried reconnecting ${RECONNECTS} times`);
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
/**
 * Returns a drone swarm
 * @param {number} n 
 */
function make_swarm(n) {
	let res = [];
	for (let i = 0; i < n; i++) {
		/**
		 * @type {Matter.Body}
		 */
		let drone = Bodies.circle(
			300,
			random(100, height - 100),
			// 20,
			20, {
			friction: 0.1,
			restitution: 0.1,
			isStatic: false,
		}
		);

		drone.w = 50;
		drone.h = 50;
		res.push({
			drone: drone,
			controller: {
				position_controller: new PID(0.000002, 0.0, 0.001, random(90, WIDTH - 90), [-0.009, 0.009]),
				// altitude_controller: new PID(0.00003, 0.00000001, 0.009, random(90, height - 90), [-0.009, 0.009]),
				altitude_controller: new PID(0.000015, 0.0, 0.00001, random(90, height - 90), [-0.009, 0.009]),
			},
		}
		);
	}
	return res;
}
var Engine = Matter.Engine,
	Render = Matter.Render,
	Runner = Matter.Runner,
	Bodies = Matter.Bodies,
	Body = Matter.Body,
	Composite = Matter.Composite,
	World = Matter.World,
	Vector = Matter.Vector;

const WIDTH = 800,
	height = 600;

let GROUND;
let ENGINE;

/**
 * @type {{ drone: Matter.Body, controller: { position_controller: PID, altitude_controller: PID } }[]}
 */
let DRONE_SWARME;


let SOCKET;
SOCKET = connectWebsocket("ws://localhost:4000/ws?id=2323");

let DRONE_IMAGE;
let SETPOINT;

/**
 * @type PID
 */
let ALITITUDE_CONTROLLER;
let POSITION_CONTROLLER;

function preload() {
	DRONE_IMAGE = loadImage("assets/drone.png")
}
function setup() {
	createCanvas(WIDTH + 500, height);
	ENGINE = Engine.create();
	ENGINE.gravity.y = 0.8;

	GROUND = Bodies.rectangle(-100, height - 30, WIDTH + 1000, 100, {
		friction: 0.1,
		restitution: 0.1,
		isStatic: true,
	});
	GROUND.w = WIDTH + 100;
	GROUND.h = 100;
	DRONE_SWARME = make_swarm(1);

	const drones = DRONE_SWARME.map((d) => d.drone);
	Composite.add(ENGINE.world, [...drones, GROUND]);
	reapeatFunction(() => {
		for (let i = 0; i < DRONE_SWARME.length; i++) {
			// DRONE_SWARME[i].controller.altitude_controller.setpoint = random(100, height - 100);
			// DRONE_SWARME[i].controller.altitude_controller.setpoint = random(100, height - 100);
		}
	}, 3000);

	DRONE_IMAGE.resize(100, 100)
}

let x = WIDTH;
let plot = [];
let force_y_max = Number.NEGATIVE_INFINITY;
let force_y_min = Number.POSITIVE_INFINITY;

function draw() {

	Engine.update(ENGINE);
	background("#eee");
	for (let i = 0; i < DRONE_SWARME.length; i++) {
		const { drone, controller } = DRONE_SWARME[i];
		const force_y = controller.altitude_controller.update(drone.position.y);
		const force_x = controller.position_controller.update(drone.position.x);

		Body.applyForce(drone, drone.position, Vector.create(0, force_y));
		// circle(drone.drone.position.x, drone.drone.position.y, 40);
		image(DRONE_IMAGE, drone.position.x - DRONE_IMAGE.width / 2, drone.position.y - DRONE_IMAGE.height / 2);
		if (x > WIDTH + 500) {
			plot = [];
			x = WIDTH;
		}
		// strokeWeight(3)
		// point(x,drone.position.y);
		stroke("red")
		push();
		strokeWeight(1);
		// line(0, controller.altitude_controller.setpoint, width+500, controller.altitude_controller.setpoint);
		pop();
		if (SOCKET
			&& SOCKET.readyState == WebSocket.OPEN
			&& controller.altitude_controller.is_steady_state
		) {
			const data = {
				drone_y: drone.position.y,
				setpoint: controller.altitude_controller.setpoint,
				force_y: force_y
			};
			SOCKET.send(JSON.stringify(data))
		}
		plot.push([drone.position.y, force_y, controller.altitude_controller.setpoint, drone.velocity.y]);
	}
	// noFill();
	// stroke("black")
	// beginShape();
	// strokeWeight(1)
	noFill();
	// if (DRONE_SWARME[0].controller.altitude_controller.last_errors.length > 500) {
	// 	DRONE_SWARME[0].controller.altitude_controller.last_errors = [];
	// }

	for (let i = 0; i < DRONE_SWARME[0].controller.altitude_controller.last_errors.length; i++) {
		stroke(DRONE_SWARME[0].controller.altitude_controller.is_steady_state ? "green" : "red");
		// 	stroke("blue")
		strokeWeight(2);
		point(i + WIDTH, map(DRONE_SWARME[0].controller.altitude_controller.last_errors[i], -200, 200, 100, 200));
	}
	// for (let i = 0; i < plot.length; i++) {
	// 	stroke("blue")
	// 	strokeWeight(2)
	// 	point(i + WIDTH, plot[i][0]);
	// 	// stroke("purple")
	// 	// point(i + width, map(plot[i][1], -0.009, 0.009, 100, 400));
	// 	// point(i + width, plot[i][1]*1000+100);
	// 	stroke("black")
	// 	point(i + WIDTH, plot[i][2]);
	// 	// stroke("magenta")
	// 	// point(i + width, plot[i][3]+100);
	// }

	x++;
	// fill("white");

	stroke("black")
	rect(GROUND.position.x, GROUND.position.y, GROUND.w, GROUND.h);
	// image(drone_image, drone.position.x - drone_image.width / 2, drone.position.y - drone_image.height / 2);
}


function reapeatFunction(func, interval) {
	func();
	setTimeout(() => reapeatFunction(func, interval), interval);
}
