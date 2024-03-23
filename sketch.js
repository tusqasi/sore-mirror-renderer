var Engine = Matter.Engine,
	Render = Matter.Render,
	Runner = Matter.Runner,
	Bodies = Matter.Bodies,
	Body = Matter.Body,
	Composite = Matter.Composite,
	World = Matter.World,
	Vector = Matter.Vector;

const width = 800,
	height = 600;

let ground;
let engine;

/**
 * @type {{ drone: Matter.Body, controller: { position_controller: PID, altitude_controller: PID } }[]}
 */
let drone_swarm;


let socket;
// socket = connectWebsocket("ws://localhost:4000");
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
				position_controller: new PID(0.00002, 0.0, 0.002, random(90, width - 90), [-1, 1]),
				// altitude_controller: new PID(0.00003, 0.00000001, 0.009, random(90, height - 90), [-0.009, 0.009]),
				altitude_controller: new PID(0.00005, 0.005, 0.01, random(90, height - 90), [-0.009, 0.009]),
			},
		}
		);
	}
	return res;
}

let drone_image;
let setpoint;

/**
 * @type PID
 */
let altitude_controller;
let position_controller;

function preload() {
	drone_image = loadImage("assets/drone.png")
}
function setup() {
	createCanvas(width + 500, height);
	engine = Engine.create();
	engine.gravity.y = 0.8;

	ground = Bodies.rectangle(-100, height - 30, width + 1000, 100, {
		friction: 0.1,
		restitution: 0.1,
		isStatic: true,
	});
	ground.w = width + 100;
	ground.h = 100;
	drone_swarm = make_swarm(1);

	const drones = drone_swarm.map((d) => d.drone);
	Composite.add(engine.world, [...drones, ground]);
	reapeatFunction(() => {
		drone_swarm[0].controller.altitude_controller.setpoint = random(100, height - 100);
	}, 3000);

	drone_image.resize(100, 100)
}

let x = width;
let plot = [];
let force_y_max = Number.NEGATIVE_INFINITY;
let force_y_min = Number.POSITIVE_INFINITY;

function draw() {

	Engine.update(engine);
	background("#eee");
	for (let i = 0; i < drone_swarm.length; i++) {
		const { drone, controller } = drone_swarm[i];
		const force_y = controller.altitude_controller.update(drone.position.y, deltaTime);
		if (force_y > force_y_max) { force_y_max = force_y; }
		if (force_y < force_y_min) { force_y_min = force_y; }
		// const force_x = controller.position_controller.update(drone.position.x, deltaTime);

		Body.applyForce(drone, drone.position, Vector.create(0, force_y));
		// circle(drone.drone.position.x, drone.drone.position.y, 40);
		image(drone_image, drone.position.x - drone_image.width / 2, drone.position.y - drone_image.height / 2);
		if (x > width + 500) {
			plot = [];
			x = width;
		}
		// strokeWeight(3)
		// point(x,drone.position.y);
		stroke("red")
		push();
		strokeWeight(1);
		// line(0, controller.altitude_controller.setpoint, width+500, controller.altitude_controller.setpoint);
		pop();
		if (socket && socket.readyState == WebSocket.OPEN) {
			const data = {
				drone_y: drone.position.y,
				setpoint: controller.altitude_controller.setpoint,
				force_y: force_y
			};
			socket.send(JSON.stringify(data))
		}
		plot.push([drone.position.y, force_y, controller.altitude_controller.setpoint, drone.velocity.y]);
	}
	// noFill();
	// stroke("black")
	// beginShape();
	// strokeWeight(1)
	noFill();
	for (let i = 0; i < plot.length; i++) {
		stroke("blue")
		strokeWeight(2)
		point(i + width, plot[i][0]);
		// stroke("purple")
		// point(i + width, map(plot[i][1], -0.009, 0.009, 100, 400));
		// point(i + width, plot[i][1]*1000+100);
		stroke("black")
		point(i + width, plot[i][2]);
		// stroke("magenta")
		// point(i + width, plot[i][3]+100);
	}

	x++;
	// fill("white");

	stroke("black")
	rect(ground.position.x, ground.position.y, ground.w, ground.h);
	// image(drone_image, drone.position.x - drone_image.width / 2, drone.position.y - drone_image.height / 2);
}


function reapeatFunction(func, interval) {
	func();
	setTimeout(() => reapeatFunction(func, interval), interval);
}
