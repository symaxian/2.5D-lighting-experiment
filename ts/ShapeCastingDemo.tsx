const width = 160;
const height = 160;

const MAX_DYNAMIC_LIGHT_Z: int_BigPixels = 64; // 4 tiles high

class ShapeCastingDemo extends Nitro.Component {

	private scale = 3;

	private view = 0;

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
		const maxSize = width * 5;
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
		this.view--;
		this.setDirty();
	}

	private nextView = () => {
		this.view++;
		this.setDirty();
	}

	render(_?: Nitro.Renderer): void | HTMLElement {
		const view = this.view;

		const scale = this.scale;

		const ambientLight = 'rgb(64, 64, 64)';

		const dynamicLightX = this.lightX;
		const dynamicLightY = this.lightY;
		const dynamicLightZ = this.lightZ;

		return <div style="width: 60%">
			<div style="text-align: center;">
				<h1>Shape casting</h1>
				<h3>Simulating 3d lighting in 2d</h3>
				{ (this.view > 0) ? <button onClick={this.previousView}>Previous</button> : null }
				{ (this.view < 3) ? <button onClick={this.nextView}>Next</button> : null }
			</div>

			<table style="width: 100%">
				{/* { view === 0 ? */}
					<tr>
						<td>Let's start with a 2d image of the game world.</td>
						<td>
							<div>
								<GameView width={width} height={height} scale={scale} mode={ImageMode.PLAIN_IMAGE}/>
							</div>
						</td>
					</tr>
				 {/* : null } */}
				{/* { view === 1 ? */}
					<tr style="margin: 24px">
						<td>We'll add some ambient light to darken the area as if it were night.</td>
						<td>
							<div>
								<p>This image represents the "light map", showing the light affecting each pixel.</p>
								<GameView width={width} height={height} scale={scale} mode={ImageMode.LIGHT_MAP} ambientLight={ambientLight}/>
								<p>The pixel colors in the "light map" are multiplied against the actual image to produce a lit scene.</p>
								<GameView width={width} height={height} scale={scale} mode={ImageMode.PLAIN_IMAGE} ambientLight={ambientLight}/>
							</div>
						</td>
					</tr>
				 {/* : null } */}
				{/* { view === 1 ? */}
					<tr>
						<td>We can add a simple point light that can be moved around.</td>
						<td>
							<GameView width={width} height={height} scale={scale} mode={ImageMode.LIGHT_MAP} ambientLight={ambientLight} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ} renderDynamicLight/>
						</td>
						<td>
							<DraggableLight scale={scale} width={width} height={height} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ} lightMoved={this.lightMoved}/>
							<GameView width={width} height={height} scale={scale} mode={ImageMode.PLAIN_IMAGE} ambientLight={ambientLight} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ} renderDynamicLight/>
						</td>
					</tr>
				 {/* : null } */}
				{/* { view === 2 ? */}
					<tr>
						<td>We can add normals to the gravestone to apply the lighting in a more realistic manner.</td>
						<td>
							<p>Here is the normal map for the scene.</p>
							<GameView width={width} height={height} scale={scale} mode={ImageMode.NORMAL_MAP}/>
						</td>
						<td>
							<GameView width={width} height={height} scale={scale} mode={ImageMode.LIGHT_MAP} ambientLight={ambientLight} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ} renderDynamicLight applyNormalMap/>
						</td>
						<td>
							<DraggableLight scale={scale} width={width} height={height} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ} lightMoved={this.lightMoved}/>
							<GameView width={width} height={height} scale={scale} mode={ImageMode.PLAIN_IMAGE} ambientLight={ambientLight} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ} renderDynamicLight applyNormalMap/>
						</td>
					</tr>
				 {/* : null } */}
				<tr>
					<td>There is still a bit of an issue though, the lighting is being calculated relative to the pixels location in the image data, however the 2d assets have a camera angle of about 60 degrees baked in. To apply more accurate lighting we'll use a "pixel offset map" to calculate the lighting of each pixel as if the camera was directly overhead.</td>
					<td>
						<GameView width={width} height={height} scale={scale} mode={ImageMode.NORMAL_MAP}/>
					</td>
					<td>
						<GameView width={width} height={height} scale={scale} mode={ImageMode.LIGHT_MAP} ambientLight={ambientLight} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ} renderDynamicLight applyNormalMap applyPixelLocationOffsetMap/>
					</td>
					<td>
						<DraggableLight scale={scale} width={width} height={height} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ} lightMoved={this.lightMoved}/>
						<GameView width={width} height={height} scale={scale} mode={ImageMode.PLAIN_IMAGE} ambientLight={ambientLight} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ} renderDynamicLight applyNormalMap applyPixelLocationOffsetMap/>
					</td>
				</tr>
				<tr>
					<td>Here is the height map(darker colors are higher):
						<p>We use the height map(combined with the dynamic light) to produce a "shadow map", any pixels that have a height below the value in the shadow map are in shadow and should not be lit by that dynamic light.</p>
					</td>
					<td>
						<GameView width={width} height={height} scale={scale} mode={ImageMode.HEIGHT_MAP}/>
					</td>
					<td>
						<DraggableLight scale={scale} width={width} height={height} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ} lightMoved={this.lightMoved}/>
						<GameView width={width} height={height} scale={scale} mode={ImageMode.SHADOW_MAP} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ}/>
					</td>
					<td>
						<DraggableLight scale={scale} width={width} height={height} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ} lightMoved={this.lightMoved}/>
						<GameView width={width} height={height} scale={scale} mode={ImageMode.LIGHT_MAP} ambientLight={ambientLight} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ} renderDynamicLight applyNormalMap applyPixelLocationOffsetMap applyShadowMap/>
					</td>
					<td>
						<DraggableLight scale={scale} width={width} height={height} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ} lightMoved={this.lightMoved}/>
						<GameView width={width} height={height} scale={scale} mode={ImageMode.PLAIN_IMAGE} ambientLight={ambientLight} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ} renderDynamicLight applyNormalMap applyPixelLocationOffsetMap applyShadowMap/>
					</td>
				</tr>
				<tr>
					<td>
						<p>We can also apply the pixel-offset-map to the "within shadow" calculations.</p>
					</td>
					<td>
						<GameView width={width} height={height} scale={scale} mode={ImageMode.HEIGHT_MAP}/>
					</td>
					<td>
						<DraggableLight scale={scale} width={width} height={height} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ} lightMoved={this.lightMoved}/>
						<GameView width={width} height={height} scale={scale} mode={ImageMode.SHADOW_MAP} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ}/>
					</td>
					<td>
						<DraggableLight scale={scale} width={width} height={height} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ} lightMoved={this.lightMoved}/>
						<GameView width={width} height={height} scale={scale} mode={ImageMode.LIGHT_MAP} ambientLight={ambientLight} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ} renderDynamicLight applyNormalMap applyPixelLocationOffsetMap applyShadowMap applyPixelOffsetToShadowCalculations/>
					</td>
					<td>
						<DraggableLight scale={scale} width={width} height={height} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ} lightMoved={this.lightMoved}/>
						<GameView width={width} height={height} scale={scale} mode={ImageMode.PLAIN_IMAGE} ambientLight={ambientLight} lightX={dynamicLightX} lightY={dynamicLightY} lightZ={dynamicLightZ} renderDynamicLight applyNormalMap applyPixelLocationOffsetMap applyShadowMap applyPixelOffsetToShadowCalculations/>
					</td>
				</tr>
			</table>

		</div>;
	}

}