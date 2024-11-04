"use strict";
var Images;
(function (Images) {
    var images = {};
    var callbacks = {};
    function load(filepath, callback = null) {
        const currentImage = images[filepath];
        if (currentImage !== undefined && currentImage.complete) {
            // Already loaded
            if (callback !== null)
                callback(filepath, currentImage);
        }
        else {
            if (currentImage === undefined) {
                // Load the image
                const image = document.createElement('img');
                image.crossOrigin = 'anonymous';
                image.onload = () => fireCallbacksFor(filepath, image);
                images[filepath] = image;
                image.src = filepath;
            }
            if (callback !== null) {
                // Add the callback
                const currentCallbacks = callbacks[filepath];
                if (currentCallbacks === undefined) {
                    callbacks[filepath] = [callback];
                }
                else {
                    currentCallbacks.push(callback);
                }
            }
        }
    }
    Images.load = load;
    function fireCallbacksFor(filepath, image) {
        const currentCallbacks = callbacks[filepath];
        if (currentCallbacks !== undefined) {
            for (let cb of currentCallbacks) {
                cb(filepath, image);
            }
            delete callbacks[filepath];
        }
    }
})(Images || (Images = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW1hZ2VzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdHMvSW1hZ2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFFQSxJQUFVLE1BQU0sQ0EyQ2Y7QUEzQ0QsV0FBVSxNQUFNO0lBRWYsSUFBSSxNQUFNLEdBQTZDLEVBQUUsQ0FBQztJQUMxRCxJQUFJLFNBQVMsR0FBa0QsRUFBRSxDQUFDO0lBRWxFLFNBQWdCLElBQUksQ0FBQyxRQUFnQixFQUFFLFdBQXVDLElBQUk7UUFDakYsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3RDLElBQUksWUFBWSxLQUFLLFNBQVMsSUFBSSxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDekQsaUJBQWlCO1lBQ2pCLElBQUksUUFBUSxLQUFLLElBQUk7Z0JBQUUsUUFBUSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUN6RCxDQUFDO2FBQ0ksQ0FBQztZQUNMLElBQUksWUFBWSxLQUFLLFNBQVMsRUFBRSxDQUFDO2dCQUNoQyxpQkFBaUI7Z0JBQ2pCLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzVDLEtBQUssQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO2dCQUNoQyxLQUFLLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDdkQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEtBQUssQ0FBQztnQkFDekIsS0FBSyxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUM7WUFDdEIsQ0FBQztZQUNELElBQUksUUFBUSxLQUFLLElBQUksRUFBRSxDQUFDO2dCQUN2QixtQkFBbUI7Z0JBQ25CLE1BQU0sZ0JBQWdCLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM3QyxJQUFJLGdCQUFnQixLQUFLLFNBQVMsRUFBRSxDQUFDO29CQUNwQyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDbEMsQ0FBQztxQkFDSSxDQUFDO29CQUNMLGdCQUFnQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDakMsQ0FBQztZQUNGLENBQUM7UUFDRixDQUFDO0lBQ0YsQ0FBQztJQTFCZSxXQUFJLE9BMEJuQixDQUFBO0lBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxRQUFnQixFQUFFLEtBQXVCO1FBQ2xFLE1BQU0sZ0JBQWdCLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzdDLElBQUksZ0JBQWdCLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDcEMsS0FBSyxJQUFJLEVBQUUsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO2dCQUNqQyxFQUFFLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3JCLENBQUM7WUFDRCxPQUFPLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM1QixDQUFDO0lBQ0YsQ0FBQztBQUVGLENBQUMsRUEzQ1MsTUFBTSxLQUFOLE1BQU0sUUEyQ2YiLCJzb3VyY2VzQ29udGVudCI6WyJ0eXBlIEltYWdlTG9hZGVkQ2FsbGJhY2sgPSAoZmlsZXBhdGg6IHN0cmluZywgaW1hZ2U6IEhUTUxJbWFnZUVsZW1lbnQpID0+IHZvaWQ7XG5cbm5hbWVzcGFjZSBJbWFnZXMge1xuXG5cdHZhciBpbWFnZXM6IHsgW2ZpbGVwYXRoOiBzdHJpbmddOiBIVE1MSW1hZ2VFbGVtZW50IH0gPSB7fTtcblx0dmFyIGNhbGxiYWNrczogeyBbZmlsZXBhdGg6IHN0cmluZ106IEltYWdlTG9hZGVkQ2FsbGJhY2tbXSB9ID0ge307XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIGxvYWQoZmlsZXBhdGg6IHN0cmluZywgY2FsbGJhY2s6IEltYWdlTG9hZGVkQ2FsbGJhY2sgfCBudWxsID0gbnVsbCkge1xuXHRcdGNvbnN0IGN1cnJlbnRJbWFnZSA9IGltYWdlc1tmaWxlcGF0aF07XG5cdFx0aWYgKGN1cnJlbnRJbWFnZSAhPT0gdW5kZWZpbmVkICYmIGN1cnJlbnRJbWFnZS5jb21wbGV0ZSkge1xuXHRcdFx0Ly8gQWxyZWFkeSBsb2FkZWRcblx0XHRcdGlmIChjYWxsYmFjayAhPT0gbnVsbCkgY2FsbGJhY2soZmlsZXBhdGgsIGN1cnJlbnRJbWFnZSk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0aWYgKGN1cnJlbnRJbWFnZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdC8vIExvYWQgdGhlIGltYWdlXG5cdFx0XHRcdGNvbnN0IGltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG5cdFx0XHRcdGltYWdlLmNyb3NzT3JpZ2luID0gJ2Fub255bW91cyc7XG5cdFx0XHRcdGltYWdlLm9ubG9hZCA9ICgpID0+IGZpcmVDYWxsYmFja3NGb3IoZmlsZXBhdGgsIGltYWdlKTtcblx0XHRcdFx0aW1hZ2VzW2ZpbGVwYXRoXSA9IGltYWdlO1xuXHRcdFx0XHRpbWFnZS5zcmMgPSBmaWxlcGF0aDtcblx0XHRcdH1cblx0XHRcdGlmIChjYWxsYmFjayAhPT0gbnVsbCkge1xuXHRcdFx0XHQvLyBBZGQgdGhlIGNhbGxiYWNrXG5cdFx0XHRcdGNvbnN0IGN1cnJlbnRDYWxsYmFja3MgPSBjYWxsYmFja3NbZmlsZXBhdGhdO1xuXHRcdFx0XHRpZiAoY3VycmVudENhbGxiYWNrcyA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2tzW2ZpbGVwYXRoXSA9IFtjYWxsYmFja107XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Y3VycmVudENhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGZpcmVDYWxsYmFja3NGb3IoZmlsZXBhdGg6IHN0cmluZywgaW1hZ2U6IEhUTUxJbWFnZUVsZW1lbnQpIHtcblx0XHRjb25zdCBjdXJyZW50Q2FsbGJhY2tzID0gY2FsbGJhY2tzW2ZpbGVwYXRoXTtcblx0XHRpZiAoY3VycmVudENhbGxiYWNrcyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRmb3IgKGxldCBjYiBvZiBjdXJyZW50Q2FsbGJhY2tzKSB7XG5cdFx0XHRcdGNiKGZpbGVwYXRoLCBpbWFnZSk7XG5cdFx0XHR9XG5cdFx0XHRkZWxldGUgY2FsbGJhY2tzW2ZpbGVwYXRoXTtcblx0XHR9XG5cdH1cblxufSJdfQ==