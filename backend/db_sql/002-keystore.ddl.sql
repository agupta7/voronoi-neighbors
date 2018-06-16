DROP TABLE IF EXISTS keystore;

CREATE TABLE keystore (
	id serial primary key,
	source varchar,
	type varchar,
	key varchar,
	time_utc timestamp
);