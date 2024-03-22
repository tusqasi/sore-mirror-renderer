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

const max_reconnects = 10;
let reconnects = 0;
let socket;

let drone;
let drone_swarm = [];
function make_swarm(n) {
	let res = [];
	for (let i = 0; i < n; i++) {
		let drone = Bodies.rectangle(
			Math.floor(Math.random() * width),
			Math.floor(Math.random() * height),
			50,
			50, {
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
					position_controller: new PID(0.0002, 0.0, 0.0011, Math.floor(Math.random() * width), [-0.05, 0.05]),
					altitude_controller: new PID(0.0002, 0.0, 0.0011, Math.floor(Math.random() * height), [-0.05, 0.05]),
				},
			}
		);
	}
	drone_swarm = res;
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
	createCanvas(width, height);
	setpoint = createVector(100, 100);
	altitude_controller = new PID(0.00020, 0.000000000, 0.0011, setpoint.y, [-0.05, 0.05]);
	position_controller = new PID(0.00020, 0.000000000, 0.0011, setpoint.x, [-0.05, 0.05]);
	engine = Engine.create();
	engine.gravity.y = 0.8;

	ground = Bodies.rectangle(-100, height - 30, width + 1000, 100, {
		friction: 0.1,
		restitution: 0.1,
		isStatic: true,
	});
	ground.w = width + 100;
	ground.h = 100;

	drone = Bodies.rectangle(400, 40, 50, 50, {
		friction: 0.1,
		restitution: 0.1,
		isStatic: false,
	});

	drone.w = 50;
	drone.h = 50;
	Composite.add(engine.world, [drone, ground]);

	drone_image.resize(100, 100)
}

let start_time = Date.now();

let x = -1;
let y = -1;

function draw() {
	let force_y = altitude_controller.update(drone.position.y);
	let force_x = position_controller.update(drone.position.x);

	Engine.update(engine);
	Body.applyForce(drone, drone.position, Vector.create(force_x, force_y))

	background("#eee");

	push();
	fill("black");
	rect(ground.position.x, ground.position.y, ground.w, ground.h);
	pop();
	image(drone_image, drone.position.x - drone_image.width / 2, drone.position.y - drone_image.height / 2);
	fill("blue")
	circle(drone.position.x, drone.position.y, 10);
	if ((Date.now() - start_time) > 4000) {
		start_time = Date.now();
		x = floor(random(50, height - 50));
		y = floor(random(50, width - 50));
		altitude_controller.setpoint = x;
		position_controller.setpoint = y;
	}
	stroke("red");
	fill("red");
	circle(position_controller.setpoint, altitude_controller.setpoint, 10);
}
