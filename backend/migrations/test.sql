-- ===================================================================
-- INDEX POUR OPTIMISATION DES PERFORMANCES
-- ===================================================================

-- Index sur les transactions (requêtes fréquentes)
CREATE INDEX idx_transactions_tracking_code ON transactions(tracking_code);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_agent ON transactions(assigned_agent_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_countries ON transactions(from_country_id, to_country_id);

-- Index sur les agents et balances
CREATE INDEX idx_balances_agent_currency ON balances(agent_id, currency_id);
CREATE INDEX idx_agents_country ON agents(country_id);
CREATE INDEX idx_authorized_numbers_agent ON authorized_numbers(agent_id, is_active);

-- Index sur les taux de change
CREATE INDEX idx_rates_currencies ON rates(from_currency_id, to_currency_id, is_active);
CREATE INDEX idx_rates_active ON rates(is_active, created_at DESC);

-- Index sur l'historique
CREATE INDEX idx_history_action_type ON history(action_type, created_at DESC);
CREATE INDEX idx_history_actor ON history(actor_type, actor_id);

-- Index sur les pays/devises
CREATE INDEX idx_countries_currency ON countries(currency_id);

-- ===================================================================
-- FONCTIONS UTILITAIRES
-- ===================================================================

-- Fonction pour générer un code de suivi unique
CREATE OR REPLACE FUNCTION generate_tracking_code() RETURNS VARCHAR(20) AS $$
DECLARE
    new_code VARCHAR(20);
    code_exists BOOLEAN;
BEGIN
    LOOP
        new_code := 'TR' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
        SELECT EXISTS(SELECT 1 FROM transactions WHERE tracking_code = new_code) INTO code_exists;
        IF NOT code_exists THEN
            EXIT;
        END IF;
    END LOOP;
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer les gains d'agent
CREATE OR REPLACE FUNCTION calculate_agent_gain(
    p_receive_amount NUMERIC,
    p_commission_percent NUMERIC
) RETURNS NUMERIC AS $$
BEGIN
    RETURN ROUND(p_receive_amount * p_commission_percent / 100, 0);
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Application du trigger sur les tables concernées
CREATE TRIGGER trigger_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_rates_updated_at BEFORE UPDATE ON rates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- DONNÉES D'EXEMPLE (SEED DATA)
-- ===================================================================

-- Insertion des devises principales
INSERT INTO currencies (code, name, symbol) VALUES 
('XOF', 'Franc CFA Ouest-Africain', 'fR'),
('RUB', 'Rouble Russe', '₽'),
('EUR', 'Euro', '€'),
('USD', 'Dollar Américain', '$');

-- Insertion des pays avec leur devise unique
INSERT INTO countries (name, code, phone_prefix, currency_id) VALUES 
('Russie', 'RUS', '+7', 2),        -- RUB
('Côte d''Ivoire', 'CIV', '+225', 1), -- XOF
('Cameroun', 'CMR', '+237', 1),    -- XOF
('Mali', 'MLI', '+223', 1),        -- XOF
('Congo', 'COG', '+242', 1),       -- XOF
('Bénin', 'BEN', '+229', 1),       -- XOF
('Gabon', 'GAB', '+241', 1);       -- XOF

-- Moyens de paiement par pays
INSERT INTO payment_methods (country_id, method) VALUES
-- Russie
(1, 'Sberbank'),
(1, 'Tinkoff'),
-- Côte d'Ivoire
(2, 'Orange Money'),
(2, 'MTN Mobile Money'),
(2, 'Wave'),
-- Cameroun
(3, 'Orange Money'),
(3, 'MTN Mobile Money'),
-- Mali
(4, 'Orange Money'),
(4, 'Malitel Money'),
-- Congo
(5, 'Airtel Money'),
-- Bénin
(6, 'MTN Mobile Money'),
-- Gabon
(7, 'Airtel Money');

-- Admin par défaut
INSERT INTO admins (email, password, name) VALUES 
('admin@transfert.com', '$2b$10$example_hashed_password', 'Administrateur Principal');

-- Taux de change exemple
INSERT INTO rates (from_currency_id, to_currency_id, rate, commission_percent, created_by) VALUES
(1, 2, 0.136, 0.75, 1),  -- XOF -> RUB
(2, 1, 7.35, 0.75, 1);   -- RUB -> XOF

-- ===================================================================
-- VUES UTILES POUR LES REQUÊTES FRÉQUENTES
-- ===================================================================

-- Vue des transactions avec détails complets
CREATE VIEW v_transaction_details AS
SELECT 
    t.id,
    t.tracking_code,
    t.status,
    cf.name as from_country,
    ct.name as to_country,
    curr_from.code as from_currency_code,
    curr_from.symbol as from_currency_symbol,
    curr_to.code as to_currency_code,
    curr_to.symbol as to_currency_symbol,
    t.sender_phone,
    t.receiver_phone,
    pm.method as payment_method,
    t.send_amount,
    t.receive_amount,
    t.rate_applied,
    t.commission_applied,
    a.name as agent_name,
    an.number as authorized_number,
    t.created_at,
    t.expires_at,
    t.completed_at
FROM transactions t
JOIN countries cf ON t.from_country_id = cf.id
JOIN countries ct ON t.to_country_id = ct.id
JOIN currencies curr_from ON cf.currency_id = curr_from.id
JOIN currencies curr_to ON ct.currency_id = curr_to.id
JOIN payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN agents a ON t.assigned_agent_id = a.id
LEFT JOIN authorized_numbers an ON t.authorized_number_id = an.id;

-- Vue des balances agents avec devises
CREATE VIEW v_agent_balances AS
SELECT 
    a.id as agent_id,
    a.name as agent_name,
    c.name as country_name,
    cur.code as currency_code,
    cur.symbol as currency_symbol,
    COALESCE(b.amount, 0) as balance_amount,
    b.last_updated
FROM agents a
JOIN countries c ON a.country_id = c.id
JOIN currencies cur ON c.currency_id = cur.id
LEFT JOIN balances b ON a.id = b.agent_id AND cur.id = b.currency_id
WHERE a.is_active = true;

-- Vue simplifiée des pays avec devises
CREATE VIEW v_country_currency AS
SELECT 
    c.id as country_id,
    c.name as country_name,
    c.code as country_code,
    c.phone_prefix,
    curr.id as currency_id,
    curr.code as currency_code,
    curr.name as currency_name,
    curr.symbol as currency_symbol
FROM countries c
JOIN currencies curr ON c.currency_id = curr.id
WHERE c.is_active = true AND curr.is_active = true;

-- ===================================================================
-- FIN DU SCHÉMA SIMPLIFIÉ
-- ===================================================================


CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    tracking_code VARCHAR(20) UNIQUE NOT NULL,
    sender_country_id INT NOT NULL REFERENCES countries(id),
    receiver_country_id INT NOT NULL REFERENCES countries(id),
    sender_phone VARCHAR(20) NOT NULL,
    sender_method_id INT NOT NULL REFERENCES payment_methods(id),
    receiver_phone VARCHAR(20) NOT NULL,
    receiver_method_id INT NOT NULL REFERENCES payment_methods(id),
    amount_sent NUMERIC(12,2) NOT NULL,
    amount_received NUMERIC(12,2) NOT NULL,
    rate_id INT NOT NULL REFERENCES exchange_rates(id),
    agent_id INT NOT NULL REFERENCES agents(id),
    status transaction_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
