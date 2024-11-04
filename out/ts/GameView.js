"use strict";
var ImageMode;
(function (ImageMode) {
    ImageMode[ImageMode["PLAIN_IMAGE"] = 0] = "PLAIN_IMAGE";
    ImageMode[ImageMode["LIGHT_MAP"] = 1] = "LIGHT_MAP";
    ImageMode[ImageMode["NORMAL_MAP"] = 2] = "NORMAL_MAP";
    ImageMode[ImageMode["PIXEL_OFFSET_MAP"] = 3] = "PIXEL_OFFSET_MAP";
    ImageMode[ImageMode["HEIGHT_MAP"] = 4] = "HEIGHT_MAP";
    ImageMode[ImageMode["SHADOW_MAP"] = 5] = "SHADOW_MAP";
})(ImageMode || (ImageMode = {}));
function copyCanvas(canvas, willReadFrequently = false) {
    const width = canvas.canvas.width;
    const height = canvas.canvas.height;
    const copy = Utils.createCanvas(width, height, willReadFrequently);
    copy.putImageData(canvas.getImageData(0, 0, width, height), 0, 0);
    return copy;
}
class GameView extends Nitro.Component {
    scene = null;
    normalMapImage = null;
    normalMapData = null;
    normalData = null;
    offsetMapImage = null;
    offsetMapData = null;
    heightMapImage = null;
    heightMapData = null;
    heightRects = null;
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
            const heightMapImage = imageToCanvas(image, false);
            this.heightMapImage = heightMapImage;
            this.heightMapData = heightMapImage.getImageData(0, 0, heightMapImage.canvas.width, heightMapImage.canvas.height);
            this.heightRects = generateHeightRects(this.heightMapData);
            this.setDirty();
        });
    }
    render(_) {
        const input = this.input;
        const scale = input.scale;
        const LIGHT_DISTANCE = 100;
        let shadowMap = null;
        const getShadowMap = () => {
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
        let mapImage = null;
        if (input.mode === ImageMode.PLAIN_IMAGE) {
            mapImage = (this.scene !== null) ? this.scene.getContext('2d') : null;
            if (mapImage !== null) {
                mapImage = copyCanvas(mapImage, false);
            }
        }
        else if (input.mode === ImageMode.NORMAL_MAP) {
            mapImage = (this.normalMapImage !== null) ? this.normalMapImage : null;
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
        let lightCanvas = document.createElement('canvas').getContext('2d');
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
        let image = null;
        if (input.mode === ImageMode.LIGHT_MAP) {
            image = _.create(ScaledImage, { image: lightCanvas.canvas, scale: input.scale });
        }
        else {
            if (mapImage !== null) {
                applyLightImageToCanvas(mapImage.canvas, lightCanvas.canvas);
            }
            image = mapImage === null ? null : _.create(ScaledImage, { background: 'black', image: mapImage.canvas, scale: input.scale });
        }
        return _.create("div", { style: 'width: ' + (input.width * input.scale) + 'px; height: ' + (input.height * input.scale) + 'px' },
            image,
            input.lightMoved !== undefined && _.create(DraggableLight, { scale: scale, width: width, height: height, lightX: input.lightX, lightY: input.lightY, lightZ: input.lightZ, lightMoved: input.lightMoved }));
    }
}
function imageToCanvas(image, willReadFrequently = false) {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d', { willReadFrequently });
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, 0, 0);
    return ctx;
}
function generateAmbientLightCanvas(width, height, light, willReadFrequently = false) {
    const lightingCanvas = document.createElement('canvas');
    lightingCanvas.width = width;
    lightingCanvas.height = height;
    const lightingCtx = lightingCanvas.getContext('2d', { willReadFrequently });
    lightingCtx.fillStyle = light;
    lightingCtx.fillRect(0, 0, width, height);
    return lightingCtx;
}
function generateImageLitWithAmbientLight(target, lightColor) {
    const canvas = document.createElement('canvas');
    canvas.width = target.canvas.width;
    canvas.height = target.canvas.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(target.canvas, 0, 0);
    const lightingCanvas = document.createElement('canvas');
    lightingCanvas.width = target.canvas.width;
    lightingCanvas.height = target.canvas.height;
    const lightingCtx = lightingCanvas.getContext('2d');
    lightingCtx.drawImage(target.canvas, 0, 0);
    lightingCtx.globalCompositeOperation = 'source-in';
    lightingCtx.fillStyle = lightColor;
    lightingCtx.fillRect(0, 0, target.canvas.width, target.canvas.height);
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(lightingCanvas, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    return canvas;
}
function convertNormalData(normalMap) {
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
function applyDynamicLightToLightMap(lightCtx, lightX, lightY, lightZ, lightColor, lightDistance, normalData, pixelOffsetMap = null, heightMap = null, shadowMap = null, // All grey so channel doesn't matter, color value corresponds to height of the object at that x/y
applyPixelOffsetToShadowCalculations = null) {
    const lightColorParsed = Colors.unpack(Colors.cssToPacked(lightColor));
    const dynamicLightR = lightColorParsed.r;
    const dynamicLightG = lightColorParsed.g;
    const dynamicLightB = lightColorParsed.b;
    const lightDistanceSquared = lightDistance * lightDistance;
    const lightCanvas = lightCtx.canvas;
    const imageData = lightCtx.getImageData(0, 0, lightCanvas.width, lightCanvas.height);
    let pixelOffsetData = null;
    if (pixelOffsetMap !== null) {
        pixelOffsetData = pixelOffsetMap.data;
    }
    let heightPixelData = null;
    if (heightMap !== null) {
        heightPixelData = heightMap.data;
    }
    let shadowPixelData = null;
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
                    let index;
                    if (applyPixelOffsetToShadowCalculations) {
                        index = correctedPixelDataIndex;
                    }
                    else {
                        index = pixelDataIndex;
                    }
                    const height = heightPixelData[index];
                    const shadowHeight = shadowPixelData[index] / 8;
                    if (height < shadowHeight)
                        continue;
                }
                let normalX = 0;
                let normalY = 0;
                if (normalData !== null) {
                    normalX = normalData[pixelIndex * 2];
                    normalY = normalData[pixelIndex * 2 + 1];
                }
                let intensityFromNormal = 1;
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
function applyLightImageToCanvas(target, light) {
    assert(target.width === light.width);
    assert(target.height === light.height);
    const targetCtx = target.getContext('2d');
    targetCtx.globalCompositeOperation = 'multiply';
    targetCtx.drawImage(light, 0, 0);
    targetCtx.globalCompositeOperation = 'source-over';
}
// Generate a shadow map given a height map and a dynamic light
// TODO: Multiple lights, apply to existing shadow map
// TODO: Optimize, store height data as a single array buffer rather than a canvas?
function generateShadowMapByCastingPixels(heightMap, lightX, lightY, lightZ, willReadFrequently) {
    const width = heightMap.width;
    const height = heightMap.height;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: willReadFrequently });
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
                let shadowDistance;
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
                let topMostEdgeX1;
                let topMostEdgeY1;
                let topMostEdgeX2;
                let topMostEdgeY2;
                if (projectedTopLeftY < topLeftY) {
                    topMostEdgeX1 = projectedTopLeftX;
                    topMostEdgeY1 = projectedTopLeftY;
                    topMostEdgeX2 = projectedTopRightX;
                    topMostEdgeY2 = projectedTopRightY;
                }
                else {
                    topMostEdgeX1 = topLeftX;
                    topMostEdgeY1 = topLeftY;
                    topMostEdgeX2 = topRightX;
                    topMostEdgeY2 = topRightY;
                }
                // Determine right-most edge
                let rightMostEdgeX1;
                let rightMostEdgeY1;
                let rightMostEdgeX2;
                let rightMostEdgeY2;
                if (projectedTopRightX > topRightX) {
                    rightMostEdgeX1 = projectedTopRightX;
                    rightMostEdgeY1 = projectedTopRightY;
                    rightMostEdgeX2 = projectedBottomRightX;
                    rightMostEdgeY2 = projectedBottomRightY;
                }
                else {
                    rightMostEdgeX1 = topRightX;
                    rightMostEdgeY1 = topRightY;
                    rightMostEdgeX2 = bottomRightX;
                    rightMostEdgeY2 = bottomRightY;
                }
                // Determine bottom-most edge
                let bottomMostEdgeX1;
                let bottomMostEdgeY1;
                let bottomMostEdgeX2;
                let bottomMostEdgeY2;
                if (projectedBottomLeftY > bottomLeftY) {
                    bottomMostEdgeX1 = projectedBottomLeftX;
                    bottomMostEdgeY1 = projectedBottomLeftY;
                    bottomMostEdgeX2 = projectedBottomRightX;
                    bottomMostEdgeY2 = projectedBottomRightY;
                }
                else {
                    bottomMostEdgeX1 = bottomLeftX;
                    bottomMostEdgeY1 = bottomLeftY;
                    bottomMostEdgeX2 = bottomRightX;
                    bottomMostEdgeY2 = bottomRightY;
                }
                // Determine left-most edge
                let leftMostEdgeX1;
                let leftMostEdgeY1;
                let leftMostEdgeX2;
                let leftMostEdgeY2;
                if (projectedTopLeftX < topLeftX) {
                    leftMostEdgeX1 = projectedTopLeftX;
                    leftMostEdgeY1 = projectedTopLeftY;
                    leftMostEdgeX2 = projectedBottomLeftX;
                    leftMostEdgeY2 = projectedBottomLeftY;
                }
                else {
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
function generateHeightRects(heightMap) {
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
    const rects = [];
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
function getRectWidthStartingAt(imageWidth, data, rectX, rectY, heightValue) {
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
function getRectHeightStartingAt(imageWidth, imageHeight, data, rectX, rectY, heightValue, rectWidth) {
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
function clearHeights(imageWidth, data, rectX, rectY, width, height) {
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
function generateShadowMapByCastingRects(width, height, heightRects, lightX, lightY, lightZ, willReadFrequently) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: willReadFrequently });
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
            let shadowDistance;
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
            let topMostEdgeX1;
            let topMostEdgeY1;
            let topMostEdgeX2;
            let topMostEdgeY2;
            if (projectedTopLeftY < topLeftY) {
                topMostEdgeX1 = projectedTopLeftX;
                topMostEdgeY1 = projectedTopLeftY;
                topMostEdgeX2 = projectedTopRightX;
                topMostEdgeY2 = projectedTopRightY;
            }
            else {
                topMostEdgeX1 = topLeftX;
                topMostEdgeY1 = topLeftY;
                topMostEdgeX2 = topRightX;
                topMostEdgeY2 = topRightY;
            }
            // Determine right-most edge
            let rightMostEdgeX1;
            let rightMostEdgeY1;
            let rightMostEdgeX2;
            let rightMostEdgeY2;
            if (projectedTopRightX > topRightX) {
                rightMostEdgeX1 = projectedTopRightX;
                rightMostEdgeY1 = projectedTopRightY;
                rightMostEdgeX2 = projectedBottomRightX;
                rightMostEdgeY2 = projectedBottomRightY;
            }
            else {
                rightMostEdgeX1 = topRightX;
                rightMostEdgeY1 = topRightY;
                rightMostEdgeX2 = bottomRightX;
                rightMostEdgeY2 = bottomRightY;
            }
            // Determine bottom-most edge
            let bottomMostEdgeX1;
            let bottomMostEdgeY1;
            let bottomMostEdgeX2;
            let bottomMostEdgeY2;
            if (projectedBottomLeftY > bottomLeftY) {
                bottomMostEdgeX1 = projectedBottomLeftX;
                bottomMostEdgeY1 = projectedBottomLeftY;
                bottomMostEdgeX2 = projectedBottomRightX;
                bottomMostEdgeY2 = projectedBottomRightY;
            }
            else {
                bottomMostEdgeX1 = bottomLeftX;
                bottomMostEdgeY1 = bottomLeftY;
                bottomMostEdgeX2 = bottomRightX;
                bottomMostEdgeY2 = bottomRightY;
            }
            // Determine left-most edge
            let leftMostEdgeX1;
            let leftMostEdgeY1;
            let leftMostEdgeX2;
            let leftMostEdgeY2;
            if (projectedTopLeftX < topLeftX) {
                leftMostEdgeX1 = projectedTopLeftX;
                leftMostEdgeY1 = projectedTopLeftY;
                leftMostEdgeX2 = projectedBottomLeftX;
                leftMostEdgeY2 = projectedBottomLeftY;
            }
            else {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZVZpZXcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi90cy9HYW1lVmlldy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQUssU0FPSjtBQVBELFdBQUssU0FBUztJQUNiLHVEQUFXLENBQUE7SUFDWCxtREFBUyxDQUFBO0lBQ1QscURBQVUsQ0FBQTtJQUNWLGlFQUFnQixDQUFBO0lBQ2hCLHFEQUFVLENBQUE7SUFDVixxREFBVSxDQUFBO0FBQ1gsQ0FBQyxFQVBJLFNBQVMsS0FBVCxTQUFTLFFBT2I7QUFtQkQsU0FBUyxVQUFVLENBQUMsTUFBZ0MsRUFBRSxrQkFBa0IsR0FBRyxLQUFLO0lBQy9FLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2xDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ3BDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0lBQ25FLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDbEUsT0FBTyxJQUFJLENBQUM7QUFDYixDQUFDO0FBRUQsTUFBTSxRQUFTLFNBQVEsS0FBSyxDQUFDLFNBQXdCO0lBRTVDLEtBQUssR0FBNkIsSUFBSSxDQUFDO0lBRXZDLGNBQWMsR0FBb0MsSUFBSSxDQUFDO0lBQ3ZELGFBQWEsR0FBcUIsSUFBSSxDQUFDO0lBQ3ZDLFVBQVUsR0FBd0IsSUFBSSxDQUFDO0lBRXZDLGNBQWMsR0FBb0MsSUFBSSxDQUFDO0lBQ3ZELGFBQWEsR0FBcUIsSUFBSSxDQUFDO0lBRXZDLGNBQWMsR0FBb0MsSUFBSSxDQUFDO0lBQ3ZELGFBQWEsR0FBcUIsSUFBSSxDQUFD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MUIsY0FBYyxHQUFHLFdBQVcsQ0FBQztnQkFDN0IsY0FBYyxHQUFHLFdBQVcsQ0FBQztZQUM5QixDQUFDO1lBRUQsZ0NBQWdDO1lBQ2hDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNoQixHQUFHLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUN6QyxHQUFHLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUN6QyxHQUFHLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxlQUFlLENBQUMsQ0FBQztZQUM3QyxHQUFHLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxlQUFlLENBQUMsQ0FBQztZQUM3QyxHQUFHLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFDL0MsR0FBRyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQy9DLEdBQUcsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQzNDLEdBQUcsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQzNDLEdBQUcsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQ3pDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNoQixHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFWixDQUFDO0lBQ0YsQ0FBQztJQUdELEdBQUcsQ0FBQyx3QkFBd0IsR0FBRyxhQUFhLENBQUM7SUFFN0MsT0FBTyxHQUFHLENBQUM7QUFFWixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiZW51bSBJbWFnZU1vZGUge1xuXHRQTEFJTl9JTUFHRSxcblx0TElHSFRfTUFQLFxuXHROT1JNQUxfTUFQLFxuXHRQSVhFTF9PRkZTRVRfTUFQLFxuXHRIRUlHSFRfTUFQLFxuXHRTSEFET1dfTUFQXG59XG5cbnR5cGUgR2FtZVZpZXdJbnB1dCA9IHtcblx0d2lkdGg6IGludFxuXHRoZWlnaHQ6IGludFxuXHRtb2RlOiBJbWFnZU1vZGVcblx0c2NhbGU6IGludFxuXHRhbWJpZW50TGlnaHQ/OiBzdHJpbmdcblx0cmVuZGVyRHluYW1pY0xpZ2h0PzogYm9vbGVhblxuXHRsaWdodFg/OiBpbnRcblx0bGlnaHRZPzogaW50XG5cdGxpZ2h0Wj86IGludFxuXHRsaWdodE1vdmVkPzogKHg6IGludCwgeTogaW50LCB6OiBpbnQpID0+IHZvaWRcblx0YXBwbHlOb3JtYWxNYXA/OiBib29sZWFuXG5cdGFwcGx5UGl4ZWxMb2NhdGlvbk9mZnNldE1hcD86IGJvb2xlYW5cblx0YXBwbHlTaGFkb3dNYXA/OiBib29sZWFuXG5cdGFwcGx5UGl4ZWxPZmZzZXRUb1NoYWRvd0NhbGN1bGF0aW9ucz86IGJvb2xlYW5cbn1cblxuZnVuY3Rpb24gY29weUNhbnZhcyhjYW52YXM6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgd2lsbFJlYWRGcmVxdWVudGx5ID0gZmFsc2UpOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQge1xuXHRjb25zdCB3aWR0aCA9IGNhbnZhcy5jYW52YXMud2lkdGg7XG5cdGNvbnN0IGhlaWdodCA9IGNhbnZhcy5jYW52YXMuaGVpZ2h0O1xuXHRjb25zdCBjb3B5ID0gVXRpbHMuY3JlYXRlQ2FudmFzKHdpZHRoLCBoZWlnaHQsIHdpbGxSZWFkRnJlcXVlbnRseSk7XG5cdGNvcHkucHV0SW1hZ2VEYXRhKGNhbnZhcy5nZXRJbWFnZURhdGEoMCwgMCwgd2lkdGgsIGhlaWdodCksIDAsIDApO1xuXHRyZXR1cm4gY29weTtcbn1cblxuY2xhc3MgR2FtZVZpZXcgZXh0ZW5kcyBOaXRyby5Db21wb25lbnQ8R2FtZVZpZXdJbnB1dD4ge1xuXG5cdHByaXZhdGUgc2NlbmU6IEhUTUxDYW52YXNFbGVtZW50IHwgbnVsbCA9IG51bGw7XG5cblx0cHJpdmF0ZSBub3JtYWxNYXBJbWFnZTogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIHwgbnVsbCA9IG51bGw7XG5cdHByaXZhdGUgbm9ybWFsTWFwRGF0YTogSW1hZ2VEYXRhIHwgbnVsbCA9IG51bGw7XG5cdHByaXZhdGUgbm9ybWFsRGF0YTogRmxvYXQzMkFycmF5IHwgbnVsbCA9IG51bGw7XG5cblx0cHJpdmF0ZSBvZmZzZXRNYXBJbWFnZTogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIHwgbnVsbCA9IG51bGw7XG5cdHByaXZhdGUgb2Zmc2V0TWFwRGF0YTogSW1hZ2VEYXRhIHwgbnVsbCA9IG51bGw7XG5cblx0cHJpdmF0ZSBoZWlnaHRNYXBJbWFnZTogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIHwgbnVsbCA9IG51bGw7XG5cdHByaXZhdGUgaGVpZ2h0TWFwRGF0YTogSW1hZ2VEYXRhIHwgbnVsbCA9IG51bGw7XG5cdHByaXZhdGUgaGVpZ2h0UmVjdHM6IEhlaWdodFJlY3RbXSB8IG51bGwgPSBudWxsO1xuXG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKCk7XG5cdFx0SW1hZ2VzLmxvYWQoJ2ltZy9tYXAucG5nJywgKHNyYywgaW1hZ2UpID0+IHtcblx0XHRcdHRoaXMuc2NlbmUgPSBpbWFnZVRvQ2FudmFzKGltYWdlLCBmYWxzZSkuY2FudmFzO1xuXHRcdFx0dGhpcy5zZXREaXJ0eSgpO1xuXHRcdH0pO1xuXHRcdEltYWdlcy5sb2FkKCdpbWcvbm9ybWFscy5wbmcnLCAoc3JjLCBpbWFnZSkgPT4ge1xuXHRcdFx0Y29uc3Qgbm9ybWFsTWFwSW1hZ2UgPSBpbWFnZVRvQ2FudmFzKGltYWdlLCBmYWxzZSk7XG5cdFx0XHR0aGlzLm5vcm1hbE1hcEltYWdlID0gbm9ybWFsTWFwSW1hZ2U7XG5cdFx0XHR0aGlzLm5vcm1hbE1hcERhdGEgPSBub3JtYWxNYXBJbWFnZS5nZXRJbWFnZURhdGEoMCwgMCwgbm9ybWFsTWFwSW1hZ2UuY2FudmFzLndpZHRoLCBub3JtYWxNYXBJbWFnZS5jYW52YXMuaGVpZ2h0KTtcblx0XHRcdHRoaXMubm9ybWFsRGF0YSA9IGNvbnZlcnROb3JtYWxEYXRhKHRoaXMubm9ybWFsTWFwRGF0YSk7XG5cdFx0XHR0aGlzLnNldERpcnR5KCk7XG5cdFx0fSk7XG5cdFx0SW1hZ2VzLmxvYWQoJ2ltZy95X29mZnNldHMucG5nJywgKHNyYywgaW1hZ2UpID0+IHtcblx0XHRcdGNvbnN0IG9mZnNldE1hcEltYWdlID0gaW1hZ2VUb0NhbnZhcyhpbWFnZSwgZmFsc2UpO1xuXHRcdFx0dGhpcy5vZmZzZXRNYXBJbWFnZSA9IG9mZnNldE1hcEltYWdlO1xuXHRcdFx0dGhpcy5vZmZzZXRNYXBEYXRhID0gb2Zmc2V0TWFwSW1hZ2UuZ2V0SW1hZ2VEYXRhKDAsIDAsIG9mZnNldE1hcEltYWdlLmNhbnZhcy53aWR0aCwgb2Zmc2V0TWFwSW1hZ2UuY2FudmFzLmhlaWdodCk7XG5cdFx0XHR0aGlzLnNldERpcnR5KCk7XG5cdFx0fSk7XG5cdFx0SW1hZ2VzLmxvYWQoJ2ltZy9oZWlnaHRzLnBuZycsIChzcmMsIGltYWdlKSA9PiB7XG5cdFx0XHRjb25zdCBoZWlnaHRNYXBJbWFnZSA9IGltYWdlVG9DYW52YXMoaW1hZ2UsIGZhbHNlKSFcblx0XHRcdHRoaXMuaGVpZ2h0TWFwSW1hZ2UgPSBoZWlnaHRNYXBJbWFnZTtcblx0XHRcdHRoaXMuaGVpZ2h0TWFwRGF0YSA9IGhlaWdodE1hcEltYWdlLmdldEltYWdlRGF0YSgwLCAwLCBoZWlnaHRNYXBJbWFnZS5jYW52YXMud2lkdGgsIGhlaWdodE1hcEltYWdlLmNhbnZhcy5oZWlnaHQpO1xuXHRcdFx0dGhpcy5oZWlnaHRSZWN0cyA9IGdlbmVyYXRlSGVpZ2h0UmVjdHModGhpcy5oZWlnaHRNYXBEYXRhKTtcblx0XHRcdHRoaXMuc2V0RGlydHkoKTtcblx0XHR9KTtcblx0fVxuXG5cdHJlbmRlcihfPzogTml0cm8uUmVuZGVyZXIpOiB2b2lkIHwgSFRNTEVsZW1lbnQge1xuXHRcdGNvbnN0IGlucHV0ID0gdGhpcy5pbnB1dDtcblx0XHRjb25zdCBzY2FsZSA9IGlucHV0LnNjYWxlO1xuXG5cdFx0Y29uc3QgTElHSFRfRElTVEFOQ0UgPSAxMDA7XG5cblx0XHRsZXQgc2hhZG93TWFwOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgfCBudWxsID0gbnVsbDtcblx0XHRjb25zdCBnZXRTaGFkb3dNYXAgPSAoKTogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIHwgbnVsbCA9PiB7XG5cdFx0XHRpZiAoc2hhZG93TWFwID09PSBudWxsICYmIHRoaXMuaGVpZ2h0TWFwRGF0YSAhPT0gbnVsbCAmJiB0aGlzLmhlaWdodFJlY3RzICE9PSBudWxsKSB7XG5cdFx0XHRcdGNvbnN0IGxpZ2h0WCA9IGlucHV0LmxpZ2h0WDtcblx0XHRcdFx0Y29uc3QgbGlnaHRZID0gaW5wdXQubGlnaHRZO1xuXHRcdFx0XHRjb25zdCBsaWdodFogPSBpbnB1dC5saWdodFo7XG5cdFx0XHRcdGFzc2VydChsaWdodFggIT09IHVuZGVmaW5lZCk7XG5cdFx0XHRcdGFzc2VydChsaWdodFkgIT09IHVuZGVmaW5lZCk7XG5cdFx0XHRcdGFzc2VydChsaWdodFogIT09IHVuZGVmaW5lZCk7XG5cdFx0XHRcdHNoYWRvd01hcCA9IGdlbmVyYXRlU2hhZG93TWFwQnlDYXN0aW5nUGl4ZWxzKHRoaXMuaGVpZ2h0TWFwRGF0YSwgbGlnaHRYIC8gaW5wdXQuc2NhbGUsIGxpZ2h0WSAvIGlucHV0LnNjYWxlLCBsaWdodFosIHRydWUpO1xuXHRcdFx0XHQvLyBzaGFkb3dNYXAgPSBnZW5lcmF0ZVNoYWRvd01hcEJ5Q2FzdGluZ1JlY3RzKHRoaXMuaGVpZ2h0TWFwRGF0YS53aWR0aCwgdGhpcy5oZWlnaHRNYXBEYXRhLmhlaWdodCwgdGhpcy5oZWlnaHRSZWN0cywgbGlnaHRYIC8gaW5wdXQuc2NhbGUsIGxpZ2h0WSAvIGlucHV0LnNjYWxlLCBsaWdodFosIHRydWUpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHNoYWRvd01hcDtcblx0XHR9O1xuXG5cdFx0bGV0IG1hcEltYWdlOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgfCBudWxsID0gbnVsbDtcblxuXHRcdGlmIChpbnB1dC5tb2RlID09PSBJbWFnZU1vZGUuUExBSU5fSU1BR0UpIHtcblx0XHRcdG1hcEltYWdlID0gKHRoaXMuc2NlbmUgIT09IG51bGwpID8gdGhpcy5zY2VuZS5nZXRDb250ZXh0KCcyZCcpISA6IG51bGw7XG5cdFx0XHRpZiAobWFwSW1hZ2UgIT09IG51bGwpIHtcblx0XHRcdFx0bWFwSW1hZ2UgPSBjb3B5Q2FudmFzKG1hcEltYWdlLCBmYWxzZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2UgaWYgKGlucHV0Lm1vZGUgPT09IEltYWdlTW9kZS5OT1JNQUxfTUFQKSB7XG5cdFx0XHRtYXBJbWFnZSA9ICh0aGlzLm5vcm1hbE1hcEltYWdlICE9PSBudWxsKSA/IHRoaXMubm9ybWFsTWFwSW1hZ2UhIDogbnVsbDtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoaW5wdXQubW9kZSA9PT0gSW1hZ2VNb2RlLlBJWEVMX09GRlNFVF9NQVApIHtcblx0XHRcdG1hcEltYWdlID0gKHRoaXMub2Zmc2V0TWFwSW1hZ2UgIT09IG51bGwpID8gdGhpcy5vZmZzZXRNYXBJbWFnZSA6IG51bGw7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKGlucHV0Lm1vZGUgPT09IEltYWdlTW9kZS5IRUlHSFRfTUFQKSB7XG5cdFx0XHRtYXBJbWFnZSA9ICh0aGlzLmhlaWdodE1hcEltYWdlICE9PSBudWxsKSA/IHRoaXMuaGVpZ2h0TWFwSW1hZ2UgOiBudWxsO1xuXHRcdH1cblx0XHRlbHNlIGlmIChpbnB1dC5tb2RlID09PSBJbWFnZU1vZGUuU0hBRE9XX01BUCAmJiB0aGlzLmhlaWdodE1hcEltYWdlICE9PSBudWxsKSB7XG5cdFx0XHRtYXBJbWFnZSA9IGdldFNoYWRvd01hcCgpO1xuXHRcdH1cblxuXHRcdGxldCBsaWdodENhbnZhczogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIHwgbnVsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpLmdldENvbnRleHQoJzJkJykhO1xuXHRcdGxpZ2h0Q2FudmFzLmNhbnZhcy53aWR0aCA9IGlucHV0LndpZHRoO1xuXHRcdGxpZ2h0Q2FudmFzLmNhbnZhcy5oZWlnaHQgPSBpbnB1dC5oZWlnaHQ7XG5cblx0XHRpZiAoaW5wdXQuYW1iaWVudExpZ2h0ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGxpZ2h0Q2FudmFzID0gZ2VuZXJhdGVBbWJpZW50TGlnaHRDYW52YXMoaW5wdXQud2lkdGgsIGlucHV0LmhlaWdodCwgaW5wdXQuYW1iaWVudExpZ2h0LCB0cnVlKTtcblx0XHR9XG5cblx0XHRpZiAoaW5wdXQucmVuZGVyRHluYW1pY0xpZ2h0ICYmIGlucHV0LmxpZ2h0WCAhPT0gdW5kZWZpbmVkICYmIGlucHV0LmxpZ2h0WSAhPT0gdW5kZWZpbmVkICYmIGlucHV0LmxpZ2h0WiAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRjb25zdCByb3VuZGVkTGlnaHRYID0gTWF0aC5yb3VuZChpbnB1dC5saWdodFggLyBpbnB1dC5zY2FsZSk7XG5cdFx0XHRjb25zdCByb3VuZGVkTGlnaHRZID0gTWF0aC5yb3VuZChpbnB1dC5saWdodFkgLyBpbnB1dC5zY2FsZSk7XG5cdFx0XHRjb25zdCBub3JtYWxEYXRhID0gKGlucHV0LmFwcGx5Tm9ybWFsTWFwICYmIHRoaXMubm9ybWFsRGF0YSAhPT0gbnVsbCkgPyB0aGlzLm5vcm1hbERhdGEgOiBudWxsO1xuXHRcdFx0Y29uc3Qgb2Zmc2V0cyA9IGlucHV0LmFwcGx5UGl4ZWxMb2NhdGlvbk9mZnNldE1hcCA/IHRoaXMub2Zmc2V0TWFwRGF0YSA6IG51bGw7XG5cdFx0XHRjb25zdCBoZWlnaHRNYXBEYXRhID0gaW5wdXQuYXBwbHlQaXhlbExvY2F0aW9uT2Zmc2V0TWFwID8gdGhpcy5oZWlnaHRNYXBEYXRhIDogbnVsbDtcblx0XHRcdGFwcGx5RHluYW1pY0xpZ2h0VG9MaWdodE1hcChsaWdodENhbnZhcywgcm91bmRlZExpZ2h0WCwgcm91bmRlZExpZ2h0WSwgaW5wdXQubGlnaHRaLCAncmdiKDI1NSwgMjU1LCAyMDApJywgTElHSFRfRElTVEFOQ0UsIG5vcm1hbERhdGEsIG9mZnNldHMsIGhlaWdodE1hcERhdGEsIGlucHV0LmFwcGx5U2hhZG93TWFwID8gZ2V0U2hhZG93TWFwKCkgOiBudWxsLCBpbnB1dC5hcHBseVBpeGVsT2Zmc2V0VG9TaGFkb3dDYWxjdWxhdGlvbnMpO1xuXG5cdFx0XHQvLyBhcHBseUR5bmFtaWNMaWdodFRvTGlnaHRNYXAobGlnaHRDYW52YXMsIHJvdW5kZWRMaWdodFggLSAxLCByb3VuZGVkTGlnaHRZICsgMSwgaW5wdXQubGlnaHRaLCAncmdiKDI1NSwgMjU1LCAyMDApJywgTElHSFRfRElTVEFOQ0UsIG5vcm1hbERhdGEsIG9mZnNldHMsIGhlaWdodE1hcERhdGEsIGlucHV0LmFwcGx5U2hhZG93TWFwID8gZ2V0U2hhZG93TWFwKCkgOiBudWxsLCBpbnB1dC5hcHBseVBpeGVsT2Zmc2V0VG9TaGFkb3dDYWxjdWxhdGlvbnMpO1xuXHRcdFx0Ly8gYXBwbHlEeW5hbWljTGlnaHRUb0xpZ2h0TWFwKGxpZ2h0Q2FudmFzLCByb3VuZGVkTGlnaHRYIC0gMSwgcm91bmRlZExpZ2h0WSAtIDEsIGlucHV0LmxpZ2h0WiwgJ3JnYigyNTUsIDI1NSwgMjAwKScsIExJR0hUX0RJU1RBTkNFLCBub3JtYWxEYXRhLCBvZmZzZXRzLCBoZWlnaHRNYXBEYXRhLCBpbnB1dC5hcHBseVNoYWRvd01hcCA/IGdldFNoYWRvd01hcCgpIDogbnVsbCwgaW5wdXQuYXBwbHlQaXhlbE9mZnNldFRvU2hhZG93Q2FsY3VsYXRpb25zKTtcblx0XHRcdC8vIGFwcGx5RHluYW1pY0xpZ2h0VG9MaWdodE1hcChsaWdodENhbnZhcywgcm91bmRlZExpZ2h0WCArIDEsIHJvdW5kZWRMaWdodFkgKyAxLCBpbnB1dC5saWdodFosICdyZ2IoMjU1LCAyNTUsIDIwMCknLCBMSUdIVF9ESVNUQU5DRSwgbm9ybWFsRGF0YSwgb2Zmc2V0cywgaGVpZ2h0TWFwRGF0YSwgaW5wdXQuYXBwbHlTaGFkb3dNYXAgPyBnZXRTaGFkb3dNYXAoKSA6IG51bGwsIGlucHV0LmFwcGx5UGl4ZWxPZmZzZXRUb1NoYWRvd0NhbGN1bGF0aW9ucyk7XG5cdFx0XHQvLyBhcHBseUR5bmFtaWNMaWdodFRvTGlnaHRNYXAobGlnaHRDYW52YXMsIHJvdW5kZWRMaWdodFggKyAxLCByb3VuZGVkTGlnaHRZIC0gMSwgaW5wdXQubGlnaHRaLCAncmdiKDI1NSwgMjU1LCAyMDApJywgTElHSFRfRElTVEFOQ0UsIG5vcm1hbERhdGEsIG9mZnNldHMsIGhlaWdodE1hcERhdGEsIGlucHV0LmFwcGx5U2hhZG93TWFwID8gZ2V0U2hhZG93TWFwKCkgOiBudWxsLCBpbnB1dC5hcHBseVBpeGVsT2Zmc2V0VG9TaGFkb3dDYWxjdWxhdGlvbnMpO1xuXHRcdH1cblxuXHRcdGxldCBpbWFnZTogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcblx0XHRpZiAoaW5wdXQubW9kZSA9PT0gSW1hZ2VNb2RlLkxJR0hUX01BUCkge1xuXHRcdFx0aW1hZ2UgPSA8U2NhbGVkSW1hZ2UgaW1hZ2U9e2xpZ2h0Q2FudmFzLmNhbnZhc30gc2NhbGU9e2lucHV0LnNjYWxlfS8+O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAobWFwSW1hZ2UgIT09IG51bGwpIHtcblx0XHRcdFx0YXBwbHlMaWdodEltYWdlVG9DYW52YXMobWFwSW1hZ2UuY2FudmFzLCBsaWdodENhbnZhcy5jYW52YXMpO1xuXHRcdFx0fVxuXHRcdFx0aW1hZ2UgPSBtYXBJbWFnZSA9PT0gbnVsbCA/IG51bGwgOiA8U2NhbGVkSW1hZ2UgYmFja2dyb3VuZD0nYmxhY2snIGltYWdlPXttYXBJbWFnZS5jYW52YXN9IHNjYWxlPXtpbnB1dC5zY2FsZX0vPlxuXHRcdH1cblxuXHRcdHJldHVybiA8ZGl2IHN0eWxlPXsnd2lkdGg6ICcgKyAoaW5wdXQud2lkdGggKiBpbnB1dC5zY2FsZSkgKyAncHg7IGhlaWdodDogJyArIChpbnB1dC5oZWlnaHQgKiBpbnB1dC5zY2FsZSkgKyAncHgnfT5cblx0XHRcdHtpbWFnZX1cblx0XHRcdHtpbnB1dC5saWdodE1vdmVkICE9PSB1bmRlZmluZWQgJiYgPERyYWdnYWJsZUxpZ2h0IHNjYWxlPXtzY2FsZX0gd2lkdGg9e3dpZHRofSBoZWlnaHQ9e2hlaWdodH0gbGlnaHRYPXtpbnB1dC5saWdodFghfSBsaWdodFk9e2lucHV0LmxpZ2h0WSF9IGxpZ2h0Wj17aW5wdXQubGlnaHRaIX0gbGlnaHRNb3ZlZD17aW5wdXQubGlnaHRNb3ZlZH0vPn1cblx0XHQ8L2Rpdj47XG5cdH1cblxufVxuXG5mdW5jdGlvbiBpbWFnZVRvQ2FudmFzKGltYWdlOiBIVE1MSW1hZ2VFbGVtZW50LCB3aWxsUmVhZEZyZXF1ZW50bHkgPSBmYWxzZSk6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCB7XG5cdGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuXHRjYW52YXMud2lkdGggPSBpbWFnZS53aWR0aDtcblx0Y2FudmFzLmhlaWdodCA9IGltYWdlLmhlaWdodDtcblx0Y29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJywgeyB3aWxsUmVhZEZyZXF1ZW50bHkgfSkhO1xuXHRjdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG5cdGN0eC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDApO1xuXHRyZXR1cm4gY3R4O1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZUFtYmllbnRMaWdodENhbnZhcyh3aWR0aDogaW50LCBoZWlnaHQ6IGludCwgbGlnaHQ6IHN0cmluZywgd2lsbFJlYWRGcmVxdWVudGx5ID0gZmFsc2UpOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQge1xuXHRjb25zdCBsaWdodGluZ0NhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuXHRsaWdodGluZ0NhbnZhcy53aWR0aCA9IHdpZHRoO1xuXHRsaWdodGluZ0NhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG5cdGNvbnN0IGxpZ2h0aW5nQ3R4ID0gbGlnaHRpbmdDYW52YXMuZ2V0Q29udGV4dCgnMmQnLCB7IHdpbGxSZWFkRnJlcXVlbnRseSB9KSE7XG5cdGxpZ2h0aW5nQ3R4LmZpbGxTdHlsZSA9IGxpZ2h0O1xuXHRsaWdodGluZ0N0eC5maWxsUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcblx0cmV0dXJuIGxpZ2h0aW5nQ3R4O1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZUltYWdlTGl0V2l0aEFtYmllbnRMaWdodCh0YXJnZXQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgbGlnaHRDb2xvcjogc3RyaW5nKTogSFRNTENhbnZhc0VsZW1lbnQge1xuXHRjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcblx0Y2FudmFzLndpZHRoID0gdGFyZ2V0LmNhbnZhcy53aWR0aDtcblx0Y2FudmFzLmhlaWdodCA9IHRhcmdldC5jYW52YXMuaGVpZ2h0O1xuXHRjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKSE7XG5cdGN0eC5kcmF3SW1hZ2UodGFyZ2V0LmNhbnZhcywgMCwgMCk7XG5cblx0Y29uc3QgbGlnaHRpbmdDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcblx0bGlnaHRpbmdDYW52YXMud2lkdGggPSB0YXJnZXQuY2FudmFzLndpZHRoO1xuXHRsaWdodGluZ0NhbnZhcy5oZWlnaHQgPSB0YXJnZXQuY2FudmFzLmhlaWdodDtcblx0Y29uc3QgbGlnaHRpbmdDdHggPSBsaWdodGluZ0NhbnZhcy5nZXRDb250ZXh0KCcyZCcpITtcblx0bGlnaHRpbmdDdHguZHJhd0ltYWdlKHRhcmdldC5jYW52YXMsIDAsIDApO1xuXHRsaWdodGluZ0N0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLWluJztcblx0bGlnaHRpbmdDdHguZmlsbFN0eWxlID0gbGlnaHRDb2xvcjtcblx0bGlnaHRpbmdDdHguZmlsbFJlY3QoMCwgMCwgdGFyZ2V0LmNhbnZhcy53aWR0aCwgdGFyZ2V0LmNhbnZhcy5oZWlnaHQpO1xuXG5cdGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnbXVsdGlwbHknO1xuXHRjdHguZHJhd0ltYWdlKGxpZ2h0aW5nQ2FudmFzLCAwLCAwKTtcblx0Y3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2Utb3Zlcic7XG5cblx0cmV0dXJuIGNhbnZhcztcbn1cblxuZnVuY3Rpb24gY29udmVydE5vcm1hbERhdGEobm9ybWFsTWFwOiBJbWFnZURhdGEpOiBGbG9hdDMyQXJyYXkge1xuXHRjb25zdCBwaXhlbENvdW50ID0gbm9ybWFsTWFwLndpZHRoICogbm9ybWFsTWFwLmhlaWdodDtcblx0Y29uc3Qgbm9ybWFsRGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkocGl4ZWxDb3VudCAqIDIpO1xuXHRmb3IgKGxldCBpID0gMDsgaSA8IHBpeGVsQ291bnQ7IGkrKykge1xuXHRcdGNvbnN0IHBpeGVsRGF0YUluZGV4ID0gaSAqIDQ7XG5cdFx0Y29uc3Qgbm9ybWFsUiA9IG5vcm1hbE1hcC5kYXRhW3BpeGVsRGF0YUluZGV4XTtcblx0XHRjb25zdCBub3JtYWxHID0gbm9ybWFsTWFwLmRhdGFbcGl4ZWxEYXRhSW5kZXggKyAxXTtcblx0XHRpZiAobm9ybWFsUiAhPT0gMCB8fCBub3JtYWxHICE9PSAwKSB7XG5cdFx0XHRjb25zdCBub3JtYWxYID0gbm9ybWFsUiAtIDEyODtcblx0XHRcdGNvbnN0IG5vcm1hbFkgPSBub3JtYWxHIC0gMTI4O1xuXHRcdFx0Y29uc3Qgbm9ybWFsVmVjdG9yTWFnbml0dWRlID0gTWF0aC5zcXJ0KG5vcm1hbFggKiBub3JtYWxYICsgbm9ybWFsWSAqIG5vcm1hbFkpO1xuXHRcdFx0Y29uc3Qgbm9ybWFsaXplZE5vcm1hbFZlY3RvclggPSBub3JtYWxYIC8gbm9ybWFsVmVjdG9yTWFnbml0dWRlO1xuXHRcdFx0Y29uc3Qgbm9ybWFsaXplZE5vcm1hbFZlY3RvclkgPSBub3JtYWxZIC8gbm9ybWFsVmVjdG9yTWFnbml0dWRlO1xuXHRcdFx0bm9ybWFsRGF0YVtpICogMl0gPSBub3JtYWxpemVkTm9ybWFsVmVjdG9yWDtcblx0XHRcdG5vcm1hbERhdGFbaSAqIDIgKyAxXSA9IG5vcm1hbGl6ZWROb3JtYWxWZWN0b3JZO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbm9ybWFsRGF0YTtcbn1cblxuY29uc3QgSEVJR0hUX01BUF9WQUxVRV9ESVZJREVSID0gODtcblxuZnVuY3Rpb24gYXBwbHlEeW5hbWljTGlnaHRUb0xpZ2h0TWFwKFxuXHRsaWdodEN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuXHRsaWdodFg6IGludCxcblx0bGlnaHRZOiBpbnQsXG5cdGxpZ2h0WjogaW50LFxuXHRsaWdodENvbG9yOiBzdHJpbmcsXG5cdGxpZ2h0RGlzdGFuY2U6IGludCxcblx0bm9ybWFsRGF0YTogRmxvYXQzMkFycmF5IHwgbnVsbCxcblx0cGl4ZWxPZmZzZXRNYXA6IEltYWdlRGF0YSB8IG51bGwgPSBudWxsLFxuXHRoZWlnaHRNYXA6IEltYWdlRGF0YSB8IG51bGwgPSBudWxsLFxuXHRzaGFkb3dNYXA6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCB8IG51bGwgPSBudWxsLCAvLyBBbGwgZ3JleSBzbyBjaGFubmVsIGRvZXNuJ3QgbWF0dGVyLCBjb2xvciB2YWx1ZSBjb3JyZXNwb25kcyB0byBoZWlnaHQgb2YgdGhlIG9iamVjdCBhdCB0aGF0IHgveVxuXHRhcHBseVBpeGVsT2Zmc2V0VG9TaGFkb3dDYWxjdWxhdGlvbnM6IGJvb2xlYW4gfCBudWxsID0gbnVsbFxuKTogdm9pZCB7XG5cblx0Y29uc3QgbGlnaHRDb2xvclBhcnNlZCA9IENvbG9ycy51bnBhY2soQ29sb3JzLmNzc1RvUGFja2VkKGxpZ2h0Q29sb3IpKTtcblx0Y29uc3QgZHluYW1pY0xpZ2h0UiA9IGxpZ2h0Q29sb3JQYXJzZWQucjtcblx0Y29uc3QgZHluYW1pY0xpZ2h0RyA9IGxpZ2h0Q29sb3JQYXJzZWQuZztcblx0Y29uc3QgZHluYW1pY0xpZ2h0QiA9IGxpZ2h0Q29sb3JQYXJzZWQuYjtcblx0Y29uc3QgbGlnaHREaXN0YW5jZVNxdWFyZWQgPSBsaWdodERpc3RhbmNlICogbGlnaHREaXN0YW5jZTtcblxuXHRjb25zdCBsaWdodENhbnZhcyA9IGxpZ2h0Q3R4LmNhbnZhcztcblxuXHRjb25zdCBpbWFnZURhdGEgPSBsaWdodEN0eC5nZXRJbWFnZURhdGEoMCwgMCwgbGlnaHRDYW52YXMud2lkdGgsIGxpZ2h0Q2FudmFzLmhlaWdodCk7XG5cblx0bGV0IHBpeGVsT2Zmc2V0RGF0YTogVWludDhDbGFtcGVkQXJyYXkgfCBudWxsID0gbnVsbDtcblx0aWYgKHBpeGVsT2Zmc2V0TWFwICE9PSBudWxsKSB7XG5cdFx0cGl4ZWxPZmZzZXREYXRhID0gcGl4ZWxPZmZzZXRNYXAuZGF0YTtcblx0fVxuXG5cdGxldCBoZWlnaHRQaXhlbERhdGE6IFVpbnQ4Q2xhbXBlZEFycmF5IHwgbnVsbCA9IG51bGw7XG5cdGlmIChoZWlnaHRNYXAgIT09IG51bGwpIHtcblx0XHRoZWlnaHRQaXhlbERhdGEgPSBoZWlnaHRNYXAuZGF0YTtcblx0fVxuXG5cdGxldCBzaGFkb3dQaXhlbERhdGE6IFVpbnQ4Q2xhbXBlZEFycmF5IHwgbnVsbCA9IG51bGw7XG5cdGlmIChzaGFkb3dNYXAgIT09IG51bGwpIHtcblx0XHRjb25zdCBzaGFkb3dEYXRhID0gc2hhZG93TWFwLmdldEltYWdlRGF0YSgwLCAwLCBzaGFkb3dNYXAuY2FudmFzLndpZHRoLCBzaGFkb3dNYXAuY2FudmFzLmhlaWdodCk7XG5cdFx0c2hhZG93UGl4ZWxEYXRhID0gc2hhZG93RGF0YS5kYXRhO1xuXHR9XG5cblx0Y29uc3QgZWFzaW5nRnVuYyA9IGVhc2luZy5saW5lYXI7XG5cblx0Y29uc3QgaW1hZ2VXaWR0aCA9IGxpZ2h0Q2FudmFzLndpZHRoO1xuXHRjb25zdCBpbWFnZUhlaWdodCA9IGxpZ2h0Q2FudmFzLmhlaWdodDtcblxuXHRmb3IgKGxldCBwaXhlbFkgPSAwOyBwaXhlbFkgPCBpbWFnZUhlaWdodDsgcGl4ZWxZKyspIHtcblx0XHRmb3IgKGxldCBwaXhlbFggPSAwOyBwaXhlbFggPCBpbWFnZVdpZHRoOyBwaXhlbFgrKykge1xuXG5cdFx0XHRjb25zdCBwaXhlbEluZGV4ID0gKHBpeGVsWSAqIGltYWdlV2lkdGgpICsgcGl4ZWxYO1xuXHRcdFx0Y29uc3QgcGl4ZWxEYXRhSW5kZXggPSBwaXhlbEluZGV4ICogNDtcblxuXHRcdFx0Ly8gQ29ycmVjdCB0aGUgcGl4ZWwgeC95IGFjY29yZGluZyB0byB0aGUgb2Zmc2V0IG1hcCwgdG8gdHJlYXQgaXQgYXMgaWYgaXQgd2FzIHVuc2tld2VkIGFuZCBkaXJlY3RseSBiZWxvdyB0aGUgY2FtZXJhXG5cdFx0XHRjb25zdCBjb3JyZWN0ZWRQaXhlbFggPSBwaXhlbFg7XG5cdFx0XHRsZXQgY29ycmVjdGVkUGl4ZWxZID0gcGl4ZWxZO1xuXHRcdFx0aWYgKHBpeGVsT2Zmc2V0RGF0YSAhPT0gbnVsbCkge1xuXHRcdFx0XHRjb3JyZWN0ZWRQaXhlbFkgKz0gcGl4ZWxPZmZzZXREYXRhW3BpeGVsRGF0YUluZGV4XSAvIEhFSUdIVF9NQVBfVkFMVUVfRElWSURFUjtcblx0XHRcdH1cblx0XHRcdGNvbnN0IGNvcnJlY3RlZFBpeGVsRGF0YUluZGV4ID0gKChjb3JyZWN0ZWRQaXhlbFkgKiBpbWFnZVdpZHRoKSArIGNvcnJlY3RlZFBpeGVsWCkgKiA0O1xuXG5cdFx0XHQvLyBHZXQgdGhlIHBpeGVsIFogdmFsdWVcblx0XHRcdGxldCBwaXhlbFogPSAwO1xuXHRcdFx0aWYgKGhlaWdodFBpeGVsRGF0YSAhPT0gbnVsbCkge1xuXHRcdFx0XHRwaXhlbFogPSBoZWlnaHRQaXhlbERhdGFbY29ycmVjdGVkUGl4ZWxEYXRhSW5kZXhdIC8gSEVJR0hUX01BUF9WQUxVRV9ESVZJREVSO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBkaXN0YW5jZVNxdWFyZWQgPSBVdGlscy5weXRoYWdvcmVhbkRpc3RhbmNlU3F1YXJlZDMoY29ycmVjdGVkUGl4ZWxYLCBjb3JyZWN0ZWRQaXhlbFksIHBpeGVsWiwgbGlnaHRYLCBsaWdodFksIGxpZ2h0Wik7XG5cdFx0XHRpZiAoZGlzdGFuY2VTcXVhcmVkIDwgbGlnaHREaXN0YW5jZVNxdWFyZWQpIHtcblxuXHRcdFx0XHQvLyBJZiB0aGUgcGl4ZWwgaGVpZ2h0IGlzIGJlbG93IHRoZSBzaGFkb3cgYXQgdGhhdCB4L3ksIHNraXAgaXQgc28gd2UgZG9uJ3QgYXBwbHkgdGhlIGR5bmFtaWMgbGlnaHRcblx0XHRcdFx0aWYgKGhlaWdodFBpeGVsRGF0YSAhPT0gbnVsbCAmJiBzaGFkb3dQaXhlbERhdGEgIT09IG51bGwpIHtcblx0XHRcdFx0XHRsZXQgaW5kZXg6IGludDtcblx0XHRcdFx0XHRpZiAoYXBwbHlQaXhlbE9mZnNldFRvU2hhZG93Q2FsY3VsYXRpb25zKSB7XG5cdFx0XHRcdFx0XHRpbmRleCA9IGNvcnJlY3RlZFBpeGVsRGF0YUluZGV4O1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRpbmRleCA9IHBpeGVsRGF0YUluZGV4O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb25zdCBoZWlnaHQgPSBoZWlnaHRQaXhlbERhdGFbaW5kZXhdO1xuXHRcdFx0XHRcdGNvbnN0IHNoYWRvd0hlaWdodCA9IHNoYWRvd1BpeGVsRGF0YVtpbmRleF0gLyA4O1xuXHRcdFx0XHRcdGlmIChoZWlnaHQgPCBzaGFkb3dIZWlnaHQpIGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IG5vcm1hbFggPSAwO1xuXHRcdFx0XHRsZXQgbm9ybWFsWSA9IDA7XG5cdFx0XHRcdGlmIChub3JtYWxEYXRhICE9PSBudWxsKSB7XG5cdFx0XHRcdFx0bm9ybWFsWCA9IG5vcm1hbERhdGFbcGl4ZWxJbmRleCAqIDJdO1xuXHRcdFx0XHRcdG5vcm1hbFkgPSBub3JtYWxEYXRhW3BpeGVsSW5kZXggKiAyICsgMV07XG5cdFx0XHRcdH1cblx0XHRcdFx0bGV0IGludGVuc2l0eUZyb21Ob3JtYWw6IG51bWJlciA9IDE7XG5cdFx0XHRcdGlmIChub3JtYWxYICE9PSAwIHx8IG5vcm1hbFkgIT09IDApIHtcblxuXHRcdFx0XHRcdGNvbnN0IGxpZ2h0VmVjdG9yWCA9IGxpZ2h0WCAtIGNvcnJlY3RlZFBpeGVsWDtcblx0XHRcdFx0XHRjb25zdCBsaWdodFZlY3RvclkgPSBjb3JyZWN0ZWRQaXhlbFkgLSBsaWdodFk7XG5cdFx0XHRcdFx0Y29uc3QgbGlnaHRWZWN0b3JNYWduaXR1ZGUgPSBNYXRoLnNxcnQobGlnaHRWZWN0b3JYICogbGlnaHRWZWN0b3JYICsgbGlnaHRWZWN0b3JZICogbGlnaHRWZWN0b3JZKTtcblx0XHRcdFx0XHRjb25zdCBub3JtYWxpemVkTGlnaHRWZWN0b3JYID0gbGlnaHRWZWN0b3JYIC8gbGlnaHRWZWN0b3JNYWduaXR1ZGU7XG5cdFx0XHRcdFx0Y29uc3Qgbm9ybWFsaXplZExpZ2h0VmVjdG9yWSA9IGxpZ2h0VmVjdG9yWSAvIGxpZ2h0VmVjdG9yTWFnbml0dWRlO1xuXG5cdFx0XHRcdFx0Y29uc3QgZG90UHJvZHVjdCA9IG5vcm1hbGl6ZWRMaWdodFZlY3RvclggKiBub3JtYWxYICsgbm9ybWFsaXplZExpZ2h0VmVjdG9yWSAqIG5vcm1hbFk7IC8vIFRoaXMgc2VlbXMgdG8gcmFuZ2UgZnJvbSAtMSB0byAxXG5cdFx0XHRcdFx0Y29uc3QgZG90UHJvZHVjdE5vcm1hbGl6ZWRGcm9tMFRvMSA9IChkb3RQcm9kdWN0ICsgMSkgLyAyO1xuXG5cdFx0XHRcdFx0aW50ZW5zaXR5RnJvbU5vcm1hbCA9IGVhc2luZ0Z1bmMoZG90UHJvZHVjdE5vcm1hbGl6ZWRGcm9tMFRvMSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBsaWdodEludGVuc2l0eSA9ICgobGlnaHREaXN0YW5jZSAtIE1hdGguc3FydChkaXN0YW5jZVNxdWFyZWQpKSAvIGxpZ2h0RGlzdGFuY2UpICogaW50ZW5zaXR5RnJvbU5vcm1hbDtcblx0XHRcdFx0Y29uc3QgbmV3UiA9IE1hdGgucm91bmQobGlnaHRJbnRlbnNpdHkgKiBkeW5hbWljTGlnaHRSKTtcblx0XHRcdFx0Y29uc3QgbmV3RyA9IE1hdGgucm91bmQobGlnaHRJbnRlbnNpdHkgKiBkeW5hbWljTGlnaHRHKTtcblx0XHRcdFx0Y29uc3QgbmV3QiA9IE1hdGgucm91bmQobGlnaHRJbnRlbnNpdHkgKiBkeW5hbWljTGlnaHRCKTtcblxuXHRcdFx0XHRpbWFnZURhdGEuZGF0YVtwaXhlbERhdGFJbmRleF0gKz0gbmV3Ujtcblx0XHRcdFx0aW1hZ2VEYXRhLmRhdGFbcGl4ZWxEYXRhSW5kZXggKyAxXSArPSBuZXdHO1xuXHRcdFx0XHRpbWFnZURhdGEuZGF0YVtwaXhlbERhdGFJbmRleCArIDJdICs9IG5ld0I7XG5cdFx0XHRcdGltYWdlRGF0YS5kYXRhW3BpeGVsRGF0YUluZGV4ICsgM10gPSAyNTU7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0bGlnaHRDdHgucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgMCwgMCk7XG59XG5cbmZ1bmN0aW9uIGFwcGx5TGlnaHRJbWFnZVRvQ2FudmFzKHRhcmdldDogSFRNTENhbnZhc0VsZW1lbnQsIGxpZ2h0OiBIVE1MQ2FudmFzRWxlbWVudCk6IHZvaWQge1xuXHRhc3NlcnQodGFyZ2V0LndpZHRoID09PSBsaWdodC53aWR0aCk7XG5cdGFzc2VydCh0YXJnZXQuaGVpZ2h0ID09PSBsaWdodC5oZWlnaHQpO1xuXHRjb25zdCB0YXJnZXRDdHggPSB0YXJnZXQuZ2V0Q29udGV4dCgnMmQnKSE7XG5cdHRhcmdldEN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnbXVsdGlwbHknO1xuXHR0YXJnZXRDdHguZHJhd0ltYWdlKGxpZ2h0LCAwLCAwKTtcblx0dGFyZ2V0Q3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2Utb3Zlcic7XG59XG5cbi8vIEdlbmVyYXRlIGEgc2hhZG93IG1hcCBnaXZlbiBhIGhlaWdodCBtYXAgYW5kIGEgZHluYW1pYyBsaWdodFxuLy8gVE9ETzogTXVsdGlwbGUgbGlnaHRzLCBhcHBseSB0byBleGlzdGluZyBzaGFkb3cgbWFwXG4vLyBUT0RPOiBPcHRpbWl6ZSwgc3RvcmUgaGVpZ2h0IGRhdGEgYXMgYSBzaW5nbGUgYXJyYXkgYnVmZmVyIHJhdGhlciB0aGFuIGEgY2FudmFzP1xuZnVuY3Rpb24gZ2VuZXJhdGVTaGFkb3dNYXBCeUNhc3RpbmdQaXhlbHMoaGVpZ2h0TWFwOiBJbWFnZURhdGEsIGxpZ2h0WDogZmxvYXQsIGxpZ2h0WTogZmxvYXQsIGxpZ2h0WjogZmxvYXQsIHdpbGxSZWFkRnJlcXVlbnRseTogYm9vbGVhbik6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCB7XG5cblx0Y29uc3Qgd2lkdGggPSBoZWlnaHRNYXAud2lkdGg7XG5cdGNvbnN0IGhlaWdodCA9IGhlaWdodE1hcC5oZWlnaHQ7XG5cblx0Y29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG5cdGNhbnZhcy53aWR0aCA9IHdpZHRoO1xuXHRjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXHRjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnLCB7IHdpbGxSZWFkRnJlcXVlbnRseTogd2lsbFJlYWRGcmVxdWVudGx5IH0pITtcblxuXHRjb25zdCBoZWlnaHREYXRhID0gaGVpZ2h0TWFwLmRhdGE7XG5cblx0Y3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdsaWdodGVuJzsgLy8gV2UgdXNlICdsaWdodGVuJyB0byBlbnN1cmUgdGhhdCBtdWx0aXBsZSBzaGFkb3dzIHdpbGwgb3ZlcndyaXRlIGNvcnJlY3RseSwgdGhlIGhpZ2hlciBzaGFkb3cgXCJ3aW5zXCJcblx0Ly8gY3R4LmZpbHRlciA9ICdibHVyKDFweCknO1xuXG5cdGZvciAobGV0IHBpeGVsWSA9IDA7IHBpeGVsWSA8IGhlaWdodDsgcGl4ZWxZKyspIHtcblx0XHRmb3IgKGxldCBwaXhlbFggPSAwOyBwaXhlbFggPCB3aWR0aDsgcGl4ZWxYKyspIHtcblx0XHRcdGNvbnN0IGkgPSAoKHBpeGVsWSAqIHdpZHRoKSArIHBpeGVsWCkgKiA0O1xuXHRcdFx0Y29uc3QgaGVpZ2h0VmFsdWUgPSBoZWlnaHREYXRhW2ldO1xuXHRcdFx0aWYgKGhlaWdodFZhbHVlID4gMCkge1xuXHRcdFx0XHRjb25zdCB0b3BMZWZ0WCA9IHBpeGVsWDtcblx0XHRcdFx0Y29uc3QgdG9wTGVmdFkgPSBwaXhlbFk7XG5cdFx0XHRcdGNvbnN0IHRvcFJpZ2h0WCA9IHBpeGVsWCArIDE7XG5cdFx0XHRcdGNvbnN0IHRvcFJpZ2h0WSA9IHBpeGVsWTtcblx0XHRcdFx0Y29uc3QgYm90dG9tTGVmdFggPSBwaXhlbFg7XG5cdFx0XHRcdGNvbnN0IGJvdHRvbUxlZnRZID0gcGl4ZWxZICsgMTtcblx0XHRcdFx0Y29uc3QgYm90dG9tUmlnaHRYID0gcGl4ZWxYICsgMTtcblx0XHRcdFx0Y29uc3QgYm90dG9tUmlnaHRZID0gcGl4ZWxZICsgMTtcblxuXHRcdFx0XHRjb25zdCBhbmdsZUZyb21MaWdodFRvUGl4ZWxUb3BMZWZ0ID0gTWF0aC5hdGFuMihwaXhlbFkgLSBsaWdodFksIHBpeGVsWCAtIGxpZ2h0WCk7XG5cdFx0XHRcdGNvbnN0IGFuZ2xlRnJvbUxpZ2h0VG9QaXhlbFRvcFJpZ2h0ID0gTWF0aC5hdGFuMihwaXhlbFkgLSBsaWdodFksIHBpeGVsWCArIDEgLSBsaWdodFgpO1xuXHRcdFx0XHRjb25zdCBhbmdsZUZyb21MaWdodFRvUGl4ZWxCb3R0b21MZWZ0ID0gTWF0aC5hdGFuMihwaXhlbFkgKyAxIC0gbGlnaHRZLCBwaXhlbFggLSBsaWdodFgpO1xuXHRcdFx0XHRjb25zdCBhbmdsZUZyb21MaWdodFRvUGl4ZWxCb3R0b21SaWdodCA9IE1hdGguYXRhbjIocGl4ZWxZICsgMSAtIGxpZ2h0WSwgcGl4ZWxYICsgMSAtIGxpZ2h0WCk7XG5cblx0XHRcdFx0Y29uc3QgaGVpZ2h0UmVkdWN0aW9uRmFjdG9yVG9SZWR1Y2VTZWxmU2hhZG93Tm9pc2UgPSAwO1xuXHRcdFx0XHRjb25zdCBncmV5VmFsdWUgPSBoZWlnaHRWYWx1ZSAtIGhlaWdodFJlZHVjdGlvbkZhY3RvclRvUmVkdWNlU2VsZlNoYWRvd05vaXNlO1xuXG5cdFx0XHRcdGNvbnN0IHRvcExlZnREZWx0YVggPSBNYXRoLmNvcyhhbmdsZUZyb21MaWdodFRvUGl4ZWxUb3BMZWZ0KTtcblx0XHRcdFx0Y29uc3QgdG9wTGVmdERlbHRhWSA9IE1hdGguc2luKGFuZ2xlRnJvbUxpZ2h0VG9QaXhlbFRvcExlZnQpO1xuXG5cdFx0XHRcdGNvbnN0IHRvcFJpZ2h0RGVsdGFYID0gTWF0aC5jb3MoYW5nbGVGcm9tTGlnaHRUb1BpeGVsVG9wUmlnaHQpO1xuXHRcdFx0XHRjb25zdCB0b3BSaWdodERlbHRhWSA9IE1hdGguc2luKGFuZ2xlRnJvbUxpZ2h0VG9QaXhlbFRvcFJpZ2h0KTtcblxuXHRcdFx0XHRjb25zdCBib3R0b21MZWZ0RGVsdGFYID0gTWF0aC5jb3MoYW5nbGVGcm9tTGlnaHRUb1BpeGVsQm90dG9tTGVmdCk7XG5cdFx0XHRcdGNvbnN0IGJvdHRvbUxlZnREZWx0YVkgPSBNYXRoLnNpbihhbmdsZUZyb21MaWdodFRvUGl4ZWxCb3R0b21MZWZ0KTtcblxuXHRcdFx0XHRjb25zdCBib3R0b21SaWdodERlbHRhWCA9IE1hdGguY29zKGFuZ2xlRnJvbUxpZ2h0VG9QaXhlbEJvdHRvbVJpZ2h0KTtcblx0XHRcdFx0Y29uc3QgYm90dG9tUmlnaHREZWx0YVkgPSBNYXRoLnNpbihhbmdsZUZyb21MaWdodFRvUGl4ZWxCb3R0b21SaWdodCk7XG5cblx0XHRcdFx0Ly8gVE9ETzogUHJlLWNvbWJpbmUgcGl4ZWxzIGludG8gcmVjdHMsIHN0cm9rZSB0aGUgZW50aXJlIHJlY3QgYW5kIGl0cyBleHBhbnNpb24gaW4gb25lIG9wZXJhdGlvbjsgaG93IGRvIHdlIGNhbGN1bGF0ZSB0aGUgc2hhcGUgZm9yIHRoZSByZWN0IGFuZCBpdHMgZXhwYW5kZWQgdmVyc2lvbj9cblxuXHRcdFx0XHRsZXQgc2hhZG93RGlzdGFuY2U6IGludDtcblx0XHRcdFx0Y29uc3QgcGl4ZWxIZWlnaHRJblBpeGVscyA9IGhlaWdodFZhbHVlIC8gSEVJR0hUX01BUF9WQUxVRV9ESVZJREVSO1xuXHRcdFx0XHRpZiAobGlnaHRaIDw9IHBpeGVsSGVpZ2h0SW5QaXhlbHMpIHtcblx0XHRcdFx0XHQvLyBMaWdodCBpcyBsb3dlciB0aGFuIHRoZSBwaXhlbCwgc2hhZG93IGV4dGVuZHMgdG8gaW5mbml0eVxuXHRcdFx0XHRcdHNoYWRvd0Rpc3RhbmNlID0gMTAwOyAvLyBUT0RPOiBDYWxjdWxhdGUgbWluaW11bSBuZWVkZWQgaGVyZSBiYXNlZCBvbiB0aGUgdmlld3BvcnRcblx0XG5cdFx0XHRcdFx0Y3R4LmZpbGxTdHlsZSA9ICdncmV5Jztcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHQvLyBsZXQgYW5nbGVPZkxpZ2h0U291cmNlUmVsYXRpdmVUb1BpeGVsID0gTWF0aC5hdGFuKHBpeGVsSGVpZ2h0SW5QaXhlbHMgLyBsaWdodFopO1xuXHRcdFx0XHRcdC8vIHNoYWRvd0Rpc3RhbmNlID0gcGl4ZWxIZWlnaHRJblBpeGVscyAqIE1hdGgudGFuKGFuZ2xlT2ZMaWdodFNvdXJjZVJlbGF0aXZlVG9QaXhlbCk7XG5cdFxuXHRcdFx0XHRcdGNvbnN0IGRpc3RhbmNlRnJvbUxpZ2h0VG9QaXhlbCA9IFV0aWxzLnB5dGhhZ29yZWFuRGlzdGFuY2UobGlnaHRYLCBsaWdodFksIHBpeGVsWCArIDAuNSwgcGl4ZWxZICsgMC41KTtcblxuXHRcdFx0XHRcdGNvbnN0IGZ1ZGdlRmFjdG9yID0gNDtcblxuXHRcdFx0XHRcdGNvbnN0IGxpZ2h0U3RyaWRlID0gZGlzdGFuY2VGcm9tTGlnaHRUb1BpeGVsIC8gKGxpZ2h0WiArIGZ1ZGdlRmFjdG9yIC0gcGl4ZWxIZWlnaHRJblBpeGVscyk7XG5cblx0XHRcdFx0XHRzaGFkb3dEaXN0YW5jZSA9IGxpZ2h0U3RyaWRlICogcGl4ZWxIZWlnaHRJblBpeGVscztcblx0XG5cdFx0XHRcdFx0Y29uc3QgZ3JhZGllbnQgPSBjdHguY3JlYXRlUmFkaWFsR3JhZGllbnQocGl4ZWxYLCBwaXhlbFksIDEsIHBpeGVsWCwgcGl4ZWxZLCBzaGFkb3dEaXN0YW5jZSk7XG5cdFx0XHRcdFx0Z3JhZGllbnQuYWRkQ29sb3JTdG9wKDAsICdyZ2IoJyArIGdyZXlWYWx1ZSArICcsJyArIGdyZXlWYWx1ZSArICcsJyArIGdyZXlWYWx1ZSArICcpJyk7XG5cdFx0XHRcdFx0Z3JhZGllbnQuYWRkQ29sb3JTdG9wKDEsICdyZ2IoJyArIDAgKyAnLCcgKyAwICsgJywnICsgMCArICcsJyArIDAgKyAnKScpO1xuXHRcdFx0XHRcdGN0eC5maWxsU3R5bGUgPSBncmFkaWVudDtcblx0XHRcdFx0fVxuXG5cblx0XHRcdFx0Ly8gUHJvamVjdCB0aGUgdG9wLWxlZnQgY29ybmVyXG5cdFx0XHRcdGNvbnN0IHByb2plY3RlZFRvcExlZnRYID0gdG9wTGVmdFggKyB0b3BMZWZ0RGVsdGFYICogc2hhZG93RGlzdGFuY2U7XG5cdFx0XHRcdGNvbnN0IHByb2plY3RlZFRvcExlZnRZID0gdG9wTGVmdFkgKyB0b3BMZWZ0RGVsdGFZICogc2hhZG93RGlzdGFuY2U7XG5cblx0XHRcdFx0Ly8gUHJvamVjdCB0aGUgdG9wLXJpZ2h0IGNvcm5lclxuXHRcdFx0XHRjb25zdCBwcm9qZWN0ZWRUb3BSaWdodFggPSB0b3BSaWdodFggKyB0b3BSaWdodERlbHRhWCAqIHNoYWRvd0Rpc3RhbmNlO1xuXHRcdFx0XHRjb25zdCBwcm9qZWN0ZWRUb3BSaWdodFkgPSB0b3BSaWdodFkgKyB0b3BSaWdodERlbHRhWSAqIHNoYWRvd0Rpc3RhbmNlO1xuXG5cdFx0XHRcdC8vIFByb2plY3QgdGhlIGJvdHRvbS1sZWZ0IGNvcm5lclxuXHRcdFx0XHRjb25zdCBwcm9qZWN0ZWRCb3R0b21MZWZ0WCA9IGJvdHRvbUxlZnRYICsgYm90dG9tTGVmdERlbHRhWCAqIHNoYWRvd0Rpc3RhbmNlO1xuXHRcdFx0XHRjb25zdCBwcm9qZWN0ZWRCb3R0b21MZWZ0WSA9IGJvdHRvbUxlZnRZICsgYm90dG9tTGVmdERlbHRhWSAqIHNoYWRvd0Rpc3RhbmNlO1xuXG5cdFx0XHRcdC8vIFByb2plY3QgdGhlIGJvdHRvbS1yaWdodCBjb3JuZXJcblx0XHRcdFx0Y29uc3QgcHJvamVjdGVkQm90dG9tUmlnaHRYID0gYm90dG9tUmlnaHRYICsgYm90dG9tUmlnaHREZWx0YVggKiBzaGFkb3dEaXN0YW5jZTtcblx0XHRcdFx0Y29uc3QgcHJvamVjdGVkQm90dG9tUmlnaHRZID0gYm90dG9tUmlnaHRZICsgYm90dG9tUmlnaHREZWx0YVkgKiBzaGFkb3dEaXN0YW5jZTtcblxuXHRcdFx0XHQvLyBEZXRlcm1pbmUgdG9wLW1vc3QgZWRnZVxuXHRcdFx0XHRsZXQgdG9wTW9zdEVkZ2VYMTogbnVtYmVyO1xuXHRcdFx0XHRsZXQgdG9wTW9zdEVkZ2VZMTogbnVtYmVyO1xuXHRcdFx0XHRsZXQgdG9wTW9zdEVkZ2VYMjogbnVtYmVyO1xuXHRcdFx0XHRsZXQgdG9wTW9zdEVkZ2VZMjogbnVtYmVyO1xuXHRcdFx0XHRpZiAocHJvamVjdGVkVG9wTGVmdFkgPCB0b3BMZWZ0WSkge1xuXHRcdFx0XHRcdHRvcE1vc3RFZGdlWDEgPSBwcm9qZWN0ZWRUb3BMZWZ0WDtcblx0XHRcdFx0XHR0b3BNb3N0RWRnZVkxID0gcHJvamVjdGVkVG9wTGVmdFk7XG5cdFx0XHRcdFx0dG9wTW9zdEVkZ2VYMiA9IHByb2plY3RlZFRvcFJpZ2h0WDtcblx0XHRcdFx0XHR0b3BNb3N0RWRnZVkyID0gcHJvamVjdGVkVG9wUmlnaHRZO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRvcE1vc3RFZGdlWDEgPSB0b3BMZWZ0WDtcblx0XHRcdFx0XHR0b3BNb3N0RWRnZVkxID0gdG9wTGVmdFk7XG5cdFx0XHRcdFx0dG9wTW9zdEVkZ2VYMiA9IHRvcFJpZ2h0WDtcblx0XHRcdFx0XHR0b3BNb3N0RWRnZVkyID0gdG9wUmlnaHRZO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gRGV0ZXJtaW5lIHJpZ2h0LW1vc3QgZWRnZVxuXHRcdFx0XHRsZXQgcmlnaHRNb3N0RWRnZVgxOiBudW1iZXI7XG5cdFx0XHRcdGxldCByaWdodE1vc3RFZGdlWTE6IG51bWJlcjtcblx0XHRcdFx0bGV0IHJpZ2h0TW9zdEVkZ2VYMjogbnVtYmVyO1xuXHRcdFx0XHRsZXQgcmlnaHRNb3N0RWRnZVkyOiBudW1iZXI7XG5cdFx0XHRcdGlmIChwcm9qZWN0ZWRUb3BSaWdodFggPiB0b3BSaWdodFgpIHtcblx0XHRcdFx0XHRyaWdodE1vc3RFZGdlWDEgPSBwcm9qZWN0ZWRUb3BSaWdodFg7XG5cdFx0XHRcdFx0cmlnaHRNb3N0RWRnZVkxID0gcHJvamVjdGVkVG9wUmlnaHRZO1xuXHRcdFx0XHRcdHJpZ2h0TW9zdEVkZ2VYMiA9IHByb2plY3RlZEJvdHRvbVJpZ2h0WDtcblx0XHRcdFx0XHRyaWdodE1vc3RFZGdlWTIgPSBwcm9qZWN0ZWRCb3R0b21SaWdodFk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmlnaHRNb3N0RWRnZVgxID0gdG9wUmlnaHRYO1xuXHRcdFx0XHRcdHJpZ2h0TW9zdEVkZ2VZMSA9IHRvcFJpZ2h0WTtcblx0XHRcdFx0XHRyaWdodE1vc3RFZGdlWDIgPSBib3R0b21SaWdodFg7XG5cdFx0XHRcdFx0cmlnaHRNb3N0RWRnZVkyID0gYm90dG9tUmlnaHRZO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHQvLyBEZXRlcm1pbmUgYm90dG9tLW1vc3QgZWRnZVxuXHRcdFx0XHRsZXQgYm90dG9tTW9zdEVkZ2VYMTogbnVtYmVyO1xuXHRcdFx0XHRsZXQgYm90dG9tTW9zdEVkZ2VZMTogbnVtYmVyO1xuXHRcdFx0XHRsZXQgYm90dG9tTW9zdEVkZ2VYMjogbnVtYmVyO1xuXHRcdFx0XHRsZXQgYm90dG9tTW9zdEVkZ2VZMjogbnVtYmVyO1xuXHRcdFx0XHRpZiAocHJvamVjdGVkQm90dG9tTGVmdFkgPiBib3R0b21MZWZ0WSkge1xuXHRcdFx0XHRcdGJvdHRvbU1vc3RFZGdlWDEgPSBwcm9qZWN0ZWRCb3R0b21MZWZ0WDtcblx0XHRcdFx0XHRib3R0b21Nb3N0RWRnZVkxID0gcHJvamVjdGVkQm90dG9tTGVmdFk7XG5cdFx0XHRcdFx0Ym90dG9tTW9zdEVkZ2VYMiA9IHByb2plY3RlZEJvdHRvbVJpZ2h0WDtcblx0XHRcdFx0XHRib3R0b21Nb3N0RWRnZVkyID0gcHJvamVjdGVkQm90dG9tUmlnaHRZO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGJvdHRvbU1vc3RFZGdlWDEgPSBib3R0b21MZWZ0WDtcblx0XHRcdFx0XHRib3R0b21Nb3N0RWRnZVkxID0gYm90dG9tTGVmdFk7XG5cdFx0XHRcdFx0Ym90dG9tTW9zdEVkZ2VYMiA9IGJvdHRvbVJpZ2h0WDtcblx0XHRcdFx0XHRib3R0b21Nb3N0RWRnZVkyID0gYm90dG9tUmlnaHRZO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHQvLyBEZXRlcm1pbmUgbGVmdC1tb3N0IGVkZ2Vcblx0XHRcdFx0bGV0IGxlZnRNb3N0RWRnZVgxOiBudW1iZXI7XG5cdFx0XHRcdGxldCBsZWZ0TW9zdEVkZ2VZMTogbnVtYmVyO1xuXHRcdFx0XHRsZXQgbGVmdE1vc3RFZGdlWDI6IG51bWJlcjtcblx0XHRcdFx0bGV0IGxlZnRNb3N0RWRnZVkyOiBudW1iZXI7XG5cdFx0XHRcdGlmIChwcm9qZWN0ZWRUb3BMZWZ0WCA8IHRvcExlZnRYKSB7XG5cdFx0XHRcdFx0bGVmdE1vc3RFZGdlWDEgPSBwcm9qZWN0ZWRUb3BMZWZ0WDtcblx0XHRcdFx0XHRsZWZ0TW9zdEVkZ2VZMSA9IHByb2plY3RlZFRvcExlZnRZO1xuXHRcdFx0XHRcdGxlZnRNb3N0RWRnZVgyID0gcHJvamVjdGVkQm90dG9tTGVmdFg7XG5cdFx0XHRcdFx0bGVmdE1vc3RFZGdlWTIgPSBwcm9qZWN0ZWRCb3R0b21MZWZ0WTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRsZWZ0TW9zdEVkZ2VYMSA9IHRvcExlZnRYO1xuXHRcdFx0XHRcdGxlZnRNb3N0RWRnZVkxID0gdG9wTGVmdFk7XG5cdFx0XHRcdFx0bGVmdE1vc3RFZGdlWDIgPSBib3R0b21MZWZ0WDtcblx0XHRcdFx0XHRsZWZ0TW9zdEVkZ2VZMiA9IGJvdHRvbUxlZnRZO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gRHJhdyB0aGUgZnVsbCBwcm9qZWN0ZWQgc2hhcGVcblx0XHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0XHRjdHgubW92ZVRvKHRvcE1vc3RFZGdlWDEsIHRvcE1vc3RFZGdlWTEpO1xuXHRcdFx0XHRjdHgubGluZVRvKHRvcE1vc3RFZGdlWDIsIHRvcE1vc3RFZGdlWTIpO1xuXHRcdFx0XHRjdHgubGluZVRvKHJpZ2h0TW9zdEVkZ2VYMSwgcmlnaHRNb3N0RWRnZVkxKTtcblx0XHRcdFx0Y3R4LmxpbmVUbyhyaWdodE1vc3RFZGdlWDIsIHJpZ2h0TW9zdEVkZ2VZMik7XG5cdFx0XHRcdGN0eC5saW5lVG8oYm90dG9tTW9zdEVkZ2VYMiwgYm90dG9tTW9zdEVkZ2VZMik7XG5cdFx0XHRcdGN0eC5saW5lVG8oYm90dG9tTW9zdEVkZ2VYMSwgYm90dG9tTW9zdEVkZ2VZMSk7XG5cdFx0XHRcdGN0eC5saW5lVG8obGVmdE1vc3RFZGdlWDIsIGxlZnRNb3N0RWRnZVkyKTtcblx0XHRcdFx0Y3R4LmxpbmVUbyhsZWZ0TW9zdEVkZ2VYMSwgbGVmdE1vc3RFZGdlWTEpO1xuXHRcdFx0XHRjdHgubGluZVRvKHRvcE1vc3RFZGdlWDEsIHRvcE1vc3RFZGdlWTEpO1xuXHRcdFx0XHRjdHguY2xvc2VQYXRoKCk7XG5cdFx0XHRcdGN0eC5maWxsKCk7XG5cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1vdmVyJztcblxuXHRyZXR1cm4gY3R4O1xufVxuXG50eXBlIEhlaWdodFJlY3QgPSB7XG5cdHg6IGludCxcblx0eTogaW50LFxuXHR3aWR0aDogaW50LFxuXHRoZWlnaHQ6IGludCxcblx0ejogaW50XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlSGVpZ2h0UmVjdHMoaGVpZ2h0TWFwOiBJbWFnZURhdGEpOiBIZWlnaHRSZWN0W10ge1xuXHRjb25zdCB3aWR0aCA9IGhlaWdodE1hcC53aWR0aDtcblx0Y29uc3QgaGVpZ2h0ID0gaGVpZ2h0TWFwLmhlaWdodDtcblxuXHRjb25zdCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkod2lkdGggKiBoZWlnaHQpO1xuXG5cdC8vIENyZWF0ZSBhIHNpbXBsZXIgZGF0YSBidWZmZXIgb2YganVzdCB0aGUgaGVpZ2h0IHZhbHVlcywgbm8gbmVlZCBmb3IgZnVsbCBSR0JBXG5cblx0Zm9yIChsZXQgeSA9IDA7IHkgPCBoZWlnaHQ7IHkrKykge1xuXHRcdGZvciAobGV0IHggPSAwOyB4IDwgd2lkdGg7IHgrKykge1xuXHRcdFx0Y29uc3QgaSA9IHkgKiB3aWR0aCArIHg7XG5cdFx0XHRjb25zdCB2YWx1ZSA9IGhlaWdodE1hcC5kYXRhW2kgKiA0XTtcblx0XHRcdGRhdGFbeSAqIHdpZHRoICsgeF0gPSB2YWx1ZTtcblx0XHR9XG5cdH1cblxuXHQvLyBDb25zdHJ1Y3QgdGhlIGhlaWdodCByZWN0c1xuXG5cdGNvbnN0IHJlY3RzOiBIZWlnaHRSZWN0W10gPSBbXTtcblxuXHRmb3IgKGxldCB5ID0gMDsgeSA8IGhlaWdodDsgeSsrKSB7XG5cdFx0Zm9yIChsZXQgeCA9IDA7IHggPCB3aWR0aDsgeCsrKSB7XG5cdFx0XHRjb25zdCBpID0geSAqIHdpZHRoICsgeDtcblx0XHRcdGNvbnN0IHZhbHVlID0gZGF0YVtpXTtcblx0XHRcdGlmICh2YWx1ZSA+IDApIHtcblx0XHRcdFx0Y29uc3QgcmVjdFdpZHRoID0gZ2V0UmVjdFdpZHRoU3RhcnRpbmdBdCh3aWR0aCwgZGF0YSwgeCwgeSwgdmFsdWUpO1xuXHRcdFx0XHRjb25zdCByZWN0SGVpZ2h0ID0gZ2V0UmVjdEhlaWdodFN0YXJ0aW5nQXQod2lkdGgsIGhlaWdodCwgZGF0YSwgeCwgeSwgdmFsdWUsIHJlY3RXaWR0aCk7XG5cdFx0XHRcdGNsZWFySGVpZ2h0cyh3aWR0aCwgZGF0YSwgeCwgeSwgcmVjdFdpZHRoLCByZWN0SGVpZ2h0KTtcblx0XHRcdFx0cmVjdHMucHVzaCh7XG5cdFx0XHRcdFx0eCxcblx0XHRcdFx0XHR5LFxuXHRcdFx0XHRcdHdpZHRoOiByZWN0V2lkdGgsXG5cdFx0XHRcdFx0aGVpZ2h0OiByZWN0SGVpZ2h0LFxuXHRcdFx0XHRcdHo6IHZhbHVlXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiByZWN0cztcbn1cblxuZnVuY3Rpb24gZ2V0UmVjdFdpZHRoU3RhcnRpbmdBdChpbWFnZVdpZHRoOiBpbnQsIGRhdGE6IFVpbnQ4QXJyYXksIHJlY3RYOiBpbnQsIHJlY3RZOiBpbnQsIGhlaWdodFZhbHVlOiBpbnQpOiBpbnQge1xuXHRsZXQgcmVjdFdpZHRoID0gMTtcblx0d2hpbGUgKHJlY3RYICsgcmVjdFdpZHRoIDwgaW1hZ2VXaWR0aCkge1xuXHRcdGNvbnN0IGkgPSByZWN0WSAqIGltYWdlV2lkdGggKyByZWN0WCArIHJlY3RXaWR0aDtcblx0XHRjb25zdCB2YWx1ZSA9IGRhdGFbaV07XG5cdFx0aWYgKHZhbHVlICE9PSBoZWlnaHRWYWx1ZSkge1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHRcdHJlY3RXaWR0aCsrO1xuXHR9XG5cdHJldHVybiByZWN0V2lkdGg7XG59XG5cbmZ1bmN0aW9uIGdldFJlY3RIZWlnaHRTdGFydGluZ0F0KGltYWdlV2lkdGg6IGludCwgaW1hZ2VIZWlnaHQ6IGludCwgZGF0YTogVWludDhBcnJheSwgcmVjdFg6IGludCwgcmVjdFk6IGludCwgaGVpZ2h0VmFsdWU6IGludCwgcmVjdFdpZHRoOiBpbnQpOiBpbnQge1xuXHRsZXQgcmVjdEhlaWdodCA9IDE7IC8vIFdlIGNhbiBzYWZlbHkgc3RhcnQgYXQgMSwgd2Uga25vdyB0aGUgZmlyc3Qgcm93IG9mIHBpeGVscyBhbGwgbWF0Y2hlc1xuXHR3aGlsZSAocmVjdFkgKyByZWN0SGVpZ2h0IDwgaW1hZ2VIZWlnaHQpIHtcblx0XHRmb3IgKGxldCB4ID0gMDsgeCA8IHJlY3RXaWR0aDsgeCsrKSB7XG5cdFx0XHRjb25zdCBpID0gKHJlY3RZICsgcmVjdEhlaWdodCkgKiBpbWFnZVdpZHRoICsgcmVjdFggKyB4O1xuXHRcdFx0Y29uc3QgdmFsdWUgPSBkYXRhW2ldO1xuXHRcdFx0aWYgKHZhbHVlICE9PSBoZWlnaHRWYWx1ZSkge1xuXHRcdFx0XHRyZXR1cm4gcmVjdEhlaWdodDtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmVjdEhlaWdodCsrO1xuXHR9XG5cdHJldHVybiByZWN0SGVpZ2h0O1xufVxuXG5mdW5jdGlvbiBjbGVhckhlaWdodHMoaW1hZ2VXaWR0aDogaW50LCBkYXRhOiBVaW50OEFycmF5LCByZWN0WDogaW50LCByZWN0WTogaW50LCB3aWR0aDogaW50LCBoZWlnaHQ6IGludCk6IHZvaWQge1xuXHRmb3IgKGxldCB5ID0gMDsgeSA8IGhlaWdodDsgeSsrKSB7XG5cdFx0Zm9yIChsZXQgeCA9IDA7IHggPCB3aWR0aDsgeCsrKSB7XG5cdFx0XHRjb25zdCBpID0gKHJlY3RZICsgeSkgKiBpbWFnZVdpZHRoICsgcmVjdFggKyB4O1xuXHRcdFx0ZGF0YVtpXSA9IDA7XG5cdFx0fVxuXHR9XG59XG5cbi8vIEdlbmVyYXRlIGEgc2hhZG93IG1hcCBnaXZlbiBhIGhlaWdodCBtYXAgYW5kIGEgZHluYW1pYyBsaWdodFxuLy8gVE9ETzogTXVsdGlwbGUgbGlnaHRzLCBhcHBseSB0byBleGlzdGluZyBzaGFkb3cgbWFwXG4vLyBUT0RPOiBPcHRpbWl6ZSwgc3RvcmUgaGVpZ2h0IGRhdGEgYXMgYSBzaW5nbGUgYXJyYXkgYnVmZmVyIHJhdGhlciB0aGFuIGEgY2FudmFzP1xuZnVuY3Rpb24gZ2VuZXJhdGVTaGFkb3dNYXBCeUNhc3RpbmdSZWN0cyh3aWR0aDogaW50LCBoZWlnaHQ6IGludCwgaGVpZ2h0UmVjdHM6IEhlaWdodFJlY3RbXSwgbGlnaHRYOiBmbG9hdCwgbGlnaHRZOiBmbG9hdCwgbGlnaHRaOiBmbG9hdCwgd2lsbFJlYWRGcmVxdWVudGx5OiBib29sZWFuKTogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIHtcblxuXHRjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcblx0Y2FudmFzLndpZHRoID0gd2lkdGg7XG5cdGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG5cdGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcsIHsgd2lsbFJlYWRGcmVxdWVudGx5OiB3aWxsUmVhZEZyZXF1ZW50bHkgfSkhO1xuXG5cdGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnbGlnaHRlbic7IC8vIFdlIHVzZSAnbGlnaHRlbicgdG8gZW5zdXJlIHRoYXQgbXVsdGlwbGUgc2hhZG93cyB3aWxsIG92ZXJ3cml0ZSBjb3JyZWN0bHksIHRoZSBoaWdoZXIgc2hhZG93IFwid2luc1wiXG5cblx0Zm9yIChjb25zdCByZWN0IG9mIGhlaWdodFJlY3RzKSB7XG5cdFx0Y29uc3QgaGVpZ2h0VmFsdWUgPSByZWN0Lno7XG5cdFx0aWYgKGhlaWdodFZhbHVlID4gMCkge1xuXHRcdFx0Y29uc3QgeCA9IHJlY3QueDtcblx0XHRcdGNvbnN0IHkgPSByZWN0Lnk7XG5cdFx0XHRjb25zdCB3aWR0aCA9IHJlY3Qud2lkdGg7XG5cdFx0XHRjb25zdCBoZWlnaHQgPSByZWN0LmhlaWdodDtcblxuXHRcdFx0Y29uc3QgdG9wTGVmdFggPSB4O1xuXHRcdFx0Y29uc3QgdG9wTGVmdFkgPSB5O1xuXHRcdFx0Y29uc3QgdG9wUmlnaHRYID0geCArIHdpZHRoO1xuXHRcdFx0Y29uc3QgdG9wUmlnaHRZID0geTtcblx0XHRcdGNvbnN0IGJvdHRvbUxlZnRYID0geDtcblx0XHRcdGNvbnN0IGJvdHRvbUxlZnRZID0geSArIGhlaWdodDtcblx0XHRcdGNvbnN0IGJvdHRvbVJpZ2h0WCA9IHggKyB3aWR0aDtcblx0XHRcdGNvbnN0IGJvdHRvbVJpZ2h0WSA9IHkgKyBoZWlnaHQ7XG5cblx0XHRcdGNvbnN0IGFuZ2xlRnJvbUxpZ2h0VG9QaXhlbFRvcExlZnQgPSBNYXRoLmF0YW4yKHkgLSBsaWdodFksIHggLSBsaWdodFgpO1xuXHRcdFx0Y29uc3QgYW5nbGVGcm9tTGlnaHRUb1BpeGVsVG9wUmlnaHQgPSBNYXRoLmF0YW4yKHkgLSBsaWdodFksIHggKyB3aWR0aCAtIGxpZ2h0WCk7XG5cdFx0XHRjb25zdCBhbmdsZUZyb21MaWdodFRvUGl4ZWxCb3R0b21MZWZ0ID0gTWF0aC5hdGFuMih5ICsgaGVpZ2h0IC0gbGlnaHRZLCB4IC0gbGlnaHRYKTtcblx0XHRcdGNvbnN0IGFuZ2xlRnJvbUxpZ2h0VG9QaXhlbEJvdHRvbVJpZ2h0ID0gTWF0aC5hdGFuMih5ICsgaGVpZ2h0IC0gbGlnaHRZLCB4ICsgd2lkdGggLSBsaWdodFgpO1xuXG5cdFx0XHRjb25zdCBoZWlnaHRSZWR1Y3Rpb25GYWN0b3JUb1JlZHVjZVNlbGZTaGFkb3dOb2lzZSA9IDA7XG5cdFx0XHRjb25zdCBncmV5VmFsdWUgPSBoZWlnaHRWYWx1ZSAtIGhlaWdodFJlZHVjdGlvbkZhY3RvclRvUmVkdWNlU2VsZlNoYWRvd05vaXNlO1xuXG5cdFx0XHRjb25zdCB0b3BMZWZ0RGVsdGFYID0gTWF0aC5jb3MoYW5nbGVGcm9tTGlnaHRUb1BpeGVsVG9wTGVmdCk7XG5cdFx0XHRjb25zdCB0b3BMZWZ0RGVsdGFZID0gTWF0aC5zaW4oYW5nbGVGcm9tTGlnaHRUb1BpeGVsVG9wTGVmdCk7XG5cblx0XHRcdGNvbnN0IHRvcFJpZ2h0RGVsdGFYID0gTWF0aC5jb3MoYW5nbGVGcm9tTGlnaHRUb1BpeGVsVG9wUmlnaHQpO1xuXHRcdFx0Y29uc3QgdG9wUmlnaHREZWx0YVkgPSBNYXRoLnNpbihhbmdsZUZyb21MaWdodFRvUGl4ZWxUb3BSaWdodCk7XG5cblx0XHRcdGNvbnN0IGJvdHRvbUxlZnREZWx0YVggPSBNYXRoLmNvcyhhbmdsZUZyb21MaWdodFRvUGl4ZWxCb3R0b21MZWZ0KTtcblx0XHRcdGNvbnN0IGJvdHRvbUxlZnREZWx0YVkgPSBNYXRoLnNpbihhbmdsZUZyb21MaWdodFRvUGl4ZWxCb3R0b21MZWZ0KTtcblxuXHRcdFx0Y29uc3QgYm90dG9tUmlnaHREZWx0YVggPSBNYXRoLmNvcyhhbmdsZUZyb21MaWdodFRvUGl4ZWxCb3R0b21SaWdodCk7XG5cdFx0XHRjb25zdCBib3R0b21SaWdodERlbHRhWSA9IE1hdGguc2luKGFuZ2xlRnJvbUxpZ2h0VG9QaXhlbEJvdHRvbVJpZ2h0KTtcblxuXHRcdFx0bGV0IHNoYWRvd0Rpc3RhbmNlOiBpbnQ7XG5cdFx0XHRjb25zdCBwaXhlbEhlaWdodEluUGl4ZWxzID0gaGVpZ2h0VmFsdWUgLyBIRUlHSFRfTUFQX1ZBTFVFX0RJVklERVI7XG5cdFx0XHRpZiAobGlnaHRaIDw9IHBpeGVsSGVpZ2h0SW5QaXhlbHMpIHtcblx0XHRcdFx0Ly8gTGlnaHQgaXMgbG93ZXIgdGhhbiB0aGUgcGl4ZWwsIHNoYWRvdyBleHRlbmRzIHRvIGluZm5pdHlcblx0XHRcdFx0c2hhZG93RGlzdGFuY2UgPSAxMDA7IC8vIFRPRE86IENhbGN1bGF0ZSBtaW5pbXVtIG5lZWRlZCBoZXJlIGJhc2VkIG9uIHRoZSB2aWV3cG9ydFxuXG5cdFx0XHRcdGN0eC5maWxsU3R5bGUgPSAncmVkJztcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRjb25zdCBhbmdsZU9mTGlnaHRTb3VyY2VSZWxhdGl2ZVRvUGl4ZWwgPSBNYXRoLmF0YW4ocGl4ZWxIZWlnaHRJblBpeGVscyAvIGxpZ2h0Wik7XG5cdFx0XHRcdHNoYWRvd0Rpc3RhbmNlID0gcGl4ZWxIZWlnaHRJblBpeGVscyAqIE1hdGgudGFuKGFuZ2xlT2ZMaWdodFNvdXJjZVJlbGF0aXZlVG9QaXhlbCk7XG5cblx0XHRcdFx0Y29uc3QgZ3JhZGllbnQgPSBjdHguY3JlYXRlUmFkaWFsR3JhZGllbnQobGlnaHRYLCBsaWdodFksIDEsIGxpZ2h0WCwgbGlnaHRZLCBzaGFkb3dEaXN0YW5jZSk7XG5cdFx0XHRcdGdyYWRpZW50LmFkZENvbG9yU3RvcCgwLCAncmdiKCcgKyBncmV5VmFsdWUgKyAnLCcgKyAwICsgJywnICsgMCArICcpJyk7XG5cdFx0XHRcdGdyYWRpZW50LmFkZENvbG9yU3RvcCgxLCAncmdiKCcgKyAwICsgJywnICsgMCArICcsJyArIDAgKyAnLCcgKyAwICsgJyknKTtcblx0XHRcdFx0Y3R4LmZpbGxTdHlsZSA9IGdyYWRpZW50O1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBQcm9qZWN0IHRoZSB0b3AtbGVmdCBjb3JuZXJcblx0XHRcdGNvbnN0IHByb2plY3RlZFRvcExlZnRYID0gdG9wTGVmdFggKyB0b3BMZWZ0RGVsdGFYICogc2hhZG93RGlzdGFuY2U7XG5cdFx0XHRjb25zdCBwcm9qZWN0ZWRUb3BMZWZ0WSA9IHRvcExlZnRZICsgdG9wTGVmdERlbHRhWSAqIHNoYWRvd0Rpc3RhbmNlO1xuXG5cdFx0XHQvLyBQcm9qZWN0IHRoZSB0b3AtcmlnaHQgY29ybmVyXG5cdFx0XHRjb25zdCBwcm9qZWN0ZWRUb3BSaWdodFggPSB0b3BSaWdodFggKyB0b3BSaWdodERlbHRhWCAqIHNoYWRvd0Rpc3RhbmNlO1xuXHRcdFx0Y29uc3QgcHJvamVjdGVkVG9wUmlnaHRZID0gdG9wUmlnaHRZICsgdG9wUmlnaHREZWx0YVkgKiBzaGFkb3dEaXN0YW5jZTtcblxuXHRcdFx0Ly8gUHJvamVjdCB0aGUgYm90dG9tLWxlZnQgY29ybmVyXG5cdFx0XHRjb25zdCBwcm9qZWN0ZWRCb3R0b21MZWZ0WCA9IGJvdHRvbUxlZnRYICsgYm90dG9tTGVmdERlbHRhWCAqIHNoYWRvd0Rpc3RhbmNlO1xuXHRcdFx0Y29uc3QgcHJvamVjdGVkQm90dG9tTGVmdFkgPSBib3R0b21MZWZ0WSArIGJvdHRvbUxlZnREZWx0YVkgKiBzaGFkb3dEaXN0YW5jZTtcblxuXHRcdFx0Ly8gUHJvamVjdCB0aGUgYm90dG9tLXJpZ2h0IGNvcm5lclxuXHRcdFx0Y29uc3QgcHJvamVjdGVkQm90dG9tUmlnaHRYID0gYm90dG9tUmlnaHRYICsgYm90dG9tUmlnaHREZWx0YVggKiBzaGFkb3dEaXN0YW5jZTtcblx0XHRcdGNvbnN0IHByb2plY3RlZEJvdHRvbVJpZ2h0WSA9IGJvdHRvbVJpZ2h0WSArIGJvdHRvbVJpZ2h0RGVsdGFZICogc2hhZG93RGlzdGFuY2U7XG5cblx0XHRcdC8vIERldGVybWluZSB0b3AtbW9zdCBlZGdlXG5cdFx0XHRsZXQgdG9wTW9zdEVkZ2VYMTogbnVtYmVyO1xuXHRcdFx0bGV0IHRvcE1vc3RFZGdlWTE6IG51bWJlcjtcblx0XHRcdGxldCB0b3BNb3N0RWRnZVgyOiBudW1iZXI7XG5cdFx0XHRsZXQgdG9wTW9zdEVkZ2VZMjogbnVtYmVyO1xuXHRcdFx0aWYgKHByb2plY3RlZFRvcExlZnRZIDwgdG9wTGVmdFkpIHtcblx0XHRcdFx0dG9wTW9zdEVkZ2VYMSA9IHByb2plY3RlZFRvcExlZnRYO1xuXHRcdFx0XHR0b3BNb3N0RWRnZVkxID0gcHJvamVjdGVkVG9wTGVmdFk7XG5cdFx0XHRcdHRvcE1vc3RFZGdlWDIgPSBwcm9qZWN0ZWRUb3BSaWdodFg7XG5cdFx0XHRcdHRvcE1vc3RFZGdlWTIgPSBwcm9qZWN0ZWRUb3BSaWdodFk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0b3BNb3N0RWRnZVgxID0gdG9wTGVmdFg7XG5cdFx0XHRcdHRvcE1vc3RFZGdlWTEgPSB0b3BMZWZ0WTtcblx0XHRcdFx0dG9wTW9zdEVkZ2VYMiA9IHRvcFJpZ2h0WDtcblx0XHRcdFx0dG9wTW9zdEVkZ2VZMiA9IHRvcFJpZ2h0WTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gRGV0ZXJtaW5lIHJpZ2h0LW1vc3QgZWRnZVxuXHRcdFx0bGV0IHJpZ2h0TW9zdEVkZ2VYMTogbnVtYmVyO1xuXHRcdFx0bGV0IHJpZ2h0TW9zdEVkZ2VZMTogbnVtYmVyO1xuXHRcdFx0bGV0IHJpZ2h0TW9zdEVkZ2VYMjogbnVtYmVyO1xuXHRcdFx0bGV0IHJpZ2h0TW9zdEVkZ2VZMjogbnVtYmVyO1xuXHRcdFx0aWYgKHByb2plY3RlZFRvcFJpZ2h0WCA+IHRvcFJpZ2h0WCkge1xuXHRcdFx0XHRyaWdodE1vc3RFZGdlWDEgPSBwcm9qZWN0ZWRUb3BSaWdodFg7XG5cdFx0XHRcdHJpZ2h0TW9zdEVkZ2VZMSA9IHByb2plY3RlZFRvcFJpZ2h0WTtcblx0XHRcdFx0cmlnaHRNb3N0RWRnZVgyID0gcHJvamVjdGVkQm90dG9tUmlnaHRYO1xuXHRcdFx0XHRyaWdodE1vc3RFZGdlWTIgPSBwcm9qZWN0ZWRCb3R0b21SaWdodFk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyaWdodE1vc3RFZGdlWDEgPSB0b3BSaWdodFg7XG5cdFx0XHRcdHJpZ2h0TW9zdEVkZ2VZMSA9IHRvcFJpZ2h0WTtcblx0XHRcdFx0cmlnaHRNb3N0RWRnZVgyID0gYm90dG9tUmlnaHRYO1xuXHRcdFx0XHRyaWdodE1vc3RFZGdlWTIgPSBib3R0b21SaWdodFk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8vIERldGVybWluZSBib3R0b20tbW9zdCBlZGdlXG5cdFx0XHRsZXQgYm90dG9tTW9zdEVkZ2VYMTogbnVtYmVyO1xuXHRcdFx0bGV0IGJvdHRvbU1vc3RFZGdlWTE6IG51bWJlcjtcblx0XHRcdGxldCBib3R0b21Nb3N0RWRnZVgyOiBudW1iZXI7XG5cdFx0XHRsZXQgYm90dG9tTW9zdEVkZ2VZMjogbnVtYmVyO1xuXHRcdFx0aWYgKHByb2plY3RlZEJvdHRvbUxlZnRZID4gYm90dG9tTGVmdFkpIHtcblx0XHRcdFx0Ym90dG9tTW9zdEVkZ2VYMSA9IHByb2plY3RlZEJvdHRvbUxlZnRYO1xuXHRcdFx0XHRib3R0b21Nb3N0RWRnZVkxID0gcHJvamVjdGVkQm90dG9tTGVmdFk7XG5cdFx0XHRcdGJvdHRvbU1vc3RFZGdlWDIgPSBwcm9qZWN0ZWRCb3R0b21SaWdodFg7XG5cdFx0XHRcdGJvdHRvbU1vc3RFZGdlWTIgPSBwcm9qZWN0ZWRCb3R0b21SaWdodFk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRib3R0b21Nb3N0RWRnZVgxID0gYm90dG9tTGVmdFg7XG5cdFx0XHRcdGJvdHRvbU1vc3RFZGdlWTEgPSBib3R0b21MZWZ0WTtcblx0XHRcdFx0Ym90dG9tTW9zdEVkZ2VYMiA9IGJvdHRvbVJpZ2h0WDtcblx0XHRcdFx0Ym90dG9tTW9zdEVkZ2VZMiA9IGJvdHRvbVJpZ2h0WTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0Ly8gRGV0ZXJtaW5lIGxlZnQtbW9zdCBlZGdlXG5cdFx0XHRsZXQgbGVmdE1vc3RFZGdlWDE6IG51bWJlcjtcblx0XHRcdGxldCBsZWZ0TW9zdEVkZ2VZMTogbnVtYmVyO1xuXHRcdFx0bGV0IGxlZnRNb3N0RWRnZVgyOiBudW1iZXI7XG5cdFx0XHRsZXQgbGVmdE1vc3RFZGdlWTI6IG51bWJlcjtcblx0XHRcdGlmIChwcm9qZWN0ZWRUb3BMZWZ0WCA8IHRvcExlZnRYKSB7XG5cdFx0XHRcdGxlZnRNb3N0RWRnZVgxID0gcHJvamVjdGVkVG9wTGVmdFg7XG5cdFx0XHRcdGxlZnRNb3N0RWRnZVkxID0gcHJvamVjdGVkVG9wTGVmdFk7XG5cdFx0XHRcdGxlZnRNb3N0RWRnZVgyID0gcHJvamVjdGVkQm90dG9tTGVmdFg7XG5cdFx0XHRcdGxlZnRNb3N0RWRnZVkyID0gcHJvamVjdGVkQm90dG9tTGVmdFk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRsZWZ0TW9zdEVkZ2VYMSA9IHRvcExlZnRYO1xuXHRcdFx0XHRsZWZ0TW9zdEVkZ2VZMSA9IHRvcExlZnRZO1xuXHRcdFx0XHRsZWZ0TW9zdEVkZ2VYMiA9IGJvdHRvbUxlZnRYO1xuXHRcdFx0XHRsZWZ0TW9zdEVkZ2VZMiA9IGJvdHRvbUxlZnRZO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBEcmF3IHRoZSBmdWxsIHByb2plY3RlZCBzaGFwZVxuXHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0Y3R4Lm1vdmVUbyh0b3BNb3N0RWRnZVgxLCB0b3BNb3N0RWRnZVkxKTtcblx0XHRcdGN0eC5saW5lVG8odG9wTW9zdEVkZ2VYMiwgdG9wTW9zdEVkZ2VZMik7XG5cdFx0XHRjdHgubGluZVRvKHJpZ2h0TW9zdEVkZ2VYMSwgcmlnaHRNb3N0RWRnZVkxKTtcblx0XHRcdGN0eC5saW5lVG8ocmlnaHRNb3N0RWRnZVgyLCByaWdodE1vc3RFZGdlWTIpO1xuXHRcdFx0Y3R4LmxpbmVUbyhib3R0b21Nb3N0RWRnZVgyLCBib3R0b21Nb3N0RWRnZVkyKTtcblx0XHRcdGN0eC5saW5lVG8oYm90dG9tTW9zdEVkZ2VYMSwgYm90dG9tTW9zdEVkZ2VZMSk7XG5cdFx0XHRjdHgubGluZVRvKGxlZnRNb3N0RWRnZVgyLCBsZWZ0TW9zdEVkZ2VZMik7XG5cdFx0XHRjdHgubGluZVRvKGxlZnRNb3N0RWRnZVgxLCBsZWZ0TW9zdEVkZ2VZMSk7XG5cdFx0XHRjdHgubGluZVRvKHRvcE1vc3RFZGdlWDEsIHRvcE1vc3RFZGdlWTEpO1xuXHRcdFx0Y3R4LmNsb3NlUGF0aCgpO1xuXHRcdFx0Y3R4LmZpbGwoKTtcblxuXHRcdH1cblx0fVxuXG5cblx0Y3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2Utb3Zlcic7XG5cblx0cmV0dXJuIGN0eDtcblxufSJdfQ==