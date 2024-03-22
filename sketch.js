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

let drone;

/**
 * @type {{ drone: Matter.Body, controller: { position_controller: PID, altitude_controller: PID } }[]}
 */
let drone_swarm;

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
			Math.floor(Math.random() * width),
			Math.floor(Math.random() * height),
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
				position_controller: new PID(0.00002, 0.0, 0.002, random(90, width - 90), [-0.1, 0.1]),
				altitude_controller: new PID(0.00002, 0.00000001, 0.002, random(90, height - 90), [-0.1, 0.1]),
			},
		}
		);
	}
	return res;
}

let drone_image;
let setpoint;

/**
 * @type function[]
 */
let draw_queue = [];

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

	drone_image.resize(100, 100)
}

let x = width;
let plot = [];
function draw() {

	Engine.update(engine);
	background("#eee");
	for (let i = 0; i < drone_swarm.length; i++) {
		const { drone, controller } = drone_swarm[i];
		const force_y = controller.altitude_controller.update(drone.position.y, deltaTime);
		const force_x = controller.position_controller.update(drone.position.x, deltaTime);

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
		line(width, controller.altitude_controller.setpoint, width + 500, controller.altitude_controller.setpoint);
		plot.push(drone.position.y);
	}
	noFill();
	stroke("black")
	beginShape();
	strokeWeight(4)
	for (let i = 0; i < plot.length; i++) {
		vertex(i + width, plot[i]);
	}
	endShape();
	x++;
	fill("white");
	rect(ground.position.x, ground.position.y, ground.w, ground.h);
	// image(drone_image, drone.position.x - drone_image.width / 2, drone.position.y - drone_image.height / 2);
}
