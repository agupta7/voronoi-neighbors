DROP TABLE IF EXISTS POIs;

CREATE TABLE POIs (
	id serial primary key,
	location geometry,
	name varchar,
	phone varchar,
	address varchar,
	neighbors bytea,
	verificationObject bytea
);

--ALTER TABLE "pois" ADD CONSTRAINT "pois_id" PRIMARY KEY ("id");

CREATE INDEX idx_poi_locations ON POIs using gist(location);

INSERT INTO POIs VALUES (
	101, 
	ST_SetSRID(ST_MakePoint(-85.48733353614807, 32.606736094972966), 4326),
	'Chipotle Mexican Grill',
	'3348217740',
	'346 W Magnolia Ave, Auburn, AL, 36832'
);

INSERT INTO POIs VALUES (
	102, 
	--ST_GeometryFromText('POINT(32.60682647346745 -85.48646450042725)', 4326)
	ST_SetSRID(ST_MakePoint(-85.48646450042725, 32.60682647346745), 4326),
	'Chick-fil-A',
	'3348267630',
	'326 W Magnolia Ave, Auburn, AL 36832'
);
INSERT INTO POIs VALUES (
	103, 
	ST_SetSRID(ST_MakePoint(-85.48385739326477, 32.6070885705858), 4326),
	'McDonald''s',
	'3348217185',
	'224 W Magnolia Ave, Auburn, AL 36830'
);
INSERT INTO POIs VALUES (
	104, 
	ST_SetSRID(ST_MakePoint(-85.48277378082275, 32.606690905691494), 4326),
	'Skybar Cafe',
	'3348214001',
	'136 W Magnolia Ave, Auburn, AL 36830'
);
INSERT INTO POIs VALUES (
	105, 
	ST_SetSRID(ST_MakePoint(-85.48094987869263, 32.60670898140683), 4326),
	'Little Italy Pizzeria',
	'3348216161',
	'129 E Magnolia Ave, Auburn, AL 36830'
);
INSERT INTO POIs VALUES (
	106, 
	ST_SetSRID(ST_MakePoint(-85.4815399646759, 32.60736422362415), 4326),
	'Mellow Mushroom',
	'3348876356',
	'128 N College St, Auburn, AL 36830'
);
INSERT INTO POIs VALUES (
	107, 
	ST_SetSRID(ST_MakePoint(-85.4826557636261, 32.609293771138134), 4326),
	'Waffle House',
	'3348260987',
	'110 W Glenn Ave, Auburn, AL 36830'
);
INSERT INTO POIs VALUES (
	108, 
	ST_SetSRID(ST_MakePoint(-85.4800432920456, 32.606315833775504), 4326),
	'Hamilton''s On Magnolia',
	'3348872677',
	'174 E Magnolia Ave, Auburn, AL 36830'
);
INSERT INTO POIs VALUES (
	109, 
	ST_SetSRID(ST_MakePoint(-85.48516094684601, 32.6048833157383), 4326),
	'Panda Express',
	'3348441818',
	'1310 Wilmore Dr, Auburn, AL 36849'
);
INSERT INTO POIs VALUES (
	110, 
	ST_SetSRID(ST_MakePoint(-85.48657178878784, 32.602461088011616), 4326),
	'Starbucks',
	'2057674494',
	'Quad Center, 255 Duncan Dr, Auburn, AL 36849'
);
