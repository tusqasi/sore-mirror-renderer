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
	 */ constructor(kp, ki, kd, setpoint, limits) {
		this.kp = kp;
		this.ki = ki;
		this.kd = kd;
		this.limits = limits;
		this.setpoint = setpoint;
		this.last_error = 0;
		this.integral = 0;
		this.last_input = 0;
	}
	/**
	 * Updates the controller
	 *
	 * @param { number} input
	 * @param { number} dt
	 */
	update(input, dt) {
		const error = this.setpoint - input
		const propotional = error;
		this.integral = clamp(this.integral + this.ki * error, this.limits);

		const d_input = input - this.last_input;
		this.last_error = error;
		this.last_input = input;

		const output = clamp(
			this.kp * propotional + this.ki * this.integral * dt - this.kd * d_input / dt, this.limits);

		return output;
	}
}
