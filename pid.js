// Mostly copied from https://github.com/kapetan/simple-pid/tree/master

function clamp(input, limits) {
    if (limits == undefined) return input;
    const [min, max] = limits;
    if (input > max) return max;
    else if (input < min) return min;
    return input;
}
class PID {
    constructor(kp, ki, kd, setpoint, limits) {
        this.kp = kp;
        this.ki = ki;
        this.kd = kd;
        this.limits = limits;
        this.setpoint = setpoint;
        this.last_error = 0;
        this.last_integral = 0;
    }
    update(input) {
        const error = this.setpoint - input;

        const propotional = error;
        const integral = this.last_integral + error;
        const derivative = error - this.last_error ;
        this.last_error = error;
        this.last_integral = integral;
        return clamp(
            this.kp * propotional + this.ki * integral + this.kd * derivative,
            this.limits
        );
    }
}
