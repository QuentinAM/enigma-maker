CREATE TABLE users (
    id            SERIAL       NOT NULL,
    email         VARCHAR(255) NOT NULL,
    password      VARCHAR(255) NOT NULL,
    session_token VARCHAR(255),
    created       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE (email)
);

CREATE TABLE enigma(
    id          SERIAL       NOT NULL,
    owner_id    INTEGER      NOT NULL,
    title       VARCHAR(255) NOT NULL,
    description TEXT         ,
    start_date  DATE         NOT NULL,
    end_date    DATE         NOT NULL,
    created     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE enigma_step(
    id             SERIAL       NOT NULL,
    enigma_id      INTEGER      NOT NULL,
    index          INTEGER      NOT NULL,
    title          VARCHAR(255) NOT NULL,
    description    TEXT         ,
    attempt_limit  INTEGER      DEFAULT 0, -- 0 = unlimited
    time_refresh   INTEGER      DEFAULT 0, -- in seconds, 0 = no refresh
    solution       TEXT         DEFAULT '',
    case_sensitive BOOLEAN      DEFAULT TRUE,
    created        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (enigma_id) REFERENCES enigma(id)
);