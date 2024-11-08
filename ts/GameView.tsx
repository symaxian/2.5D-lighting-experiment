enum ImageMode {
	PLAIN_IMAGE,
	LIGHT_MAP,
	NORMAL_MAP,
	PIXEL_OFFSET_MAP,
	HEIGHT_MAP,
	SHADOW_MAP
}

type GameViewInput = {
	width: int
	height: int
	mode: ImageMode
	scale: int
	ambientLight?: string
	renderDynamicLight?: boolean
	lightX?: int
	lightY?: int
	lightZ?: int
	lightMoved?: (x: int, y: int, z: int) => void
	applyNormalMap?: boolean
	applyPixelLocationOffsetMap?: boolean
	applyShadowMap?: boolean
	applyPixelOffsetToShadowCalculations?: boolean
}

function copyCanvas(canvas: CanvasRenderingContext2D, willReadFrequently = false): CanvasRenderingContext2D {
	const width = canvas.canvas.width;
	const height = canvas.canvas.height;
	const copy = Utils.createCanvas(width, height, willReadFrequently);
	copy.putImageData(canvas.getImageData(0, 0, width, height), 0, 0);
	return copy;
}

class GameView extends Nitro.Component<GameViewInput> {

	private scene: HTMLCanvasElement | null = null;

	private normalMapImage: CanvasRenderingContext2D | null = null;
	private normalMapData: ImageData | null = null;
	private normalData: Float32Array | null = null;

	private offsetMapImage: CanvasRenderingContext2D | null = null;
	private offsetMapData: ImageData | null = null;

	private heightMapImage: CanvasRenderingContext2D | null = null;
	private heightMapData: ImageData | null = null;
	private heightRects: HeightRect[] | null = null;

	constructor() {
		super();
		Images.load('img/map.png', (src, image) => {
			this.scene = imageToCanvas(image, false).canvas;
			this.setDirty();
		});
		Images.load('img/normals.png', (src, image) => {
			const normalMapImage = imageToCanvas(image, false);
			this.normalMapImage = normalMapImage;
			this.normalMapData = normalMapImage.getImageData(0, 0, normalMapImage.canvas.width, normalMapImage.canvas.height);
			this.normalData = convertNormalData(this.normalMapData);
			this.setDirty();
		});
		Images.load('img/y_offsets.png', (src, image) => {
			const offsetMapImage = imageToCanvas(image, false);
			this.offsetMapImage = offsetMapImage;
			this.offsetMapData = offsetMapImage.getImageData(0, 0, offsetMapImage.canvas.width, offsetMapImage.canvas.height);
			this.setDirty();
		});
		Images.load('img/heights.png', (src, image) => {
			const heightMapImage = imageToCanvas(image, false)!
			this.heightMapImage = heightMapImage;
			this.heightMapData = heightMapImage.getImageData(0, 0, heightMapImage.canvas.width, heightMapImage.canvas.height);
			this.heightRects = generateHeightRects(this.heightMapData);
			this.setDirty();
		});
	}

	render(_?: Nitro.Renderer): void | HTMLElement {
		const input = this.input;
		const scale = input.scale;

		const LIGHT_DISTANCE = 100;

		let shadowMap: CanvasRenderingContext2D | null = null;
		const getShadowMap = (): CanvasRenderingContext2D | null => {
			if (shadowMap === null && this.heightMapData !== null && this.heightRects !== null) {
				const lightX = input.lightX;
				const lightY = input.lightY;
				const lightZ = input.lightZ;
				assert(lightX !== undefined);
				assert(lightY !== undefined);
				assert(lightZ !== undefined);
				shadowMap = generateShadowMapByCastingPixels(this.heightMapData, lightX / input.scale, lightY / input.scale, lightZ, true);
				// shadowMap = generateShadowMapByCastingRects(this.heightMapData.width, this.heightMapData.height, this.heightRects, lightX / input.scale, lightY / input.scale, lightZ, true);
			}
			return shadowMap;
		};

		let mapImage: CanvasRenderingContext2D | null = null;

		if (input.mode === ImageMode.PLAIN_IMAGE) {
			mapImage = (this.scene !== null) ? this.scene.getContext('2d')! : null;
			if (mapImage !== null) {
				mapImage = copyCanvas(mapImage, false);
			}
		}
		else if (input.mode === ImageMode.NORMAL_MAP) {
			mapImage = (this.normalMapImage !== null) ? this.normalMapImage! : null;
		}
		else if (input.mode === ImageMode.PIXEL_OFFSET_MAP) {
			mapImage = (this.offsetMapImage !== null) ? this.offsetMapImage : null;
		}
		else if (input.mode === ImageMode.HEIGHT_MAP) {
			mapImage = (this.heightMapImage !== null) ? this.heightMapImage : null;
		}
		else if (input.mode === ImageMode.SHADOW_MAP && this.heightMapImage !== null) {
			mapImage = getShadowMap();
		}

		let lightCanvas: CanvasRenderingContext2D | null = document.createElement('canvas').getContext('2d')!;
		lightCanvas.canvas.width = input.width;
		lightCanvas.canvas.height = input.height;

		if (input.ambientLight !== undefined) {
			lightCanvas = generateAmbientLightCanvas(input.width, input.height, input.ambientLight, true);
		}

		if (input.renderDynamicLight && input.lightX !== undefined && input.lightY !== undefined && input.lightZ !== undefined) {
			const roundedLightX = Math.round(input.lightX / input.scale);
			const roundedLightY = Math.round(input.lightY / input.scale);
			const normalData = (input.applyNormalMap && this.normalData !== null) ? this.normalData : null;
			const offsets = input.applyPixelLocationOffsetMap ? this.offsetMapData : null;
			const heightMapData = input.applyPixelLocationOffsetMap ? this.heightMapData : null;
			applyDynamicLightToLightMap(lightCanvas, roundedLightX, roundedLightY, input.lightZ, 'rgb(255, 255, 200)', LIGHT_DISTANCE, normalData, offsets, heightMapData, input.applyShadowMap ? getShadowMap() : null, input.applyPixelOffsetToShadowCalculations);

			// applyDynamicLightToLightMap(lightCanvas, roundedLightX - 1, roundedLightY + 1, input.lightZ, 'rgb(255, 255, 200)', LIGHT_DISTANCE, normalData, offsets, heightMapData, input.applyShadowMap ? getShadowMap() : null, input.applyPixelOffsetToShadowCalculations);
			// applyDynamicLightToLightMap(lightCanvas, roundedLightX - 1, roundedLightY - 1, input.lightZ, 'rgb(255, 255, 200)', LIGHT_DISTANCE, normalData, offsets, heightMapData, input.applyShadowMap ? getShadowMap() : null, input.applyPixelOffsetToShadowCalculations);
			// applyDynamicLightToLightMap(lightCanvas, roundedLightX + 1, roundedLightY + 1, input.lightZ, 'rgb(255, 255, 200)', LIGHT_DISTANCE, normalData, offsets, heightMapData, input.applyShadowMap ? getShadowMap() : null, input.applyPixelOffsetToShadowCalculations);
			// applyDynamicLightToLightMap(lightCanvas, roundedLightX + 1, roundedLightY - 1, input.lightZ, 'rgb(255, 255, 200)', LIGHT_DISTANCE, normalData, offsets, heightMapData, input.applyShadowMap ? getShadowMap() : null, input.applyPixelOffsetToShadowCalculations);
		}

		let image: HTMLElement | null = null;
		if (input.mode === ImageMode.LIGHT_MAP) {
			image = <ScaledImage image={lightCanvas.canvas} scale={input.scale}/>;
		} else {
			if (mapImage !== null) {
				applyLightImageToCanvas(mapImage.canvas, lightCanvas.canvas);
			}
			image = mapImage === null ? null : <ScaledImage background='black' image={mapImage.canvas} scale={input.scale}/>
		}

		return <div style={'width: ' + (input.width * input.scale) + 'px; height: ' + (input.height * input.scale) + 'px'}>
			{image}
			{input.lightMoved !== undefined && <DraggableLight scale={scale} width={width} height={height} lightX={input.lightX!} lightY={input.lightY!} lightZ={input.lightZ!} lightMoved={input.lightMoved}/>}
		</div>;
	}

}

function imageToCanvas(image: HTMLImageElement, willReadFrequently = false): CanvasRenderingContext2D {
	const canvas = document.createElement('canvas');
	canvas.width = image.width;
	canvas.height = image.height;
	const ctx = canvas.getContext('2d', { willReadFrequently })!;
	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(image, 0, 0);
	return ctx;
}

function generateAmbientLightCanvas(width: int, height: int, light: string, willReadFrequently = false): CanvasRenderingContext2D {
	const lightingCanvas = document.createElement('canvas');
	lightingCanvas.width = width;
	lightingCanvas.height = height;
	const lightingCtx = lightingCanvas.getContext('2d', { willReadFrequently })!;
	lightingCtx.fillStyle = light;
	lightingCtx.fillRect(0, 0, width, height);
	return lightingCtx;
}

function generateImageLitWithAmbientLight(target: CanvasRenderingContext2D, lightColor: string): HTMLCanvasElement {
	const canvas = document.createElement('canvas');
	canvas.width = target.canvas.width;
	canvas.height = target.canvas.height;
	const ctx = canvas.getContext('2d')!;
	ctx.drawImage(target.canvas, 0, 0);

	const lightingCanvas = document.createElement('canvas');
	lightingCanvas.width = target.canvas.width;
	lightingCanvas.height = target.canvas.height;
	const lightingCtx = lightingCanvas.getContext('2d')!;
	lightingCtx.drawImage(target.canvas, 0, 0);
	lightingCtx.globalCompositeOperation = 'source-in';
	lightingCtx.fillStyle = lightColor;
	lightingCtx.fillRect(0, 0, target.canvas.width, target.canvas.height);

	ctx.globalCompositeOperation = 'multiply';
	ctx.drawImage(lightingCanvas, 0, 0);
	ctx.globalCompositeOperation = 'source-over';

	return canvas;
}

function convertNormalData(normalMap: ImageData): Float32Array {
	const pixelCount = normalMap.width * normalMap.height;
	const normalData = new Float32Array(pixelCount * 2);
	for (let i = 0; i < pixelCount; i++) {
		const pixelDataIndex = i * 4;
		const normalR = normalMap.data[pixelDataIndex];
		const normalG = normalMap.data[pixelDataIndex + 1];
		if (normalR !== 0 || normalG !== 0) {
			const normalX = normalR - 128;
			const normalY = normalG - 128;
			const normalVectorMagnitude = Math.sqrt(normalX * normalX + normalY * normalY);
			const normalizedNormalVectorX = normalX / normalVectorMagnitude;
			const normalizedNormalVectorY = normalY / normalVectorMagnitude;
			normalData[i * 2] = normalizedNormalVectorX;
			normalData[i * 2 + 1] = normalizedNormalVectorY;
		}
	}
	return normalData;
}

const HEIGHT_MAP_VALUE_DIVIDER = 8;

function applyDynamicLightToLightMap(
	lightCtx: CanvasRenderingContext2D,
	lightX: int,
	lightY: int,
	lightZ: int,
	lightColor: string,
	lightDistance: int,
	normalData: Float32Array | null,
	pixelOffsetMap: ImageData | null = null,
	heightMap: ImageData | null = null,
	shadowMap: CanvasRenderingContext2D | null = null, // All grey so channel doesn't matter, color value corresponds to height of the object at that x/y
	applyPixelOffsetToShadowCalculations: boolean | null = null
): void {

	const lightColorParsed = Colors.unpack(Colors.cssToPacked(lightColor));
	const dynamicLightR = lightColorParsed.r;
	const dynamicLightG = lightColorParsed.g;
	const dynamicLightB = lightColorParsed.b;
	const lightDistanceSquared = lightDistance * lightDistance;

	const lightCanvas = lightCtx.canvas;

	const imageData = lightCtx.getImageData(0, 0, lightCanvas.width, lightCanvas.height);

	let pixelOffsetData: Uint8ClampedArray | null = null;
	if (pixelOffsetMap !== null) {
		pixelOffsetData = pixelOffsetMap.data;
	}

	let heightPixelData: Uint8ClampedArray | null = null;
	if (heightMap !== null) {
		heightPixelData = heightMap.data;
	}

	let shadowPixelData: Uint8ClampedArray | null = null;
	if (shadowMap !== null) {
		const shadowData = shadowMap.getImageData(0, 0, shadowMap.canvas.width, shadowMap.canvas.height);
		shadowPixelData = shadowData.data;
	}

	const easingFunc = easing.linear;

	const imageWidth = lightCanvas.width;
	const imageHeight = lightCanvas.height;

	for (let pixelY = 0; pixelY < imageHeight; pixelY++) {
		for (let pixelX = 0; pixelX < imageWidth; pixelX++) {

			const pixelIndex = (pixelY * imageWidth) + pixelX;
			const pixelDataIndex = pixelIndex * 4;

			// Correct the pixel x/y according to the offset map, to treat it as if it was unskewed and directly below the camera
			const correctedPixelX = pixelX;
			let correctedPixelY = pixelY;
			if (pixelOffsetData !== null) {
				correctedPixelY += pixelOffsetData[pixelDataIndex] / HEIGHT_MAP_VALUE_DIVIDER;
			}
			const correctedPixelDataIndex = ((correctedPixelY * imageWidth) + correctedPixelX) * 4;

			// Get the pixel Z value
			let pixelZ = 0;
			if (heightPixelData !== null) {
				pixelZ = heightPixelData[correctedPixelDataIndex] / HEIGHT_MAP_VALUE_DIVIDER;
			}

			const distanceSquared = Utils.pythagoreanDistanceSquared3(correctedPixelX, correctedPixelY, pixelZ, lightX, lightY, lightZ);
			if (distanceSquared < lightDistanceSquared) {

				// If the pixel height is below the shadow at that x/y, skip it so we don't apply the dynamic light
				if (heightPixelData !== null && shadowPixelData !== null) {
					let index: int;
					if (applyPixelOffsetToShadowCalculations) {
						index = correctedPixelDataIndex;
					} else {
						index = pixelDataIndex;
					}
					const height = heightPixelData[index];
					const shadowHeight = shadowPixelData[index] / 8;
					if (height < shadowHeight) continue;
				}

				let normalX = 0;
				let normalY = 0;
				if (normalData !== null) {
					normalX = normalData[pixelIndex * 2];
					normalY = normalData[pixelIndex * 2 + 1];
				}
				let intensityFromNormal: number = 1;
				if (normalX !== 0 || normalY !== 0) {

					const lightVectorX = lightX - correctedPixelX;
					const lightVectorY = correctedPixelY - lightY;
					const lightVectorMagnitude = Math.sqrt(lightVectorX * lightVectorX + lightVectorY * lightVectorY);
					const normalizedLightVectorX = lightVectorX / lightVectorMagnitude;
					const normalizedLightVectorY = lightVectorY / lightVectorMagnitude;

					const dotProduct = normalizedLightVectorX * normalX + normalizedLightVectorY * normalY; // This seems to range from -1 to 1
					const dotProductNormalizedFrom0To1 = (dotProduct + 1) / 2;

					intensityFromNormal = easingFunc(dotProductNormalizedFrom0To1);
				}

				const lightIntensity = ((lightDistance - Math.sqrt(distanceSquared)) / lightDistance) * intensityFromNormal;
				const newR = Math.round(lightIntensity * dynamicLightR);
				const newG = Math.round(lightIntensity * dynamicLightG);
				const newB = Math.round(lightIntensity * dynamicLightB);

				imageData.data[pixelDataIndex] += newR;
				imageData.data[pixelDataIndex + 1] += newG;
				imageData.data[pixelDataIndex + 2] += newB;
				imageData.data[pixelDataIndex + 3] = 255;
			}
		}
	}

	lightCtx.putImageData(imageData, 0, 0);
}

function applyLightImageToCanvas(target: HTMLCanvasElement, light: HTMLCanvasElement): void {
	assert(target.width === light.width);
	assert(target.height === light.height);
	const targetCtx = target.getContext('2d')!;
	targetCtx.globalCompositeOperation = 'multiply';
	targetCtx.drawImage(light, 0, 0);
	targetCtx.globalCompositeOperation = 'source-over';
}

// Generate a shadow map given a height map and a dynamic light
// TODO: Multiple lights, apply to existing shadow map
// TODO: Optimize, store height data as a single array buffer rather than a canvas?
function generateShadowMapByCastingPixels(heightMap: ImageData, lightX: float, lightY: float, lightZ: float, willReadFrequently: boolean): CanvasRenderingContext2D {

	const width = heightMap.width;
	const height = heightMap.height;

	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d', { willReadFrequently: willReadFrequently })!;

	const heightData = heightMap.data;

	ctx.globalCompositeOperation = 'lighten'; // We use 'lighten' to ensure that multiple shadows will overwrite correctly, the higher shadow "wins"
	// ctx.filter = 'blur(1px)';

	for (let pixelY = 0; pixelY < height; pixelY++) {
		for (let pixelX = 0; pixelX < width; pixelX++) {
			const i = ((pixelY * width) + pixelX) * 4;
			const heightValue = heightData[i];
			if (heightValue > 0) {
				const topLeftX = pixelX;
				const topLeftY = pixelY;
				const topRightX = pixelX + 1;
				const topRightY = pixelY;
				const bottomLeftX = pixelX;
				const bottomLeftY = pixelY + 1;
				const bottomRightX = pixelX + 1;
				const bottomRightY = pixelY + 1;

				const angleFromLightToPixelTopLeft = Math.atan2(pixelY - lightY, pixelX - lightX);
				const angleFromLightToPixelTopRight = Math.atan2(pixelY - lightY, pixelX + 1 - lightX);
				const angleFromLightToPixelBottomLeft = Math.atan2(pixelY + 1 - lightY, pixelX - lightX);
				const angleFromLightToPixelBottomRight = Math.atan2(pixelY + 1 - lightY, pixelX + 1 - lightX);

				const heightReductionFactorToReduceSelfShadowNoise = 0;
				const greyValue = heightValue - heightReductionFactorToReduceSelfShadowNoise;

				const topLeftDeltaX = Math.cos(angleFromLightToPixelTopLeft);
				const topLeftDeltaY = Math.sin(angleFromLightToPixelTopLeft);

				const topRightDeltaX = Math.cos(angleFromLightToPixelTopRight);
				const topRightDeltaY = Math.sin(angleFromLightToPixelTopRight);

				const bottomLeftDeltaX = Math.cos(angleFromLightToPixelBottomLeft);
				const bottomLeftDeltaY = Math.sin(angleFromLightToPixelBottomLeft);

				const bottomRightDeltaX = Math.cos(angleFromLightToPixelBottomRight);
				const bottomRightDeltaY = Math.sin(angleFromLightToPixelBottomRight);

				// TODO: Pre-combine pixels into rects, stroke the entire rect and its expansion in one operation; how do we calculate the shape for the rect and its expanded version?

				let shadowDistance: int;
				const pixelHeightInPixels = heightValue / HEIGHT_MAP_VALUE_DIVIDER;
				if (lightZ <= pixelHeightInPixels) {
					// Light is lower than the pixel, shadow extends to infnity
					shadowDistance = 100; // TODO: Calculate minimum needed here based on the viewport
	
					ctx.fillStyle = 'grey';
				}
				else {
					// let angleOfLightSourceRelativeToPixel = Math.atan(pixelHeightInPixels / lightZ);
					// shadowDistance = pixelHeightInPixels * Math.tan(angleOfLightSourceRelativeToPixel);
	
					const distanceFromLightToPixel = Utils.pythagoreanDistance(lightX, lightY, pixelX + 0.5, pixelY + 0.5);

					const fudgeFactor = 4;

					const lightStride = distanceFromLightToPixel / (lightZ + fudgeFactor - pixelHeightInPixels);

					shadowDistance = lightStride * pixelHeightInPixels;
	
					const gradient = ctx.createRadialGradient(pixelX, pixelY, 1, pixelX, pixelY, shadowDistance);
					gradient.addColorStop(0, 'rgb(' + greyValue + ',' + greyValue + ',' + greyValue + ')');
					gradient.addColorStop(1, 'rgb(' + 0 + ',' + 0 + ',' + 0 + ',' + 0 + ')');
					ctx.fillStyle = gradient;
				}


				// Project the top-left corner
				const projectedTopLeftX = topLeftX + topLeftDeltaX * shadowDistance;
				const projectedTopLeftY = topLeftY + topLeftDeltaY * shadowDistance;

				// Project the top-right corner
				const projectedTopRightX = topRightX + topRightDeltaX * shadowDistance;
				const projectedTopRightY = topRightY + topRightDeltaY * shadowDistance;

				// Project the bottom-left corner
				const projectedBottomLeftX = bottomLeftX + bottomLeftDeltaX * shadowDistance;
				const projectedBottomLeftY = bottomLeftY + bottomLeftDeltaY * shadowDistance;

				// Project the bottom-right corner
				const projectedBottomRightX = bottomRightX + bottomRightDeltaX * shadowDistance;
				const projectedBottomRightY = bottomRightY + bottomRightDeltaY * shadowDistance;

				// Determine top-most edge
				let topMostEdgeX1: number;
				let topMostEdgeY1: number;
				let topMostEdgeX2: number;
				let topMostEdgeY2: number;
				if (projectedTopLeftY < topLeftY) {
					topMostEdgeX1 = projectedTopLeftX;
					topMostEdgeY1 = projectedTopLeftY;
					topMostEdgeX2 = projectedTopRightX;
					topMostEdgeY2 = projectedTopRightY;
				} else {
					topMostEdgeX1 = topLeftX;
					topMostEdgeY1 = topLeftY;
					topMostEdgeX2 = topRightX;
					topMostEdgeY2 = topRightY;
				}

				// Determine right-most edge
				let rightMostEdgeX1: number;
				let rightMostEdgeY1: number;
				let rightMostEdgeX2: number;
				let rightMostEdgeY2: number;
				if (projectedTopRightX > topRightX) {
					rightMostEdgeX1 = projectedTopRightX;
					rightMostEdgeY1 = projectedTopRightY;
					rightMostEdgeX2 = projectedBottomRightX;
					rightMostEdgeY2 = projectedBottomRightY;
				} else {
					rightMostEdgeX1 = topRightX;
					rightMostEdgeY1 = topRightY;
					rightMostEdgeX2 = bottomRightX;
					rightMostEdgeY2 = bottomRightY;
				}
				
				// Determine bottom-most edge
				let bottomMostEdgeX1: number;
				let bottomMostEdgeY1: number;
				let bottomMostEdgeX2: number;
				let bottomMostEdgeY2: number;
				if (projectedBottomLeftY > bottomLeftY) {
					bottomMostEdgeX1 = projectedBottomLeftX;
					bottomMostEdgeY1 = projectedBottomLeftY;
					bottomMostEdgeX2 = projectedBottomRightX;
					bottomMostEdgeY2 = projectedBottomRightY;
				} else {
					bottomMostEdgeX1 = bottomLeftX;
					bottomMostEdgeY1 = bottomLeftY;
					bottomMostEdgeX2 = bottomRightX;
					bottomMostEdgeY2 = bottomRightY;
				}
				
				// Determine left-most edge
				let leftMostEdgeX1: number;
				let leftMostEdgeY1: number;
				let leftMostEdgeX2: number;
				let leftMostEdgeY2: number;
				if (projectedTopLeftX < topLeftX) {
					leftMostEdgeX1 = projectedTopLeftX;
					leftMostEdgeY1 = projectedTopLeftY;
					leftMostEdgeX2 = projectedBottomLeftX;
					leftMostEdgeY2 = projectedBottomLeftY;
				} else {
					leftMostEdgeX1 = topLeftX;
					leftMostEdgeY1 = topLeftY;
					leftMostEdgeX2 = bottomLeftX;
					leftMostEdgeY2 = bottomLeftY;
				}

				// Draw the full projected shape
				ctx.beginPath();
				ctx.moveTo(topMostEdgeX1, topMostEdgeY1);
				ctx.lineTo(topMostEdgeX2, topMostEdgeY2);
				ctx.lineTo(rightMostEdgeX1, rightMostEdgeY1);
				ctx.lineTo(rightMostEdgeX2, rightMostEdgeY2);
				ctx.lineTo(bottomMostEdgeX2, bottomMostEdgeY2);
				ctx.lineTo(bottomMostEdgeX1, bottomMostEdgeY1);
				ctx.lineTo(leftMostEdgeX2, leftMostEdgeY2);
				ctx.lineTo(leftMostEdgeX1, leftMostEdgeY1);
				ctx.lineTo(topMostEdgeX1, topMostEdgeY1);
				ctx.closePath();
				ctx.fill();

			}
		}
	}

	ctx.globalCompositeOperation = 'source-over';

	return ctx;
}

type HeightRect = {
	x: int,
	y: int,
	width: int,
	height: int,
	z: int
}

function generateHeightRects(heightMap: ImageData): HeightRect[] {
	const width = heightMap.width;
	const height = heightMap.height;

	const data = new Uint8Array(width * height);

	// Create a simpler data buffer of just the height values, no need for full RGBA

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const i = y * width + x;
			const value = heightMap.data[i * 4];
			data[y * width + x] = value;
		}
	}

	// Construct the height rects

	const rects: HeightRect[] = [];

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const i = y * width + x;
			const value = data[i];
			if (value > 0) {
				const rectWidth = getRectWidthStartingAt(width, data, x, y, value);
				const rectHeight = getRectHeightStartingAt(width, height, data, x, y, value, rectWidth);
				clearHeights(width, data, x, y, rectWidth, rectHeight);
				rects.push({
					x,
					y,
					width: rectWidth,
					height: rectHeight,
					z: value
				});
			}
		}
	}

	return rects;
}

function getRectWidthStartingAt(imageWidth: int, data: Uint8Array, rectX: int, rectY: int, heightValue: int): int {
	let rectWidth = 1;
	while (rectX + rectWidth < imageWidth) {
		const i = rectY * imageWidth + rectX + rectWidth;
		const value = data[i];
		if (value !== heightValue) {
			break;
		}
		rectWidth++;
	}
	return rectWidth;
}

function getRectHeightStartingAt(imageWidth: int, imageHeight: int, data: Uint8Array, rectX: int, rectY: int, heightValue: int, rectWidth: int): int {
	let rectHeight = 1; // We can safely start at 1, we know the first row of pixels all matches
	while (rectY + rectHeight < imageHeight) {
		for (let x = 0; x < rectWidth; x++) {
			const i = (rectY + rectHeight) * imageWidth + rectX + x;
			const value = data[i];
			if (value !== heightValue) {
				return rectHeight;
			}
		}
		rectHeight++;
	}
	return rectHeight;
}

function clearHeights(imageWidth: int, data: Uint8Array, rectX: int, rectY: int, width: int, height: int): void {
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const i = (rectY + y) * imageWidth + rectX + x;
			data[i] = 0;
		}
	}
}

// Generate a shadow map given a height map and a dynamic light
// TODO: Multiple lights, apply to existing shadow map
// TODO: Optimize, store height data as a single array buffer rather than a canvas?
function generateShadowMapByCastingRects(width: int, height: int, heightRects: HeightRect[], lightX: float, lightY: float, lightZ: float, willReadFrequently: boolean): CanvasRenderingContext2D {

	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d', { willReadFrequently: willReadFrequently })!;

	ctx.globalCompositeOperation = 'lighten'; // We use 'lighten' to ensure that multiple shadows will overwrite correctly, the higher shadow "wins"

	for (const rect of heightRects) {
		const heightValue = rect.z;
		if (heightValue > 0) {
			const x = rect.x;
			const y = rect.y;
			const width = rect.width;
			const height = rect.height;

			const topLeftX = x;
			const topLeftY = y;
			const topRightX = x + width;
			const topRightY = y;
			const bottomLeftX = x;
			const bottomLeftY = y + height;
			const bottomRightX = x + width;
			const bottomRightY = y + height;

			const angleFromLightToPixelTopLeft = Math.atan2(y - lightY, x - lightX);
			const angleFromLightToPixelTopRight = Math.atan2(y - lightY, x + width - lightX);
			const angleFromLightToPixelBottomLeft = Math.atan2(y + height - lightY, x - lightX);
			const angleFromLightToPixelBottomRight = Math.atan2(y + height - lightY, x + width - lightX);

			const heightReductionFactorToReduceSelfShadowNoise = 0;
			const greyValue = heightValue - heightReductionFactorToReduceSelfShadowNoise;

			const topLeftDeltaX = Math.cos(angleFromLightToPixelTopLeft);
			const topLeftDeltaY = Math.sin(angleFromLightToPixelTopLeft);

			const topRightDeltaX = Math.cos(angleFromLightToPixelTopRight);
			const topRightDeltaY = Math.sin(angleFromLightToPixelTopRight);

			const bottomLeftDeltaX = Math.cos(angleFromLightToPixelBottomLeft);
			const bottomLeftDeltaY = Math.sin(angleFromLightToPixelBottomLeft);

			const bottomRightDeltaX = Math.cos(angleFromLightToPixelBottomRight);
			const bottomRightDeltaY = Math.sin(angleFromLightToPixelBottomRight);

			let shadowDistance: int;
			const pixelHeightInPixels = heightValue / HEIGHT_MAP_VALUE_DIVIDER;
			if (lightZ <= pixelHeightInPixels) {
				// Light is lower than the pixel, shadow extends to infnity
				shadowDistance = 100; // TODO: Calculate minimum needed here based on the viewport

				ctx.fillStyle = 'red';
			}
			else {
				const angleOfLightSourceRelativeToPixel = Math.atan(pixelHeightInPixels / lightZ);
				shadowDistance = pixelHeightInPixels * Math.tan(angleOfLightSourceRelativeToPixel);

				const gradient = ctx.createRadialGradient(lightX, lightY, 1, lightX, lightY, shadowDistance);
				gradient.addColorStop(0, 'rgb(' + greyValue + ',' + 0 + ',' + 0 + ')');
				gradient.addColorStop(1, 'rgb(' + 0 + ',' + 0 + ',' + 0 + ',' + 0 + ')');
				ctx.fillStyle = gradient;
			}

			// Project the top-left corner
			const projectedTopLeftX = topLeftX + topLeftDeltaX * shadowDistance;
			const projectedTopLeftY = topLeftY + topLeftDeltaY * shadowDistance;

			// Project the top-right corner
			const projectedTopRightX = topRightX + topRightDeltaX * shadowDistance;
			const projectedTopRightY = topRightY + topRightDeltaY * shadowDistance;

			// Project the bottom-left corner
			const projectedBottomLeftX = bottomLeftX + bottomLeftDeltaX * shadowDistance;
			const projectedBottomLeftY = bottomLeftY + bottomLeftDeltaY * shadowDistance;

			// Project the bottom-right corner
			const projectedBottomRightX = bottomRightX + bottomRightDeltaX * shadowDistance;
			const projectedBottomRightY = bottomRightY + bottomRightDeltaY * shadowDistance;

			// Determine top-most edge
			let topMostEdgeX1: number;
			let topMostEdgeY1: number;
			let topMostEdgeX2: number;
			let topMostEdgeY2: number;
			if (projectedTopLeftY < topLeftY) {
				topMostEdgeX1 = projectedTopLeftX;
				topMostEdgeY1 = projectedTopLeftY;
				topMostEdgeX2 = projectedTopRightX;
				topMostEdgeY2 = projectedTopRightY;
			} else {
				topMostEdgeX1 = topLeftX;
				topMostEdgeY1 = topLeftY;
				topMostEdgeX2 = topRightX;
				topMostEdgeY2 = topRightY;
			}

			// Determine right-most edge
			let rightMostEdgeX1: number;
			let rightMostEdgeY1: number;
			let rightMostEdgeX2: number;
			let rightMostEdgeY2: number;
			if (projectedTopRightX > topRightX) {
				rightMostEdgeX1 = projectedTopRightX;
				rightMostEdgeY1 = projectedTopRightY;
				rightMostEdgeX2 = projectedBottomRightX;
				rightMostEdgeY2 = projectedBottomRightY;
			} else {
				rightMostEdgeX1 = topRightX;
				rightMostEdgeY1 = topRightY;
				rightMostEdgeX2 = bottomRightX;
				rightMostEdgeY2 = bottomRightY;
			}
			
			// Determine bottom-most edge
			let bottomMostEdgeX1: number;
			let bottomMostEdgeY1: number;
			let bottomMostEdgeX2: number;
			let bottomMostEdgeY2: number;
			if (projectedBottomLeftY > bottomLeftY) {
				bottomMostEdgeX1 = projectedBottomLeftX;
				bottomMostEdgeY1 = projectedBottomLeftY;
				bottomMostEdgeX2 = projectedBottomRightX;
				bottomMostEdgeY2 = projectedBottomRightY;
			} else {
				bottomMostEdgeX1 = bottomLeftX;
				bottomMostEdgeY1 = bottomLeftY;
				bottomMostEdgeX2 = bottomRightX;
				bottomMostEdgeY2 = bottomRightY;
			}
			
			// Determine left-most edge
			let leftMostEdgeX1: number;
			let leftMostEdgeY1: number;
			let leftMostEdgeX2: number;
			let leftMostEdgeY2: number;
			if (projectedTopLeftX < topLeftX) {
				leftMostEdgeX1 = projectedTopLeftX;
				leftMostEdgeY1 = projectedTopLeftY;
				leftMostEdgeX2 = projectedBottomLeftX;
				leftMostEdgeY2 = projectedBottomLeftY;
			} else {
				leftMostEdgeX1 = topLeftX;
				leftMostEdgeY1 = topLeftY;
				leftMostEdgeX2 = bottomLeftX;
				leftMostEdgeY2 = bottomLeftY;
			}

			// Draw the full projected shape
			ctx.beginPath();
			ctx.moveTo(topMostEdgeX1, topMostEdgeY1);
			ctx.lineTo(topMostEdgeX2, topMostEdgeY2);
			ctx.lineTo(rightMostEdgeX1, rightMostEdgeY1);
			ctx.lineTo(rightMostEdgeX2, rightMostEdgeY2);
			ctx.lineTo(bottomMostEdgeX2, bottomMostEdgeY2);
			ctx.lineTo(bottomMostEdgeX1, bottomMostEdgeY1);
			ctx.lineTo(leftMostEdgeX2, leftMostEdgeY2);
			ctx.lineTo(leftMostEdgeX1, leftMostEdgeY1);
			ctx.lineTo(topMostEdgeX1, topMostEdgeY1);
			ctx.closePath();
			ctx.fill();

		}
	}


	ctx.globalCompositeOperation = 'source-over';

	return ctx;

}