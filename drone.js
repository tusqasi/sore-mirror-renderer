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
        image(drone_image, this.position.x, this.position.y);
    }
}
