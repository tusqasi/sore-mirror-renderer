class World {
    constructor(gravity, ground, drag) {
        this.gravity = gravity ?? 5;
        this.ground = ground ?? 500;
        this.drag = drag ?? 4;
    }
}