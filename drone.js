class Drone {
    constructor(x, y,world) {
        this.velocity = createVector(0, 1);
        this.acceleration = createVector(0, 0);
        this.r = 10;
        this.angular_velocity = 0;
        this.angular_acceleration = 0;
        this.thrust_differential = 0.5; // 0 to 1; 0 -> left; 1 -> right
        this.max_thrust = 10;
        this.arm_length = 10;
        this.world = world;

        if (x == undefined) {
            x = W / 2 - 100;
            y = 0;
        }
        this.position = createVector(x, y);
    }
    update() {

        if (this.position.y < this.world.ground) {
            this.position.add(this.velocity)
         
        }


        this.velocity.add(this.acceleration)
        this.velocity.add(0,this.world.gravity)
        this.acceleration.mult(0);
    }
    thrust() {

    }
    draw() {
        image(drone_image, this.position.x, this.position.y)
    }
}