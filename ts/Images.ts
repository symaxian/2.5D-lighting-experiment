type ImageLoadedCallback = (filepath: string, image: HTMLImageElement) => void;

namespace Images {

	var images: { [filepath: string]: HTMLImageElement } = {};
	var callbacks: { [filepath: string]: ImageLoadedCallback[] } = {};

	export function load(filepath: string, callback: ImageLoadedCallback | null = null) {
		const currentImage = images[filepath];
		if (currentImage !== undefined && currentImage.complete) {
			// Already loaded
			if (callback !== null) callback(filepath, currentImage);
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

	function fireCallbacksFor(filepath: string, image: HTMLImageElement) {
		const currentCallbacks = callbacks[filepath];
		if (currentCallbacks !== undefined) {
			for (let cb of currentCallbacks) {
				cb(filepath, image);
			}
			delete callbacks[filepath];
		}
	}

}