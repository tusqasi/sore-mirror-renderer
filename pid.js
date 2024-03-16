// Mostly copied from https://github.com/kapetan/simple-pid/tree/master
/**
 * Limits the given input into the given range
 *
 * @param {number} input
 * @param {[number, number]} limits 
 */
function clamp(input, limits) {
    if (limits == undefined) return input;
    const [min, max] = limits;
    if (input > max) return max;
    else if (input < min) return min;
    return input;
}
class PID {
	/**
	 * A Simple PID controller
	 * @constructor 
	 * @param {number} kp
	 * @param {number} ki
	 * @param {number} kd
	 * @param {number} setpoint
	 * @param {[number, number]} limits
	 * @param {CallableFunction} error_func 
	 */ constructor(kp, ki, kd, setpoint, limits, error_func) {
		this.kp = kp;
        this.ki = ki;
        this.kd = kd;
        this.limits = limits;
        this.setpoint = setpoint;
		this.error_func = error_func;
        this.last_error = 0;
        this.last_integral = 0;
    }
	/**
	 * Updates the controller
	 *
	 * @param { number} input
	 */
    update(input) {
        const error = this.error_func(this.setpoint, input)

        const propotional = error;
        const integral = this.last_integral + error;
        const derivative = error - this.last_error ;
        this.last_error = error;
        this.last_integral = integral;
		const output = this.kp * propotional + this.ki * integral + this.kd * derivative;
        return clamp(
			output,
            this.limits
        );
    }
}
