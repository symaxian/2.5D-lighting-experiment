// Must use namespace here in order to iterate over the values, cannot use a non-constant enum, non-constant enums are implemented in a manner that does not play nicely with Closure
namespace IMAGE {
	export const FONT = 'img/font.png';
	export const FONT_SMALL = 'img/font_small.png';
	export const PLATINUM_ICON = 'img/green_bar.png';
	export const MINE_ICON = 'img/mine2.png';
}

class FileLoader {

	private numberLoaded = 0;
	private numberToLoad = 0;

	private mainCallback: (() => void) | null = null;

	loadAll(callback: () => void) {
		this.mainCallback = callback;
		this.numberLoaded = 0;
	}

	private incrementLoadedCount() {
		this.numberLoaded++;
		if (this.numberLoaded === this.numberToLoad) {
			this.mainCallback && this.mainCallback();
		}
	};

	loadString(filepath: string, callback: (data: string) => void) {
		this.numberToLoad++;
		Utils.loadString(filepath, json => {
			callback(json);
			this.incrementLoadedCount();
		});
	}

	loadJson(filepath: string, callback: (data: any) => void) {
		this.numberToLoad++;
		Utils.loadJson(filepath, json => {
			callback(json);
			this.incrementLoadedCount();
		});
	}

	// Uncomment for debug purposes
	// pendingImages: Set<String> = new Set();

	loadImage(imageName: string, callback?: ImageLoadedCallback) {
		this.numberToLoad++;
		// this.pendingImages.add(imageName);
		Images.load(imageName, (filename, image) => {
			// this.pendingImages.delete(imageName);
			if (callback !== undefined) callback(filename, image);
			this.incrementLoadedCount();
		});
	}

}

type ImageLoadedCallback = (filepath: string, image: HTMLImageElement) => void;

namespace Images {

	var images: { [filepath: string]: HTMLImageElement } = {};
	var callbacks: { [filepath: string]: ImageLoadedCallback[] } = {};

	export function get(filepath: string): HTMLImageElement {
		assert(images[filepath] !== undefined)
		return images[filepath];
	}

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