import CartesianPoint from './CartesianPoint.js';

function VoronoiEdge(cartesianPoints) {
	this._points = cartesianPoints.map(function (point) {
		if (!(point instanceof CartesianPoint)) {
			return new CartesianPoint(point);
		}
		return point;
	});
}

VoronoiEdge.prototype.latLngPath = function latLngPath() {
	return this._points.map(function (point) {
		return point.toLatLng();
	});
};

// Code adapted from http://lpetrich.org/Science/GeometryDemo/GeometryDemo_GMap.html
// function Add_GMapLine(...)
VoronoiEdge.prototype.latLngPathSmooth = function latLngPath(threshold) {
	if (!threshold || this._points.length < 2) {
		return this.latLngPath();
	}
	
	var previousPoint = this._points[0];
	var smoothPoints = [previousPoint];
	for (var i = 1; i < this._points.length; i++) {
		var point = this._points[i];
		smoothPoints.push.apply(smoothPoints, splitSegment(previousPoint, point, threshold));
		smoothPoints.push(point);

		previousPoint = point;
	}

	// for loop is faster the Array.prototype.map - crucial for a larger array like smoothPoints
	for (var i = 0; i < smoothPoints.length; i++) {
		smoothPoints[i] = (new CartesianPoint(smoothPoints[i])).toLatLng();
	}
	return smoothPoints;
};

// copied from http://lpetrich.org/Science/GeometryDemo/GeometryDemo_GMap.html
function splitSegment(p0,p1, threshold)
{
	var diff = 0.0;
	for (var ic=0; ic<3; ic++)
	{
		var dfc = p1[ic] - p0[ic];
		diff += dfc*dfc;
	}
	var empty = [];
	if (diff < threshold) return empty;
	
	var px = new Array(3);
	for (var ic=0; ic<3; ic++)
		px[ic] = p0[ic] + p1[ic];
	var asqr = 0;
	for (var ic=0; ic<3; ic++)
	{
		var pc = px[ic];
		asqr += pc*pc;
	}
	var normmult = 1/Math.sqrt(asqr);
	for (var ic=0; ic<3; ic++)
		px[ic] *= normmult;
	
	return empty.concat(splitSegment(p0,px, threshold),[px],splitSegment(px,p1, threshold));
}

export default VoronoiEdge;