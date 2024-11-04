"use strict";
/*
Notes:
    Each function accepts a single argument, the current position of the animation's elapsed time across its duration, between 0 and 1
    Each function then returns a number between 0 and 1, determining how far along the effects of the animation should have progressed
    Helpful links:
        http://gsgd.co.uk/sandbox/jquery/easing/
        http://stackoverflow.com/questions/5916058/jquery-easing-function
*/
var easing;
(function (easing) {
    function linear(t) {
        return t;
    }
    easing.linear = linear;
    function easeInQuad(t) {
        return t * t;
    }
    easing.easeInQuad = easeInQuad;
    function easeOutQuad(t) {
        return t * (2 - t);
    }
    easing.easeOutQuad = easeOutQuad;
    function easeInOutQuad(t) {
        return ((t /= 0.5) < 1 ? t * t : (1 - t) * (t - 3) + 1) / 2;
    }
    easing.easeInOutQuad = easeInOutQuad;
    function easeInCubic(t) {
        return t * t * t;
    }
    easing.easeInCubic = easeInCubic;
    function easeOutCubic(t) {
        return --t * t * t + 1;
    }
    easing.easeOutCubic = easeOutCubic;
    function easeInOutCubic(t) {
        return (t /= 0.5) < 1 ? t * t * t / 2 : (t -= 2) * t * t / 2 + 1;
    }
    easing.easeInOutCubic = easeInOutCubic;
    function easeInQuart(t) {
        return t * t * t * t;
    }
    easing.easeInQuart = easeInQuart;
    function easeOutQuart(t) {
        return --t * t * t * -t + 1;
    }
    easing.easeOutQuart = easeOutQuart;
    function easeInOutQuart(t) {
        return (t /= 0.5) < 1 ? t * t * t * t / 2 : 1 - (t -= 2) * t * t * t / 2;
    }
    easing.easeInOutQuart = easeInOutQuart;
    function easeInQuint(t) {
        return t * t * t * t * t;
    }
    easing.easeInQuint = easeInQuint;
    function easeOutQuint(t) {
        return --t * t * t * t * t + 1;
    }
    easing.easeOutQuint = easeOutQuint;
    function easeInOutQuint(t) {
        return (t /= 0.5) < 1 ? t * t * t * t * t / 2 : (t -= 2) * t * t * t * t / 2 + 1;
    }
    easing.easeInOutQuint = easeInOutQuint;
    function easeInSine(t) {
        return 1 - Math.cos(t * Math.PI / 2);
    }
    easing.easeInSine = easeInSine;
    function easeOutSine(t) {
        return Math.sin(t * Math.PI / 2);
    }
    easing.easeOutSine = easeOutSine;
    function easeInOutSine(t) {
        return 0.5 - Math.cos(t * Math.PI) / 2;
    }
    easing.easeInOutSine = easeInOutSine;
    function easeInExpo(t) {
        if (t > 0) {
            return Math.pow(2, 10 * t - 10);
        }
        return 0;
    }
    easing.easeInExpo = easeInExpo;
    function easeOutExpo(t) {
        var q = (t !== 1) ? 1 : 0;
        return 1 - q * Math.pow(2, -10 * t);
    }
    easing.easeOutExpo = easeOutExpo;
    function easeInOutExpo(t) {
        if (!t || t === 1) {
            return t;
        }
        return (t /= 0.5) < 1 ? Math.pow(2, 10 * t - 10) / 2 : 1 - Math.pow(2, 10 - 10 * t) / 2;
    }
    easing.easeInOutExpo = easeInOutExpo;
    function easeInCirc(t) {
        return 1 - Math.sqrt(1 - t * t);
    }
    easing.easeInCirc = easeInCirc;
    function easeOutCirc(t) {
        return Math.sqrt(--t * -t + 1);
    }
    easing.easeOutCirc = easeOutCirc;
    function easeInOutCirc(t) {
        if ((t /= 0.5) < 1) {
            return -(Math.sqrt(1 - t * t) - 1) / 2;
        }
        return (Math.sqrt(1 - (t -= 2) * t) + 1) / 2;
    }
    easing.easeInOutCirc = easeInOutCirc;
    function easeInElastic(t) {
        if (!t || t === 1) {
            return t;
        }
        var p = 0.3, s = p / (2 * Math.PI) * Math.PI / 2;
        return -Math.pow(2, 10 * --t) * Math.sin((t - s) * 2 * Math.PI / p);
    }
    easing.easeInElastic = easeInElastic;
    function easeOutElastic(t) {
        if (!t || t === 1) {
            return t;
        }
        var p = 0.3, s = p / (2 * Math.PI) * Math.PI / 2;
        return Math.pow(2, -10 * t) * Math.sin((t - s) * 2 * Math.PI / p) + 1;
    }
    easing.easeOutElastic = easeOutElastic;
    function easeInOutElastic(t) {
        if (!t || t === 1) {
            return t;
        }
        var p = 0.3 * 1.5, s = p / (2 * Math.PI) * Math.PI / 2;
        return (t /= 0.5) < 1 ? -Math.pow(2, 10 * --t) * Math.sin((t - s) * 2 * Math.PI / p) / 2 : Math.pow(2, -10 * --t) * Math.sin((t - s) * 2 * Math.PI / p) / 2 + 1;
    }
    easing.easeInOutElastic = easeInOutElastic;
    function easeInBack(t) {
        var s = 1.70158;
        return t * t * (t * (s + 1) - s);
    }
    easing.easeInBack = easeInBack;
    function easeOutBack(t) {
        var s = 1.70158;
        return --t * t * ((s + 1) * t + s) + 1;
    }
    easing.easeOutBack = easeOutBack;
    function easeInOutBack(t) {
        var s = 1.70158;
        return (t /= 0.5) < 1 ? t * t * (((s *= 1.525) + 1) * t - s) / 2 : (t -= 2) * t * (((s *= 1.525) + 1) * t + s) / 2 + 1;
    }
    easing.easeInOutBack = easeInOutBack;
    function easeInBounce(t) {
        return 1 - easing.easeOutBounce(1 - t);
    }
    easing.easeInBounce = easeInBounce;
    function easeOutBounce(t) {
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
    easing.easeOutBounce = easeOutBounce;
    function easeInOutBounce(t) {
        return t < 0.5 ? easing.easeInBounce(t * 2) / 2 : easing.easeOutBounce(t * 2 - 1) / 2 + 0.5;
    }
    easing.easeInOutBounce = easeInOutBounce;
})(easing || (easing = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWFzaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdHMvZWFzaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7OztFQU9FO0FBRUYsSUFBVSxNQUFNLENBbUtmO0FBbktELFdBQVUsTUFBTTtJQUVmLFNBQWdCLE1BQU0sQ0FBQyxDQUFTO1FBQy9CLE9BQU8sQ0FBQyxDQUFDO0lBQ1YsQ0FBQztJQUZlLGFBQU0sU0FFckIsQ0FBQTtJQUVELFNBQWdCLFVBQVUsQ0FBQyxDQUFTO1FBQ25DLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNkLENBQUM7SUFGZSxpQkFBVSxhQUV6QixDQUFBO0lBRUQsU0FBZ0IsV0FBVyxDQUFDLENBQVM7UUFDcEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDcEIsQ0FBQztJQUZlLGtCQUFXLGNBRTFCLENBQUE7SUFFRCxTQUFnQixhQUFhLENBQUMsQ0FBUztRQUN0QyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUZlLG9CQUFhLGdCQUU1QixDQUFBO0lBRUQsU0FBZ0IsV0FBVyxDQUFDLENBQVM7UUFDcEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBRmUsa0JBQVcsY0FFMUIsQ0FBQTtJQUVELFNBQWdCLFlBQVksQ0FBQyxDQUFTO1FBQ3JDLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUZlLG1CQUFZLGVBRTNCLENBQUE7SUFFRCxTQUFn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QyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO0lBQzdGLENBQUM7SUFGZSxzQkFBZSxrQkFFOUIsQ0FBQTtBQUVGLENBQUMsRUFuS1MsTUFBTSxLQUFOLE1BQU0sUUFtS2YiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuTm90ZXM6XG5cdEVhY2ggZnVuY3Rpb24gYWNjZXB0cyBhIHNpbmdsZSBhcmd1bWVudCwgdGhlIGN1cnJlbnQgcG9zaXRpb24gb2YgdGhlIGFuaW1hdGlvbidzIGVsYXBzZWQgdGltZSBhY3Jvc3MgaXRzIGR1cmF0aW9uLCBiZXR3ZWVuIDAgYW5kIDFcblx0RWFjaCBmdW5jdGlvbiB0aGVuIHJldHVybnMgYSBudW1iZXIgYmV0d2VlbiAwIGFuZCAxLCBkZXRlcm1pbmluZyBob3cgZmFyIGFsb25nIHRoZSBlZmZlY3RzIG9mIHRoZSBhbmltYXRpb24gc2hvdWxkIGhhdmUgcHJvZ3Jlc3NlZFxuXHRIZWxwZnVsIGxpbmtzOlxuXHRcdGh0dHA6Ly9nc2dkLmNvLnVrL3NhbmRib3gvanF1ZXJ5L2Vhc2luZy9cblx0XHRodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzU5MTYwNTgvanF1ZXJ5LWVhc2luZy1mdW5jdGlvblxuKi9cblxubmFtZXNwYWNlIGVhc2luZyB7XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIGxpbmVhcih0OiBudW1iZXIpIHtcblx0XHRyZXR1cm4gdDtcblx0fVxuXG5cdGV4cG9ydCBmdW5jdGlvbiBlYXNlSW5RdWFkKHQ6IG51bWJlcikge1xuXHRcdHJldHVybiB0ICogdDtcblx0fVxuXG5cdGV4cG9ydCBmdW5jdGlvbiBlYXNlT3V0UXVhZCh0OiBudW1iZXIpIHtcblx0XHRyZXR1cm4gdCAqICgyIC0gdCk7XG5cdH1cblxuXHRleHBvcnQgZnVuY3Rpb24gZWFzZUluT3V0UXVhZCh0OiBudW1iZXIpIHtcblx0XHRyZXR1cm4gKCh0IC89IDAuNSkgPCAxID8gdCAqIHQgOiAoMSAtIHQpICogKHQgLSAzKSArIDEpIC8gMjtcblx0fVxuXG5cdGV4cG9ydCBmdW5jdGlvbiBlYXNlSW5DdWJpYyh0OiBudW1iZXIpIHtcblx0XHRyZXR1cm4gdCAqIHQgKiB0O1xuXHR9XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIGVhc2VPdXRDdWJpYyh0OiBudW1iZXIpIHtcblx0XHRyZXR1cm4gLS10ICogdCAqIHQgKyAxO1xuXHR9XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIGVhc2VJbk91dEN1YmljKHQ6IG51bWJlcikge1xuXHRcdHJldHVybiAodCAvPSAwLjUpIDwgMSA/IHQgKiB0ICogdCAvIDIgOiAodCAtPSAyKSAqIHQgKiB0IC8gMiArIDE7XG5cdH1cblxuXHRleHBvcnQgZnVuY3Rpb24gZWFzZUluUXVhcnQodDogbnVtYmVyKSB7XG5cdFx0cmV0dXJuIHQgKiB0ICogdCAqIHQ7XG5cdH1cblxuXHRleHBvcnQgZnVuY3Rpb24gZWFzZU91dFF1YXJ0KHQ6IG51bWJlcikge1xuXHRcdHJldHVybiAtLXQgKiB0ICogdCAqIC10ICsgMTtcblx0fVxuXG5cdGV4cG9ydCBmdW5jdGlvbiBlYXNlSW5PdXRRdWFydCh0OiBudW1iZXIpIHtcblx0XHRyZXR1cm4gKHQgLz0gMC41KSA8IDEgPyB0ICogdCAqIHQgKiB0IC8gMiA6IDEgLSAodCAtPSAyKSAqIHQgKiB0ICogdCAvIDI7XG5cdH1cblxuXHRleHBvcnQgZnVuY3Rpb24gZWFzZUluUXVpbnQodDogbnVtYmVyKSB7XG5cdFx0cmV0dXJuIHQgKiB0ICogdCAqIHQgKiB0O1xuXHR9XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIGVhc2VPdXRRdWludCh0OiBudW1iZXIpIHtcblx0XHRyZXR1cm4gLS10ICogdCAqIHQgKiB0ICogdCArIDE7XG5cdH1cblxuXHRleHBvcnQgZnVuY3Rpb24gZWFzZUluT3V0UXVpbnQodDogbnVtYmVyKSB7XG5cdFx0cmV0dXJuICh0IC89IDAuNSkgPCAxID8gdCAqIHQgKiB0ICogdCAqIHQgLyAyIDogKHQgLT0gMikgKiB0ICogdCAqIHQgKiB0IC8gMiArIDE7XG5cdH1cblxuXHRleHBvcnQgZnVuY3Rpb24gZWFzZUluU2luZSh0OiBudW1iZXIpIHtcblx0XHRyZXR1cm4gMSAtIE1hdGguY29zKHQgKiBNYXRoLlBJIC8gMik7XG5cdH1cblxuXHRleHBvcnQgZnVuY3Rpb24gZWFzZU91dFNpbmUodDogbnVtYmVyKSB7XG5cdFx0cmV0dXJuIE1hdGguc2luKHQgKiBNYXRoLlBJIC8gMik7XG5cdH1cblxuXHRleHBvcnQgZnVuY3Rpb24gZWFzZUluT3V0U2luZSh0OiBudW1iZXIpIHtcblx0XHRyZXR1cm4gMC41IC0gTWF0aC5jb3ModCAqIE1hdGguUEkpIC8gMjtcblx0fVxuXG5cdGV4cG9ydCBmdW5jdGlvbiBlYXNlSW5FeHBvKHQ6IG51bWJlcikge1xuXHRcdGlmICh0ID4gMCkge1xuXHRcdFx0cmV0dXJuIE1hdGgucG93KDIsIDEwICogdCAtIDEwKTtcblx0XHR9XG5cdFx0cmV0dXJuIDA7XG5cdH1cblxuXHRleHBvcnQgZnVuY3Rpb24gZWFzZU91dEV4cG8odDogbnVtYmVyKSB7XG5cdFx0dmFyIHEgPSAodCAhPT0gMSkgPyAxIDogMDtcblx0XHRyZXR1cm4gMSAtIHEgKiBNYXRoLnBvdygyLCAtMTAgKiB0KTtcblx0fVxuXG5cdGV4cG9ydCBmdW5jdGlvbiBlYXNlSW5PdXRFeHBvKHQ6IG51bWJlcikge1xuXHRcdGlmICghdCB8fCB0ID09PSAxKSB7XG5cdFx0XHRyZXR1cm4gdDtcblx0XHR9XG5cdFx0cmV0dXJuICh0IC89IDAuNSkgPCAxID8gTWF0aC5wb3coMiwgMTAgKiB0IC0gMTApIC8gMiA6IDEgLSBNYXRoLnBvdygyLCAxMCAtIDEwICogdCkgLyAyO1xuXHR9XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIGVhc2VJbkNpcmModDogbnVtYmVyKSB7XG5cdFx0cmV0dXJuIDEgLSBNYXRoLnNxcnQoMSAtIHQgKiB0KTtcblx0fVxuXG5cdGV4cG9ydCBmdW5jdGlvbiBlYXNlT3V0Q2lyYyh0OiBudW1iZXIpIHtcblx0XHRyZXR1cm4gTWF0aC5zcXJ0KC0tdCAqIC10ICsgMSk7XG5cdH1cblxuXHRleHBvcnQgZnVuY3Rpb24gZWFzZUluT3V0Q2lyYyh0OiBudW1iZXIpIHtcblx0XHRpZiAoKHQgLz0gMC41KSA8IDEpIHtcblx0XHRcdHJldHVybiAtKE1hdGguc3FydCgxIC0gdCAqIHQpIC0gMSkgLyAyO1xuXHRcdH1cblx0XHRyZXR1cm4gKE1hdGguc3FydCgxIC0gKHQgLT0gMikgKiB0KSArIDEpIC8gMjtcblx0fVxuXG5cdGV4cG9ydCBmdW5jdGlvbiBlYXNlSW5FbGFzdGljKHQ6IG51bWJlcikge1xuXHRcdGlmICghdCB8fCB0ID09PSAxKSB7XG5cdFx0XHRyZXR1cm4gdDtcblx0XHR9XG5cdFx0dmFyIHAgPSAwLjMsXG5cdFx0XHRzID0gcCAvICgyICogTWF0aC5QSSkgKiBNYXRoLlBJIC8gMjtcblx0XHRyZXR1cm4gLU1hdGgucG93KDIsIDEwICogLS10KSAqIE1hdGguc2luKCh0IC0gcykgKiAyICogTWF0aC5QSSAvIHApO1xuXHR9XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIGVhc2VPdXRFbGFzdGljKHQ6IG51bWJlcikge1xuXHRcdGlmICghdCB8fCB0ID09PSAxKSB7XG5cdFx0XHRyZXR1cm4gdDtcblx0XHR9XG5cdFx0dmFyIHAgPSAwLjMsXG5cdFx0XHRzID0gcCAvICgyICogTWF0aC5QSSkgKiBNYXRoLlBJIC8gMjtcblx0XHRyZXR1cm4gTWF0aC5wb3coMiwgLTEwICogdCkgKiBNYXRoLnNpbigodCAtIHMpICogMiAqIE1hdGguUEkgLyBwKSArIDE7XG5cdH1cblxuXHRleHBvcnQgZnVuY3Rpb24gZWFzZUluT3V0RWxhc3RpYyh0OiBudW1iZXIpIHtcblx0XHRpZiAoIXQgfHwgdCA9PT0gMSkge1xuXHRcdFx0cmV0dXJuIHQ7XG5cdFx0fVxuXHRcdHZhciBwID0gMC4zICogMS41LFxuXHRcdFx0cyA9IHAgLyAoMiAqIE1hdGguUEkpICogTWF0aC5QSSAvIDI7XG5cdFx0cmV0dXJuICh0IC89IDAuNSkgPCAxID8gLU1hdGgucG93KDIsIDEwICogLS10KSAqIE1hdGguc2luKCh0IC0gcykgKiAyICogTWF0aC5QSSAvIHApIC8gMiA6IE1hdGgucG93KDIsIC0xMCAqIC0tdCkgKiBNYXRoLnNpbigodCAtIHMpICogMiAqIE1hdGguUEkgLyBwKSAvIDIgKyAxO1xuXHR9XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIGVhc2VJbkJhY2sodDogbnVtYmVyKSB7XG5cdFx0dmFyIHMgPSAxLjcwMTU4O1xuXHRcdHJldHVybiB0ICogdCAqICh0ICogKHMgKyAxKSAtIHMpO1xuXHR9XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIGVhc2VPdXRCYWNrKHQ6IG51bWJlcikge1xuXHRcdHZhciBzID0gMS43MDE1ODtcblx0XHRyZXR1cm4gLS10ICogdCAqICgocyArIDEpICogdCArIHMpICsgMTtcblx0fVxuXG5cdGV4cG9ydCBmdW5jdGlvbiBlYXNlSW5PdXRCYWNrKHQ6IG51bWJlcikge1xuXHRcdHZhciBzID0gMS43MDE1ODtcblx0XHRyZXR1cm4gKHQgLz0gMC41KSA8IDEgPyB0ICogdCAqICgoKHMgKj0gMS41MjUpICsgMSkgKiB0IC0gcykgLyAyIDogKHQgLT0gMikgKiB0ICogKCgocyAqPSAxLjUyNSkgKyAxKSAqIHQgKyBzKSAvIDIgKyAxO1xuXHR9XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIGVhc2VJbkJvdW5jZSh0OiBudW1iZXIpIHtcblx0XHRyZXR1cm4gMSAtIGVhc2luZy5lYXNlT3V0Qm91bmNlKDEgLSB0KTtcblx0fVxuXG5cdGV4cG9ydCBmdW5jdGlvbiBlYXNlT3V0Qm91bmNlKHQ6IG51bWJlcikge1xuXHRcdGlmICh0IDwgMSAvIDIuNzUpIHtcblx0XHRcdHJldHVybiA3LjU2MjUgKiB0ICogdDtcblx0XHR9XG5cdFx0aWYgKHQgPCAyIC8gMi43NSkge1xuXHRcdFx0cmV0dXJuIDcuNTYyNSAqICh0IC09ICgxLjUgLyAyLjc1KSkgKiB0ICsgMC43NTtcblx0XHR9XG5cdFx0aWYgKHQgPCAyLjUgLyAyLjc1KSB7XG5cdFx0XHRyZXR1cm4gNy41NjI1ICogKHQgLT0gKDIuMjUgLyAyLjc1KSkgKiB0ICsgMC45Mzc1O1xuXHRcdH1cblx0XHRyZXR1cm4gNy41NjI1ICogKHQgLT0gKDIuNjI1IC8gMi43NSkpICogdCArIDAuOTg0Mzc1O1xuXHR9XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIGVhc2VJbk91dEJvdW5jZSh0OiBudW1iZXIpIHtcblx0XHRyZXR1cm4gdCA8IDAuNSA/IGVhc2luZy5lYXNlSW5Cb3VuY2UodCAqIDIpIC8gMiA6IGVhc2luZy5lYXNlT3V0Qm91bmNlKHQgKiAyIC0gMSkgLyAyICsgMC41O1xuXHR9XG5cbn0iXX0=