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
-- 
