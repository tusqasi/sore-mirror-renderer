const W = 300;
const H = 700;
const drone_height = 200;

// Colors
const RED = [255, 0, 0];
const WHITE = [255, 255, 255];
const BLACK = [0, 0, 0];
const GRAVITY = 1;
const ground = H - drone_height;
const world = new World(GRAVITY, 550, 0);
const altitude_controller = new PID(0.004, 0.0001, 0.3, 10);

let drone;
let swarm = [];
let drone_image;

function grid() {
    for (let i = 0; i < H; i += 100) {
        text(i, 0, i - 5);
        line(0, i, W, i);
    }
}

function setup() {
    drone = new Drone(W / 2 - drone_height / 2, ground, world);
    createCanvas(W, H);
    drone_image.resize(0, drone_height);
    drone_image.filter(THRESHOLD, 0.3);
}
function preload() {
    drone_image = loadImage("assets/drone.png");
}
function draw() {
    background(225);
    grid();
    drone.update(altitude_controller.update(drone.position.y));
    drone.draw();
}
