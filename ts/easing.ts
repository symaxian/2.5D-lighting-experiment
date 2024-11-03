/*
Notes:
	Each function accepts a single argument, the current position of the animation's elapsed time across its duration, between 0 and 1
	Each function then returns a number between 0 and 1, determining how far along the effects of the animation should have progressed
	Helpful links:
		http://gsgd.co.uk/sandbox/jquery/easing/
		http://stackoverflow.com/questions/5916058/jquery-easing-function
*/

namespace easing {

	export function linear(t: number) {
		return t;
	}

	export function easeInQuad(t: number) {
		return t * t;
	}

	export function easeOutQuad(t: number) {
		return t * (2 - t);
	}

	export function easeInOutQuad(t: number) {
		return ((t /= 0.5) < 1 ? t * t : (1 - t) * (t - 3) + 1) / 2;
	}

	export function easeInCubic(t: number) {
		return t * t * t;
	}

	export function easeOutCubic(t: number) {
		return --t * t * t + 1;
	}

	export function easeInOutCubic(t: number) {
		return (t /= 0.5) < 1 ? t * t * t / 2 : (t -= 2) * t * t / 2 + 1;
	}

	export function easeInQuart(t: number) {
		return t * t * t * t;
	}

	export function easeOutQuart(t: number) {
		return --t * t * t * -t + 1;
	}

	export function easeInOutQuart(t: number) {
		return (t /= 0.5) < 1 ? t * t * t * t / 2 : 1 - (t -= 2) * t * t * t / 2;
	}

	export function easeInQuint(t: number) {
		return t * t * t * t * t;
	}

	export function easeOutQuint(t: number) {
		return --t * t * t * t * t + 1;
	}

	export function easeInOutQuint(t: number) {
		return (t /= 0.5) < 1 ? t * t * t * t * t / 2 : (t -= 2) * t * t * t * t / 2 + 1;
	}

	export function easeInSine(t: number) {
		return 1 - Math.cos(t * Math.PI / 2);
	}

	export function easeOutSine(t: number) {
		return Math.sin(t * Math.PI / 2);
	}

	export function easeInOutSine(t: number) {
		return 0.5 - Math.cos(t * Math.PI) / 2;
	}

	export function easeInExpo(t: number) {
		if (t > 0) {
			return Math.pow(2, 10 * t - 10);
		}
		return 0;
	}

	export function easeOutExpo(t: number) {
		var q = (t !== 1) ? 1 : 0;
		return 1 - q * Math.pow(2, -10 * t);
	}

	export function easeInOutExpo(t: number) {
		if (!t || t === 1) {
			return t;
		}
		return (t /= 0.5) < 1 ? Math.pow(2, 10 * t - 10) / 2 : 1 - Math.pow(2, 10 - 10 * t) / 2;
	}

	export function easeInCirc(t: number) {
		return 1 - Math.sqrt(1 - t * t);
	}

	export function easeOutCirc(t: number) {
		return Math.sqrt(--t * -t + 1);
	}

	export function easeInOutCirc(t: number) {
		if ((t /= 0.5) < 1) {
			return -(Math.sqrt(1 - t * t) - 1) / 2;
		}
		return (Math.sqrt(1 - (t -= 2) * t) + 1) / 2;
	}

	export function easeInElastic(t: number) {
		if (!t || t === 1) {
			return t;
		}
		var p = 0.3,
			s = p / (2 * Math.PI) * Math.PI / 2;
		return -Math.pow(2, 10 * --t) * Math.sin((t - s) * 2 * Math.PI / p);
	}

	export function easeOutElastic(t: number) {
		if (!t || t === 1) {
			return t;
		}
		var p = 0.3,
			s = p / (2 * Math.PI) * Math.PI / 2;
		return Math.pow(2, -10 * t) * Math.sin((t - s) * 2 * Math.PI / p) + 1;
	}

	export function easeInOutElastic(t: number) {
		if (!t || t === 1) {
			return t;
		}
		var p = 0.3 * 1.5,
			s = p / (2 * Math.PI) * Math.PI / 2;
		return (t /= 0.5) < 1 ? -Math.pow(2, 10 * --t) * Math.sin((t - s) * 2 * Math.PI / p) / 2 : Math.pow(2, -10 * --t) * Math.sin((t - s) * 2 * Math.PI / p) / 2 + 1;
	}

	export function easeInBack(t: number) {
		var s = 1.70158;
		return t * t * (t * (s + 1) - s);
	}

	export function easeOutBack(t: number) {
		var s = 1.70158;
		return --t * t * ((s + 1) * t + s) + 1;
	}

	export function easeInOutBack(t: number) {
		var s = 1.70158;
		return (t /= 0.5) < 1 ? t * t * (((s *= 1.525) + 1) * t - s) / 2 : (t -= 2) * t * (((s *= 1.525) + 1) * t + s) / 2 + 1;
	}

	export function easeInBounce(t: number) {
		return 1 - easing.easeOutBounce(1 - t);
	}

	export function easeOutBounce(t: number) {
		if (t < 1 / 2.75) {
			return 7.5625 * t * t;
		}
		if (t < 2 / 2.75) {
			return 7.5625 * (t -= (1.5 / 2.75)) * t + 0.75;
		}
		if (t < 2.5 / 2.75) {
			return 7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375;
		}
		return 7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375;
	}

	export function easeInOutBounce(t: number) {
		return t < 0.5 ? easing.easeInBounce(t * 2) / 2 : easing.easeOutBounce(t * 2 - 1) / 2 + 0.5;
	}

}