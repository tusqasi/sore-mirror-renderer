class Drone {
    constructor(x, y, world) {
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);
        this.max_velocity = 10;
        this.world = world;

        if (x == undefined) {
            x = W / 2 - 100;
            y = 0;
        }
        this.position = createVector(x, y);
    }
    update(thrust) {
        
        // bounce back
        // slow down
        // not go below ground
        this.acceleration.add(0, thrust);
        this.velocity.add(this.acceleration);
        this.velocity.add(0, this.world.gravity);
        this.acceleration.mult(0);
       

        if (this.position.y >= this.world.ground) {
            // debugger;
            // Below ground
            this.velocity.mult(-0.2);
            this.position.y = this.world.ground - 1;
            
        }

        this.position.add(this.velocity);

    }
    draw() {
        image(drone_image, this.position.x, this.position.y);
    }
}
