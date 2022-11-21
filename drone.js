class Drone {
    constructor(startPosition) {
        this.velocity = 0;
        this.acceleration = 0;
        this.px = 0;
        this.py = -300;
        if (startPosition != undefined) {
            this.position = startPosition;
        }
    }

    update() {
        if (this.position > GROUND) {
            // On or below ground
            this.acceleration = 0;
            this.position = GROUND + 1;
            this.velocity = 0;
        } else {
            // Above ground

            this.acceleration += GRAVITY;
            this.velocity += this.acceleration;
            if (-this.velocity >= terminalVelocity) {
                this.velocity = -terminalVelocity;
            } else if (-this.velocity <= -terminalVelocity) {
                this.velocity = terminalVelocity;
            } else {
            }
            this.position += this.velocity;
            fill(0);
            text("ACCELERATION :" + -this.acceleration.toFixed(2), 0, -300);
            this.acceleration = 0;
        }
    }

    propel(t) {
        this.acceleration -= t;
        if (this.position > GROUND) {
            this.position = GROUND - 1;
        }
    }
    show_stats() {
        let pos = 1;
        let offset = 25;
        // text("ACCELERATION " + this.acceleration.toFixed(0), px, pos * offset);
        text(
            "VELOCITY " + -this.velocity.toFixed(1),
            this.px,
            ++pos * offset + this.py
        );
        text(
            "POSITION :" + -(this.position.toFixed(0) - GROUND - 1),
            this.px,
            ++pos * offset + this.py
        );
    }
    data() {
        return {
            acceleration: this.acceleration,
            velocity: this.velocity,
            position: this.position,
        };
    }
}
