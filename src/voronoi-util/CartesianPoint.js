/**
 * Class that represents a cartesian point
 */

/**
 * Constructor for CartesianPoint
 * @param x - x coordinate
 * @param y - y coordinate
 * @param z - z coordinate
 */
function CartesianPoint(x, y, z) {
	if (x instanceof Array || x instanceof CartesianPoint || x.length) {
		y = x[1];
		z = x[2];
		x = x[0];
	}
	this['x'] = this[0] = x;
	this.y = this[1] = y;
	this.z = this[2] = z;

	// emulate array-like behavior with js duck-typing
	this.length = 3;
}

CartesianPoint.prototype.toArray = function toArray() {
	return [this.x, this.y, this.z];
};

CartesianPoint.prototype.normalize = function normalize() {
	var squares = this.toArray().map(function (coord) {
		return coord ** 2;
	});
	var distance = Math.sqrt(squares.reduce(function (prev, current) {
		return prev + current;
	}));

	var normalized = this.toArray().map(function (coord) {
		return coord / distance;
	});

	return new CartesianPoint(normalized[0], normalized[1], normalized[2]);
};

CartesianPoint.prototype.toLatLng = function toLatLng() {
	// https://vvvv.org/blog/polar-spherical-and-geographic-coordinates
	var polar = Math.acos(this.z);
	var lat = 90 - CartesianPoint._radiansToDegrees(polar);
	
	// http://www.geomidpoint.com/example.html
	var hypotenuse = Math.sqrt(this.x ** 2 + this.y ** 2);
	//var lat = CartesianPoint._radiansToDegrees(Math.atan2(this.z, hypotenuse));
	
	var azimuthal = Math.atan2(this.y, this.x);
	var lng = CartesianPoint._radiansToDegrees(azimuthal);

	return {'lat': lat, 'lng': lng};
};

CartesianPoint.fromLatLng = function fromLatLng(latLng) {
	var radians = CartesianPoint._latLngToRadians(latLng);

	// https://vvvv.org/blog/polar-spherical-and-geographic-coordinates
	var x = Math.cos(radians.polarComplement) * Math.cos(radians.azimuthal);
	var y = Math.cos(radians.polarComplement) * Math.sin(radians.azimuthal);
	var z = Math.sin(radians.polarComplement);

	return new CartesianPoint(x, y, z);
};

CartesianPoint._latLngToRadians = function _latLngToRadians(latLng) {
	var radians = {polarComplement: 0, azimuthal: 0};
	radians.polarComplement = Math.PI / 180 * latLng.lat;
	radians.azimuthal = Math.PI / 180 * latLng.lng;

	return radians;
};

CartesianPoint._radiansToDegrees = function _radiansToDegrees(radians) {
	return radians * 180 / Math.PI;
};

export default CartesianPoint;