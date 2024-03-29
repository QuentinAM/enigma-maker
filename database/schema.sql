CREATE TABLE users (
    id            SERIAL       NOT NULL,
    email         VARCHAR(255) NOT NULL,
    username      VARCHAR(32) DEFAULT '',
    password      VARCHAR(255) NOT NULL,
    created       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE (email),
    UNIQUE (username)
);

CREATE TABLE enigma(
    id          SERIAL       NOT NULL,
    owner_id    INTEGER      NOT NULL,
    title       VARCHAR(255) NOT NULL,
    description TEXT         ,
    start_date  VARCHAR(32)  NOT NULL,
    end_date    VARCHAR(32)  NOT NULL,
    created     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    public      BOOLEAN      DEFAULT FALSE,
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

CREATE TABLE enigma_step_attempt(
    id             SERIAL       NOT NULL,
    enigma_step_id INTEGER      NOT NULL,
    user_id        INTEGER      NOT NULL,
    attempt        TEXT         NOT NULL,
    created        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (enigma_step_id) REFERENCES enigma_step(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE enigma_assignment(
    id                 SERIAL       NOT NULL,
    enigma_id          INTEGER      NOT NULL,
    user_id            INTEGER      NOT NULL,
    current_step_index INTEGER      DEFAULT 0, -- 0 = not started, 1 = first step, etc.
    completed          BOOLEAN      DEFAULT FALSE,
    created            TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (enigma_id) REFERENCES enigma(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE (enigma_id, user_id)
);