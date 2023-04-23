const W = 700;
const H = 700;
const drone_height = 200;

// Colors
const RED = [255, 0, 0];
const WHITE = [255, 255, 255];
const BLACK = [0, 0, 0];
const GRAVITY = 0.2;
const ground = H - drone_height;
const world = new World(GRAVITY, 550, 0);

let drone;
let drone_image;

function setup() {
    drone = new Drone(W/2- drone_height/2,0,world)
    createCanvas(W, H);
    drone_image.resize(0, drone_height);
    drone_image.filter(THRESHOLD, 0.3);
}
function preload() {
    drone_image = loadImage("assets/drone.png");
}
function draw() {
    background(225);
    drone.update()
    drone.draw()
}
