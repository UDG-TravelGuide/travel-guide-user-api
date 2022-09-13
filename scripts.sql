-- MOLT IMPORTANT -> Executar dins la base de dades que s'utilitzará

CREATE TABLE routes (
	id int4 NOT NULL DEFAULT nextval('route_id_seq'::regclass),
	latitude_initial float4 NOT NULL,
	longitude_initial float4 NOT NULL,
	latitude_final float4 NOT NULL,
	longitude_final float4 NOT NULL,
	publication_id int4 NOT NULL,
	CONSTRAINT route_pk PRIMARY KEY (id)
);

CREATE TABLE users (
	id serial4 NOT NULL,
	user_name varchar NOT NULL,
	email varchar NOT NULL,
	"password" varchar NULL,
	birth_date varchar NULL,
	profile_photo varchar NULL,
	points int4 NOT NULL DEFAULT 0,
	"role" varchar NOT NULL DEFAULT USER,
	last_ip varchar NULL,
	"blocked" bool NOT NULL DEFAULT false,
	CONSTRAINT users_pk PRIMARY KEY (id)
);

CREATE TABLE directions (
	id serial4 NOT NULL,
	latitude_origin float4 NOT NULL,
	longitude_origin float4 NOT NULL,
	latitude_destiny float4 NOT NULL,
	longitude_destiny float4 NOT NULL,
	route_id int4 NOT NULL,
	CONSTRAINT directions_pk PRIMARY KEY (id),
	CONSTRAINT directions_fk FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE publications (
	id serial4 NOT NULL,
	title varchar NOT NULL,
	description varchar NOT NULL,
	author_id int4 NOT NULL,
	country_alpha_code varchar NOT NULL,
	number_of_reports int4 NOT NULL DEFAULT 0,
	points int4 NOT NULL DEFAULT 0,
	CONSTRAINT publications_pk PRIMARY KEY (id),
	CONSTRAINT publications_fk FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE recovers (
	id serial4 NOT NULL,
	user_id int4 NOT NULL,
	"token" varchar NOT NULL,
	used int4 NOT NULL DEFAULT 0,
	CONSTRAINT recovers_pk PRIMARY KEY (id),
	CONSTRAINT recovers_fk FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE user_publication_points (
	id serial4 NOT NULL,
	user_id int4 NOT NULL,
	publication_id int4 NOT NULL,
	CONSTRAINT user_publication_points_pk PRIMARY KEY (id),
	CONSTRAINT user_publication_points_fk FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT user_publication_points_fk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE contents (
	id serial4 NOT NULL,
	"type" varchar NOT NULL,
	value varchar NULL,
	"position" int4 NOT NULL,
	publication_id int4 NOT NULL,
	CONSTRAINT contents_pk PRIMARY KEY (id),
	CONSTRAINT contents_fk FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE favorite_publication_users (
	id serial4 NOT NULL,
	publication_id int4 NOT NULL,
	user_id int4 NOT NULL,
	CONSTRAINT favorite_publication_users_pk PRIMARY KEY (id),
	CONSTRAINT favorite_publication_users_fk FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT favorite_publication_users_fk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE images (
	id serial4 NOT NULL,
	value varchar NOT NULL,
	content_id int4 NOT NULL,
	CONSTRAINT images_pk PRIMARY KEY (id),
	CONSTRAINT images_fk FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE ON UPDATE CASCADE
);