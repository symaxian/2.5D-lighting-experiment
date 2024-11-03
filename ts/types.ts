type float = number;
type int = number;
type byte = number;

type Percentage = number; // From 0-1

type int_Milliseconds = number;
type Radians = number;
type Degrees = number;

type number_Pixels = number;
type int_Pixels = number;
type float_Pixels = number;

type number_UnscaledPixels = number;
type number_ScaledPixels = number;

type number_BigPixels = number; // This refers to the scaled up pixels, PhysicalPixels = BigPixels * scale
type float_BigPixels = number;
type int_BigPixels = number;

type number_NativePixels = number; // This refers to a count of actual pixels on the users display
type int_NativePixels = number; // This refers to a count of actual pixels on the users display
type float_NativePixels = number; // This refers to a count of actual pixels on the users display

type i8 = number;
type i16 = number;
type i32 = number;
type u8 = number;
type u16 = number;
type u32 = number;

const enum Direction {
	NORTH,
	SOUTH,
	WEST,
	EAST
}

const enum ExtendedDirection {
	NORTH,
	SOUTH,
	EAST,
	WEST,
	NORTH_EAST,
	NORTH_WEST,
	SOUTH_EAST,
	SOUTH_WEST
}
