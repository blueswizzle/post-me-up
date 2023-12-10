CREATE DATABASE postmeup;

CREATE TABLE gaian(
    id BIGSERIAL PRIMARY KEY,
    firstname VARCHAR(200) NOT NULL,
    lastname varchar(200) NOT NULL,
    username VARCHAR(200) NOT NULL
);


CREATE TABLE post(
    id BIGSERIAL PRIMARY KEY,
    gaian_id BIGSERIAL NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    post_date DATE DEFAULT CURRENT_DATE,
    post_time TIME DEFAULT CURRENT_TIME,
    FOREIGN KEY (gaian_id) REFERENCES gaian(id)
);