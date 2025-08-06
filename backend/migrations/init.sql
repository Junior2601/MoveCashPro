-- SUPPRIMER LES TABLES SI ELLES EXISTENT
DROP TABLE IF EXISTS transaction_history,
                    redirections,
                    transactions,
                    agent_balances,
                    agent_gains,
                    authorized_numbers,
                    rates,
                    currencies,
                    agents,
                    admins,
                    countries
CASCADE;

-- TABLE DES PAYS
CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code CHAR(2) NOT NULL UNIQUE,
    phone_prefix VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE DES DEVISES
CREATE TABLE currencies (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(50),
    symbol VARCHAR(5)
);

-- TABLE DES ADMINIS
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE DES AGENTS
CREATE TABLE agents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone VARCHAR(20),
    country_id INTEGER REFERENCES countries(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE DE LA BALANCE DES AGENTS (multi-devise)
CREATE TABLE agent_balances (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,
    currency_id INTEGER REFERENCES currencies(id) ON DELETE CASCADE,
    balance NUMERIC(12,2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agent_id, currency_id)
);

-- TABLE DES NUMEROS AUTORISES POUR RECEVOIR UN DEPOT
CREATE TABLE authorized_numbers (
    id SERIAL PRIMARY KEY,
    number VARCHAR(50) NOT NULL,
    country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
    agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE DES TAUX DE CONVERSION
CREATE TABLE rates (
    id SERIAL PRIMARY KEY,
    from_currency_id INTEGER REFERENCES currencies(id) ON DELETE CASCADE,
    to_currency_id INTEGER REFERENCES currencies(id) ON DELETE CASCADE,
    rate NUMERIC(12,4) NOT NULL,
    commission_percent NUMERIC(5,2) NOT NULL DEFAULT 0.75,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE DE TRANSACTION
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    tracking_code VARCHAR(20) UNIQUE NOT NULL,

    sender_country_id INTEGER REFERENCES countries(id) ON DELETE SET NULL,
    receiver_country_id INTEGER REFERENCES countries(id) ON DELETE SET NULL,

    sender_phone VARCHAR(20) NOT NULL,
    receiver_phone VARCHAR(20) NOT NULL,

    payment_method VARCHAR(50),
    reception_method VARCHAR(50),

    amount_sent NUMERIC(12,2) NOT NULL,
    amount_received NUMERIC(12,2) NOT NULL,

    exchange_rate NUMERIC(12,4),
    commission_percent NUMERIC(5,2),

    agent_gain NUMERIC(12,2),
    company_margin NUMERIC(12,2),

    agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
    authorized_number_id INTEGER REFERENCES authorized_numbers(id) ON DELETE SET NULL,

    status VARCHAR(20) DEFAULT 'en_attente',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE DES GAINS DES AGENTS
CREATE TABLE agent_gains (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,
    transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
    gain NUMERIC(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE DES REDIRECTIONS
CREATE TABLE redirections (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
    from_agent_id INTEGER REFERENCES agents(id),
    to_agent_id INTEGER REFERENCES agents(id),
    redirected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    partial BOOLEAN DEFAULT FALSE
);

-- TABLE DE L'HISTORIQUE DES TRANSACTION
CREATE TABLE transaction_history (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
    action VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    performed_by_admin_id INTEGER REFERENCES admins(id),
    performed_by_agent_id INTEGER REFERENCES agents(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
