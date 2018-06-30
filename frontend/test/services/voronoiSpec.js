import voronoiDiagram from '../../src/voronoi-util/voronoi.js';

const POINTS = [
	{
		"tail": {"phone": "3348217740", "name": "Chipotle Mexican Grill", "address": "346 W Magnolia Ave, Auburn, AL, 36832"},
		"location": {"lat": 32.606736094973, "lng": -85.4873335361481}
	},
	{
		"tail": {"phone": "3348267630", "name": "Chick-fil-A", "address": "326 W Magnolia Ave, Auburn, AL 36832"},
		"location": {"lat": 32.6068264734675, "lng": -85.4864645004272}},
	{
		"tail": {"phone": "3348217185", "name": "McDonald's", "address": "224 W Magnolia Ave, Auburn, AL 36830"},
		"location": {"lat": 32.6070885705858, "lng": -85.4838573932648}},
	{
		"tail": {"phone": "3348214001", "name": "Skybar Cafe", "address": "136 W Magnolia Ave, Auburn, AL 36830"},
		"location": {"lat": 32.6066909056915, "lng": -85.4827737808228}},
	{
		"tail": {"phone": "3348216161", "name": "Little Italy Pizzeria", "address": "129 E Magnolia Ave, Auburn, AL 36830"},
		"location": {"lat": 32.6067089814068, "lng": -85.4809498786926}},
	{
		"tail": {"phone": "3348876356", "name": "Mellow Mushroom", "address": "128 N College St, Auburn, AL 36830"},
		"location": {"lat": 32.6073642236242, "lng": -85.4815399646759}},
	{
		"tail": {"phone": "3348260987", "name": "Waffle House", "address": "110 W Glenn Ave, Auburn, AL 36830"},
		"location": {"lat": 32.6092937711381, "lng": -85.4826557636261}},
	{
		"tail": {"phone": "3348872677", "name": "Hamilton's On Magnolia", "address": "174 E Magnolia Ave, Auburn, AL 36830"},
		"location": {"lat": 32.6063158337755, "lng": -85.4800432920456}},
	{
		"tail": {"phone": "3348441818", "name": "Panda Express", "address": "1310 Wilmore Dr, Auburn, AL 36849"},
		"location": {"lat": 32.6048833157383, "lng": -85.485160946846}},
	{
		"tail": {"phone": "2057674494", "name": "Starbucks", "address": "Quad Center, 255 Duncan Dr, Auburn, AL 36849"},
		"location": {"lat": 32.6024610880116, "lng": -85.4865717887878}
	}
].map(function (point) {
	// imitating the local controller copy of POIs;
	point.lat = point.location.lat;
	point.lng = point.location.lng;
	delete point.location;
	return point;
});

describe('voronoiSpec', function () {
	var vordiag = voronoiDiagram(POINTS);
	beforeEach(function () {
		vordiag = voronoiDiagram(POINTS);
	});
	it('voronoiDiagram() works', function () {
		expect(vordiag.cells).toBeDefined();
		expect(vordiag.cells.length).toBeGreaterThan(0);
		expect(vordiag.cells.length).toBe(10);

		expect(vordiag.edges).toBeDefined();
		expect(vordiag.edges.length).toBeGreaterThan(0);

		var chipotleCell = vordiag.cells[0];
		var chipotleNeighbors = chipotleCell.getNeighbors();
		expect(chipotleNeighbors.length).toBeGreaterThan(0);
		expect(chipotleNeighbors.length).toBe(4);

	});

	it('voronoiDiagram() sorts neighbors by increasing azimuth (phi in polar)', function () {
		var mellowMushroomCell = vordiag.cells[5];
		var mmNeighbors = mellowMushroomCell.getNeighbors();
		expect(mmNeighbors.length).toBe(5);
		expect(mmNeighbors[0].owner).toBe(POINTS[2]); // first neighbor is directly west - McDonald's
		// then we rotate counter-clockwise in increasing azimuth
		expect(mmNeighbors[1].owner).toBe(POINTS[3]); // Skybar
		expect(mmNeighbors[2].owner).toBe(POINTS[4]); // Little Italy
		expect(mmNeighbors[3].owner).toBe(POINTS[7]); // Hamilton's On Magnolia
		expect(mmNeighbors[4].owner).toBe(POINTS[6]); // Waffle House
	});
});