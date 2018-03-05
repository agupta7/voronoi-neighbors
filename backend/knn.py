import psycopg2
import shapely.wkt

connection = psycopg2.connect(host='raspberrypi3.local',database="voronoi_neighbors",user="voronoi_neighbors", password="voronoi")

def allPois():
	query = 'select name, ST_AsText(location) from POIs'
	cursor = connection.cursor()
	cursor.execute(query)
	records = list()

	for name, location in cursor:
		pt = shapely.wkt.loads(location)
		lat = pt.y
		lng = pt.x
		record = dict(name=name, location={'lat': lat, 'lng': lng})
		records.append(record)

	return records