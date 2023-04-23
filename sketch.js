let W = 700;
let H = 700;
// Colors
let RED = [255, 0, 0];
let WHITE = [255, 255, 255];
let BLACK = [0, 0, 0];
let thrust = 2;
let reconnects = 0;
let socket;
let GROUND = -50;
let d = new Drone(-400);
let GRAVITY = 1; // pixels/s^-2
let OUTSIDE = false;
let sliderThrust = 0;
let droneModel;
let inconsolataFont;

let terminalVelocity = 100.0;
const gamepads = {};
function handleGampad() {
    const gamepad = navigator.getGamepads()[0];
    if (!gamepad)
        // no game pad
        return;
    // down button
    const y1 = gamepad.axes[1];
    if (y1 < 0) {
        sliderThrust = Math.pow(2, -y1);
        // console.log(y1);
    } else if (y1 > 0) {
        sliderThrust = -Math.exp(-y1) - 1;
    } else {
        sliderThrust = 0;
    }
}
function gamepadHandler(event, connecting) {
    const gamepad = event.gamepad;
    // Note:
    // gamepad === navigator.getGamepads()[gamepad.index]

    if (connecting) {
        gamepads[gamepad.index] = gamepad;
        console.info("Connected New gamepad!");
    } else {
        delete gamepads[gamepad.index];
    }
}

window.addEventListener(
    "gamepadconnected",
    (e) => {
        gamepadHandler(e, true);
    },
    false
);
window.addEventListener(
    "gamepaddisconnected",
    (e) => {
        gamepadHandler(e, false);
    },
    false
);

function connectWebsocket(url) {
    socket = new WebSocket(url);
    socket.onmessage = function onmessage_callback(message) {
        data = JSON.parse(message.data);
        console.log(data);
        if (data.propel != undefined) {
            d.propel(data.propel);
        }
        if (data.data != undefined) {
            console.log(data.data);
        }
    };
    socket.onopen = function onopen_callback() {
        console.log("connected to: " + socket.url);
        socket.send('{"Hi":"from client"}');
    };
    socket.onclose = function onclose_callback(event) {
        console.error("Connection Closed: ");
        // console.log(event);
        reconnects++;
        if (reconnects > 10) {
            console.error("Tried reconnecting {reconnect} times");
        } else {
            console.log("Trying to reconnect");
            setTimeout(function () {
                connectWebsocket(url);
            }, 5000);
        }
    };
    socket.onerror = function onerror_callback(_) {
        console.warn("Error Occured. Trying to reconnect.");
        setTimeout(function () {
            connectWebsocket(url);
        }, 5000);
    };
}
// connectWebsocket("wss://InsubstantialRosyApplications.tusqasi.repl.co");
// connectWebsocket("ws://127.0.0.1:6969");

function setup() {
    // sliderThrust = createSlider(1, 50, 30, 5);
    createCanvas(W, H, WEBGL);
    // createCanvas(W, H);

    textFont(inconsolataFont);
    textSize(30);
}
function preload() {
    droneModel = loadModel("assets/drone.obj");
    inconsolataFont = loadFont("assets/inconsolata.otf");
}
function draw() {
    OUTSIDE = d.position < -H + GROUND ? true : false;
    background(OUTSIDE ? RED : WHITE);
    if (keyIsDown(UP_ARROW)) {
        d.propel(thrust);
    }
    d.propel(sliderThrust);
    orbitControl();
    debugMode();
    push();
    stroke(100, 200, 20);
    fill(10, 10, 100);
    pop();
    if (frameCount == 1 || frameCount == 1000) {
        camera(400, -200, 400, 0, -200, 0, 0, 1, 0);
    }
    push();
    // translate(0, -100 + 100 * sin(frameCount * 0.01), 0);
    translate(0, d.position, 0);
    scale(3);
    model(droneModel);
    pop();
    d.update();
    fill(0);
    d.show_stats();
    fill(255);
    handleGampad();
}

function keyPressed() {
    // socket.send(JSON.stringify({ event: "message on keypress" }));
}
