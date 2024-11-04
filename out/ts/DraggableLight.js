"use strict";
class DraggableLight extends Nitro.Component {
    render(_) {
        const input = this.input;
        const scale = input.scale;
        const lightRadius = 3;
        const lightSize = (lightRadius * 2 * input.scale);
        const lightX = input.lightX - lightSize / 2;
        const lightY = input.lightY - input.lightZ * scale - lightSize / 2;
        const zIndexIndicatorY = input.lightY - (input.lightZ * scale);
        const stickWidth = scale;
        const style = 'position: absolute; display: block; border: 2px solid black; width: ' + (input.width * input.scale) + 'px; height: ' + (input.height * input.scale) + 'px';
        return _.create("div", { style: style, onWheel: this.onWheel },
            _.create("div", { style: 'position: absolute; background-color: red; width: ' + stickWidth + '; height: ' + (input.lightZ * scale) + 'px; left: ' + (input.lightX - stickWidth / 2) + '; top: ' + zIndexIndicatorY + 'px' }),
            _.create("div", { style: 'position: absolute; background-color: yellow; width: ' + lightSize + '; height: ' + lightSize + 'px; border-radius: ' + (lightRadius * scale) + 'px; left: ' + lightX + '; top: ' + lightY + 'px', onPointerDown: this.onPointerDown }));
    }
    onPointerDown = (event) => {
        if (event.button === 0) {
            listenToMouseMoveUntilMouseUp(e => {
                this.input.lightMoved(e.movementX, e.movementY, 0);
            }, e => { }, 'grabbing');
        }
    };
    onWheel = (e) => {
        if (e.deltaY < 0) {
            this.input.lightMoved(0, 0, 1);
        }
        else {
            this.input.lightMoved(0, 0, -1);
        }
        e.preventDefault();
    };
}
function listenToMouseMoveUntilMouseUp(onpointermove, onpointerup = null, cursorOverride = null) {
    // assert(window['onpointermove'] === null);
    // assert(window['onpointerup'] === null);
    window['onpointermove'] = onpointermove;
    if (cursorOverride !== null) {
        document.body.classList.add('force-' + cursorOverride);
    }
    window['onpointerup'] = (e) => {
        window['onpointermove'] = null;
        window['onpointerup'] = null;
        if (cursorOverride !== null) {
            document.body.classList.remove('force-' + cursorOverride);
        }
        if (onpointerup !== null)
            onpointerup(e);
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRHJhZ2dhYmxlTGlnaHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi90cy9EcmFnZ2FibGVMaWdodC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE1BQU0sY0FBZSxTQUFRLEtBQUssQ0FBQyxTQUF1STtJQUV6SyxNQUFNLENBQUMsQ0FBa0I7UUFDeEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN6QixNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO1FBRTFCLE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQztRQUN0QixNQUFNLFNBQVMsR0FBRyxDQUFDLFdBQVcsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xELE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsU0FBUyxHQUFDLENBQUMsQ0FBQztRQUMxQyxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxHQUFHLFNBQVMsR0FBQyxDQUFDLENBQUM7UUFFakUsTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQztRQUUvRCxNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFFekIsTUFBTSxLQUFLLEdBQUcsc0VBQXNFLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxjQUFjLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDMUssT0FBTyxrQkFBSyxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztZQUM5QyxrQkFBSyxLQUFLLEVBQUUsb0RBQW9ELEdBQUcsVUFBVSxHQUFHLFlBQVksR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLEdBQUcsWUFBWSxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxVQUFVLEdBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxHQUFHLGdCQUFnQixHQUFHLElBQUksR0FBUTtZQUNsTixrQkFBSyxLQUFLLEVBQUUsdURBQXVELEdBQUcsU0FBUyxHQUFHLFlBQVksR0FBRyxTQUFTLEdBQUcscUJBQXFCLEdBQUcsQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLEdBQUcsWUFBWSxHQUFHLE1BQU0sR0FBRyxTQUFTLEdBQUcsTUFBTSxHQUFHLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxDQUFDLGFBQWEsR0FBUSxDQUNwUCxDQUFDO0lBQ1IsQ0FBQztJQUVELGFBQWEsR0FBRyxDQUFDLEtBQWlCLEVBQUUsRUFBRTtRQUNyQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDeEIsNkJBQTZCLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2pDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNwRCxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRSxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDekIsQ0FBQztJQUNGLENBQUMsQ0FBQTtJQUVPLE9BQU8sR0FBRyxDQUFDLENBQWEsRUFBRSxFQUFFO1FBQ25DLElBQUksQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUNsQixJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLENBQUM7YUFDSSxDQUFDO1lBQ0wsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFDRCxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDcEIsQ0FBQyxDQUFDO0NBRUY7QUFFRCxTQUFTLDZCQUE2QixDQUFDLGFBQXNDLEVBQUUsY0FBZ0QsSUFBSSxFQUFFLGlCQUFnQyxJQUFJO0lBQ3hLLDRDQUE0QztJQUM1QywwQ0FBMEM7SUFDMUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxHQUFHLGFBQWEsQ0FBQztJQUN4QyxJQUFJLGNBQWMsS0FBSyxJQUFJLEVBQUUsQ0FBQztRQUM3QixRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxHQUFHLGNBQWMsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFDRCxNQUFNLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFhLEVBQUUsRUFBRTtRQUN6QyxNQUFNLENBQUMsZUFBZSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQy9CLE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDN0IsSUFBSSxjQUFjLEtBQUssSUFBSSxFQUFFLENBQUM7WUFDN0IsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxjQUFjLENBQUMsQ0FBQztRQUMzRCxDQUFDO1FBQ0QsSUFBSSxXQUFXLEtBQUssSUFBSTtZQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQyxDQUFDLENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgRHJhZ2dhYmxlTGlnaHQgZXh0ZW5kcyBOaXRyby5Db21wb25lbnQ8eyBzY2FsZTogaW50LCB3aWR0aDogaW50LCBoZWlnaHQ6IGludCwgbGlnaHRYOiBpbnQsIGxpZ2h0WTogaW50LCBsaWdodFo6IGludCwgbGlnaHRNb3ZlZDogKHg6IGludCwgeTogaW50LCB6OiBpbnQpID0+IHZvaWQgfT4ge1xuXG5cdHJlbmRlcihfPzogTml0cm8uUmVuZGVyZXIpOiB2b2lkIHwgSFRNTEVsZW1lbnQge1xuXHRcdGNvbnN0IGlucHV0ID0gdGhpcy5pbnB1dDtcblx0XHRjb25zdCBzY2FsZSA9IGlucHV0LnNjYWxlO1xuXG5cdFx0Y29uc3QgbGlnaHRSYWRpdXMgPSAzO1xuXHRcdGNvbnN0IGxpZ2h0U2l6ZSA9IChsaWdodFJhZGl1cyAqIDIgKiBpbnB1dC5zY2FsZSk7XG5cdFx0Y29uc3QgbGlnaHRYID0gaW5wdXQubGlnaHRYIC0gbGlnaHRTaXplLzI7XG5cdFx0Y29uc3QgbGlnaHRZID0gaW5wdXQubGlnaHRZIC0gaW5wdXQubGlnaHRaICogc2NhbGUgLSBsaWdodFNpemUvMjtcblxuXHRcdGNvbnN0IHpJbmRleEluZGljYXRvclkgPSBpbnB1dC5saWdodFkgLSAoaW5wdXQubGlnaHRaICogc2NhbGUpO1xuXG5cdFx0Y29uc3Qgc3RpY2tXaWR0aCA9IHNjYWxlO1xuXG5cdFx0Y29uc3Qgc3R5bGUgPSAncG9zaXRpb246IGFic29sdXRlOyBkaXNwbGF5OiBibG9jazsgYm9yZGVyOiAycHggc29saWQgYmxhY2s7IHdpZHRoOiAnICsgKGlucHV0LndpZHRoICogaW5wdXQuc2NhbGUpICsgJ3B4OyBoZWlnaHQ6ICcgKyAoaW5wdXQuaGVpZ2h0ICogaW5wdXQuc2NhbGUpICsgJ3B4Jztcblx0XHRyZXR1cm4gPGRpdiBzdHlsZT17c3R5bGV9IG9uV2hlZWw9e3RoaXMub25XaGVlbH0+XG5cdFx0XHQ8ZGl2IHN0eWxlPXsncG9zaXRpb246IGFic29sdXRlOyBiYWNrZ3JvdW5kLWNvbG9yOiByZWQ7IHdpZHRoOiAnICsgc3RpY2tXaWR0aCArICc7IGhlaWdodDogJyArIChpbnB1dC5saWdodFogKiBzY2FsZSkgKyAncHg7IGxlZnQ6ICcgKyAoaW5wdXQubGlnaHRYIC0gc3RpY2tXaWR0aC8yKSArICc7IHRvcDogJyArIHpJbmRleEluZGljYXRvclkgKyAncHgnfT48L2Rpdj5cblx0XHRcdDxkaXYgc3R5bGU9eydwb3NpdGlvbjogYWJzb2x1dGU7IGJhY2tncm91bmQtY29sb3I6IHllbGxvdzsgd2lkdGg6ICcgKyBsaWdodFNpemUgKyAnOyBoZWlnaHQ6ICcgKyBsaWdodFNpemUgKyAncHg7IGJvcmRlci1yYWRpdXM6ICcgKyAobGlnaHRSYWRpdXMgKiBzY2FsZSkgKyAncHg7IGxlZnQ6ICcgKyBsaWdodFggKyAnOyB0b3A6ICcgKyBsaWdodFkgKyAncHgnfSBvblBvaW50ZXJEb3duPXt0aGlzLm9uUG9pbnRlckRvd259PjwvZGl2PlxuXHRcdDwvZGl2Pjtcblx0fVxuXG5cdG9uUG9pbnRlckRvd24gPSAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IHtcblx0XHRpZiAoZXZlbnQuYnV0dG9uID09PSAwKSB7XG5cdFx0XHRsaXN0ZW5Ub01vdXNlTW92ZVVudGlsTW91c2VVcChlID0+IHtcblx0XHRcdFx0dGhpcy5pbnB1dC5saWdodE1vdmVkKGUubW92ZW1lbnRYLCBlLm1vdmVtZW50WSwgMCk7XG5cdFx0XHR9LCBlID0+IHt9LCAnZ3JhYmJpbmcnKTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIG9uV2hlZWwgPSAoZTogV2hlZWxFdmVudCkgPT4ge1xuXHRcdGlmIChlLmRlbHRhWSA8IDApIHtcblx0XHRcdHRoaXMuaW5wdXQubGlnaHRNb3ZlZCgwLCAwLCAxKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHR0aGlzLmlucHV0LmxpZ2h0TW92ZWQoMCwgMCwgLTEpO1xuXHRcdH1cblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdH07XG5cbn1cblxuZnVuY3Rpb24gbGlzdGVuVG9Nb3VzZU1vdmVVbnRpbE1vdXNlVXAob25wb2ludGVybW92ZTogKGU6IE1vdXNlRXZlbnQpID0+IHZvaWQsIG9ucG9pbnRlcnVwOiAoKGU6IE1vdXNlRXZlbnQpID0+IHZvaWQpIHwgbnVsbCA9IG51bGwsIGN1cnNvck92ZXJyaWRlOiBzdHJpbmcgfCBudWxsID0gbnVsbCkge1xuXHQvLyBhc3NlcnQod2luZG93WydvbnBvaW50ZXJtb3ZlJ10gPT09IG51bGwpO1xuXHQvLyBhc3NlcnQod2luZG93WydvbnBvaW50ZXJ1cCddID09PSBudWxsKTtcblx0d2luZG93WydvbnBvaW50ZXJtb3ZlJ10gPSBvbnBvaW50ZXJtb3ZlO1xuXHRpZiAoY3Vyc29yT3ZlcnJpZGUgIT09IG51bGwpIHtcblx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ2ZvcmNlLScgKyBjdXJzb3JPdmVycmlkZSk7XG5cdH1cblx0d2luZG93WydvbnBvaW50ZXJ1cCddID0gKGU6IE1vdXNlRXZlbnQpID0+IHtcblx0XHR3aW5kb3dbJ29ucG9pbnRlcm1vdmUnXSA9IG51bGw7XG5cdFx0d2luZG93WydvbnBvaW50ZXJ1cCddID0gbnVsbDtcblx0XHRpZiAoY3Vyc29yT3ZlcnJpZGUgIT09IG51bGwpIHtcblx0XHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnZm9yY2UtJyArIGN1cnNvck92ZXJyaWRlKTtcblx0XHR9XG5cdFx0aWYgKG9ucG9pbnRlcnVwICE9PSBudWxsKSBvbnBvaW50ZXJ1cChlKTtcblx0fTtcbn0iXX0=