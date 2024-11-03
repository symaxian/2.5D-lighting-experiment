const width = 160;
const height = 160;

const MAX_DYNAMIC_LIGHT_Z: int_BigPixels = 64; // 4 tiles high

const VIEW_COUNT = 5;

let view = 0;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const viewParam = urlParams.get('view');
if (typeof viewParam === 'string') {
	const parsedViewParam = parseInt(viewParam);
	if (typeof parsedViewParam === 'number' && !isNaN(parsedViewParam) && parsedViewParam >= 0 && parsedViewParam <= VIEW_COUNT) {
		view = parsedViewParam;
	}
}


class ShapeCastingDemo extends Nitro.Component {

	private scale = 3;

	private lightX = 80 * this.scale;
	private lightY = 80 * this.scale;
	private lightZ = 8;

	private lightMoved = (x: int, y: int, z: int) => {
		this.lightX = Math.max(0, Math.min(this.lightX + x, width * this.scale));
		this.lightY = Math.max(0, Math.min(this.lightY + y, width * this.scale));
		this.lightZ = Math.max(0, Math.min(this.lightZ + z, MAX_DYNAMIC_LIGHT_Z));
		this.setDirty();
	}

	private onResize = (e: Event) => {
		const maxSize = width * 3;
		const newScale = Math.floor(window.innerWidth / maxSize);
		if (newScale !== this.scale) {
			this.lightX *= newScale / this.scale;
			this.lightY *= newScale / this.scale;
			this.scale = newScale;
			this.setDirty();
		}
	}

	wasMounted(): void {
		window.addEventListener('resize', this.onResize);
		
	}

	wasUnmounted(): void {
		window.removeEventListener('resize', this.onResize);
	}

	private previousView = () => {
		view--;
		urlParams.set('view', view + '');
		history.replaceState(null, '', "?"+urlParams.toString());
		this.setDirty();
	}

	private nextView = () => {
		view++;
		urlParams.set('view', view + '');
		history.replaceState(null, '', "?"+urlParams.toString());
		this.setDirty();
	}

	render(_?: Nitro.Renderer): void | HTMLElement {

		const scale = this.scale;

		const ambientLight = 'rgb(64, 64, 64)';

		const dynamicLightX = this.lightX;
		const dynamicLightY = this.lightY;
		const dynamicLightZ = this.lightZ;

		return <div key="root" style="width: 60%">
			<div style="text-align: center;">
				<h1>Shape casting</h1>
				<h3>Simulating 3d lighting in 2d</h3>
				<button style="font-size: 24px" onClick={this.previousView} disabled={view == 0}>Previous</button>
				<span style="display: inline-block; width: 20px"></span>
				<button style="font-size: 24px" onClick={this.nextView} disabled={view == VIEW_COUNT}>Next</button>
			</div>

			<div style="width: 100%; display: flex; flex-direction: column; align-items: center;">
				
				{ view === 0 &&
					<p>
						Let's start with a 2d image of the game world.
					</p>
				}
				{ view === 0 &&
					<GameView width={width} height={height} scale={scale} mode={ImageMode.PLAIN_IMAGE}/>
				}

				{ view === 1 &&
					<p>
						We'll add some ambient light to darken the area as if it were night.
						<br/>
						<br/>
						<p>The following image represents the "light map", showing the light affecting each pixel.</p>
					</p>
				}
				{ view === 1 &&
					<GameView width={width} height={height} scale={scale} mode={ImageMode.LIGHT_MAP} ambientLight={ambientLight}/>
				}
				{ view === 1 &&
					<p>The pixel colors in the "light map" are multiplied against the actual image to produce a lit scene. The scene is very dark until we add lights.</p>
				}
				{ view === 1 &&
					<GameView width={width} height={height} scale={scale} mode={ImageMode.PLAIN_IMAGE} ambientLight={ambientLight}/>
				}
				{ view === 1 &&
					<p>We can add a simple point light that can be moved around.</p>
				}
				{ view === 1 &&
					<div style="display: flex">
						<GameView width={width} height={height} scale={scale} mode={ImageMode.LIGHT_MAP} ambientLight={ambientLight} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ} lightMoved={this.lightMoved} renderDynamicLight/>
						<div style='padding-left: 10px'>
							<GameView width={width} height={height} scale={scale} mode={ImageMode.PLAIN_IMAGE} ambientLight={ambientLight} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ} lightMoved={this.lightMoved} renderDynamicLight/>
						</div>
					</div>
				}
				{ view === 1 &&
					<p>It's not very accurate however, next we'll take into account normal values for each pixel to make the lighting a bit more realistic.</p>
				}

				{ view === 2 &&
					<p>
						We can add normals(surface vectors) to the gravestone to apply the lighting in a more realistic manner.
						<br/>
						<br/>
						The following image is the normal map for the scene. It follows the OpenGL coloring format.
					</p>
				}
				{ view === 2 &&
					<GameView width={width} height={height} scale={scale} mode={ImageMode.NORMAL_MAP}/>
				}
				{ view === 2 &&
					<p>
						Now when light is moved we can see that the lighting applied to each pixel depends on the surface angle or "normal vector" for that pixel.
						<br/>
						<br/>
						Try moving the light around the gravestone to how the front and edges of the gravestone are lit depending on the position of the light.
					</p>
				}
				{ view === 2 &&
					<div style="display: flex">
						<GameView width={width} height={height} scale={scale} mode={ImageMode.LIGHT_MAP} ambientLight={ambientLight} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ} lightMoved={this.lightMoved} renderDynamicLight applyNormalMap/>
						<div style='padding-left: 10px'>
							<GameView width={width} height={height} scale={scale} mode={ImageMode.PLAIN_IMAGE} ambientLight={ambientLight} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ} lightMoved={this.lightMoved} renderDynamicLight applyNormalMap/>
						</div>
					</div>
				}
				{ view === 2 &&
					<p>
						There is an issue with this naive approach however, it breaks down if you move the light into the center of the gravestone, as we're trying to simulate 3D lighting on a 2D image(where the camera angle has been "baked in" to the image).
						<br/>
						<br/>
						On the next page we'll fix this by taking into account each pixel's location in the "original" 3D space.
					</p>
				}

				{ view === 3 &&
					<p>
						Image assets of this style are often referred to as "top-down", as the image represents a three dimensional object as if the camera was above(and in front of the object) and looking down on it.
						Since this camera angle is essentially "baked into" the image, we can take that into account when calculating how light would hit the object(as if it was still three dimensional).
						Rather than apply the lighting to each pixel based on its location in the image, we'll apply it based on the "original location", the location the image data in the pixel would be located if the camera were actually directly over the object.
						<br/>
						<br/>
						The following image is the "pixel offset map", it maps each pixel to the location it would be if the 2D assets were drawn with the camera directly overhead. A lighter color indicates that the pixel should be treated as residing farther down in the image.
					</p>
				}
				{ view === 3 &&
					<GameView width={width} height={height} scale={scale} mode={ImageMode.PIXEL_OFFSET_MAP}/>
				}
				{ view === 3 &&
					<p>
						The lighting is a bit more accurate now, particularly when the light is very close to the gravestone, in front of it or behind it.
					</p>
				}
				{ view === 3 &&
					<div style="display: flex">
						<GameView width={width} height={height} scale={scale} mode={ImageMode.LIGHT_MAP} ambientLight={ambientLight} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ} lightMoved={this.lightMoved} renderDynamicLight applyNormalMap applyPixelLocationOffsetMap/>
						<div style='padding-left: 10px'>
							<GameView width={width} height={height} scale={scale} mode={ImageMode.PLAIN_IMAGE} ambientLight={ambientLight} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ} lightMoved={this.lightMoved} renderDynamicLight applyNormalMap applyPixelLocationOffsetMap/>
						</div>
					</div>
				}
				{ view === 3 &&
					<p>
						Some visual artifacts can still result if the light is placed essentially "within" the gravestone, however this may not be an issue in practice as long as light sources are not allowed to pass "through" objects such as these.
					</p>
				}

				{ view === 4 &&
					<p>
						Let's get more complex now, we'll use a "height map" image to produce a "shadow map".
						The height map is similar to the "pixel offset map" but indicates the height of the pixel from the ground rather than location in X/Y space.
						Using the height map we will cast shadows from the light source to create the shadow map, the shadow map indicates what areas are "in shadow" and should not be lit by the dynamic light source.
						<br/>
						<br/>
						The following image is the height map.
					</p>
				}
				{ view === 4 &&
					<GameView width={width} height={height} scale={scale} mode={ImageMode.HEIGHT_MAP}/>
				}
				{ view === 4 &&
					<p>The following image is the shadow map, with the dynamic light applied to it as well.</p>
				}
				{ view === 4 &&
					<GameView width={width} height={height} scale={scale} mode={ImageMode.SHADOW_MAP} ambientLight={ambientLight} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ} renderDynamicLight/>
				}
				{ view === 4 &&
					<p>Now when we move the light around the gravestone casts a distinct shadow on the ground.</p>
				}
				{ view === 4 &&
					<div style="display: flex">
						<GameView width={width} height={height} scale={scale} mode={ImageMode.LIGHT_MAP} ambientLight={ambientLight} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ} lightMoved={this.lightMoved} renderDynamicLight applyNormalMap applyPixelLocationOffsetMap applyShadowMap/>
						<div style='padding-left: 10px'>
							<GameView width={width} height={height} scale={scale} mode={ImageMode.PLAIN_IMAGE} ambientLight={ambientLight} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ} lightMoved={this.lightMoved} renderDynamicLight applyNormalMap applyPixelLocationOffsetMap applyShadowMap/>
						</div>
					</div>
				}
				{ view === 4 &&
					<p>
						The shadow does not look correct when the light is in front of the gravestone however, this is due to the shadow map being calculated assuming the camera is directly above the object.
						On the next page we will fix this by using the "pixel offset map" again.
					</p>
				}

				{ view === 5 &&
					<p>
						Just as we used a "pixel offset map" to correct for the camera angle when calculating the lighting the is applied to the gravestone, we can use the same pixel offsets to more accurately calculate whether a pixel is "in shadow".
						<br/>
						<br/>
						Here is the pixel offset map again:
					</p>
				}
				{ view === 5 &&
					<GameView width={width} height={height} scale={scale} mode={ImageMode.PIXEL_OFFSET_MAP}/>
				}
				{ view === 5 &&
					<p>And the shadow offset map again:</p>
				}
				{ view === 5 &&
					<GameView width={width} height={height} scale={scale} mode={ImageMode.SHADOW_MAP} ambientLight={ambientLight} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ} renderDynamicLight/>
				}
				{ view === 5 &&
					<p>The end result, using these tricks we can simulate dynamic 3D lighting within a 2D image.</p>
				}
				{ view === 5 &&
					<div style="display: flex">
						<GameView width={width} height={height} scale={scale} mode={ImageMode.LIGHT_MAP} ambientLight={ambientLight} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ} lightMoved={this.lightMoved} renderDynamicLight applyNormalMap applyPixelLocationOffsetMap applyShadowMap applyPixelOffsetToShadowCalculations/>
						<div style='padding-left: 10px'>
							<GameView width={width} height={height} scale={scale} mode={ImageMode.PLAIN_IMAGE} ambientLight={ambientLight} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ} lightMoved={this.lightMoved} renderDynamicLight applyNormalMap applyPixelLocationOffsetMap applyShadowMap applyPixelOffsetToShadowCalculations/>
						</div>
					</div>
				}
				
			</div>

			<p style="text-align: center;">
				<button style="font-size: 24px" onClick={this.previousView} disabled={view == 0}>Previous</button>
				<span style="display: inline-block; width: 20px"></span>
				<button style="font-size: 24px" onClick={this.nextView} disabled={view == VIEW_COUNT}>Next</button>
			</p>

		</div>;
	}

}