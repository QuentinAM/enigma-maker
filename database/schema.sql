CREATE TABLE users (
    id        SERIAL       NOT NULL,
    email     VARCHAR(255) NOT NULL,
    password  VARCHAR(255) NOT NULL,
    created   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE (email)
);

CREATE TABLE users_session (
    id        SERIAL       NOT NULL,
    user_id   INTEGER      NOT NULL,
    token     VARCHAR(255) NOT NULL,
    created   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);