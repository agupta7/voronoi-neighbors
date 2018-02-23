import CartesianPoint from './CartesianPoint.js';
import VoronoiEdge from './VoronoiEdge.js';
import delaunayTriangulation from '../lib/delaunayTriangles.js';

/**
 * Uses Loren Petrich's MIT Licensed Delaunay Triangulation library to calculate Voronoi cells in true spherical coordinates.
 * http://lpetrich.org/
 * http://lpetrich.org/Science/GeometryDemo/GeometryDemo_GMap.html
 * 
 * @param {*} latLngPoints 
 */
function voronoiDiagram(latLngPoints) {
	var cartesiansNormalized = latLngPoints.map(function (latlng) {
		return CartesianPoint.fromLatLng(latlng);
	});

	var voronoiEdges = calculateVoronoiEdges(cartesiansNormalized);
	return voronoiEdges;
}

function calculateVoronoiEdges(cartesianPoints) {
	var points = cartesianPoints.map(function(cp) {
		return cp.normalize().toArray();
	});
	
	var delaunayTriangles = delaunayTriangulation(points);
	
	// Transform each voronoi edge, which is a collection of points that forms a path on the map
	var voronoiEdges = delaunayTriangles.vor_edges.map(function (edgePointIndecies) {
		// Each edgePoint is a Cartesian coordinate
		var edgePoints = edgePointIndecies.map(function (pointIndex) {
			return new CartesianPoint(delaunayTriangles.vor_positions[pointIndex]);
		});

		return new VoronoiEdge(edgePoints);
	});

	return voronoiEdges;
}

export default voronoiDiagram;