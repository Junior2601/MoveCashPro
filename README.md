Projet de Plateforme de Transfert d’Argent Russie ↔ Afrique

Objectif
Développer une passerelle de transfert d’argent entre la Russie et plusieurs pays d’Afrique (Côte d’Ivoire, Cameroun, Mali, Congo, Bénin, Gabon, etc.) permettant aux utilisateurs d’effectuer des transferts sans créer de compte. L’argent est envoyé via un agent local agréé et redirigé vers le bénéficiaire dans le pays de réception.

Structure Globale du Site

Page d’Accueil
 Divisée en 4 sections :
1. Transaction
Formulaire pour initier un transfert d’argent.
2. Suivi
    Suivi de transaction via un code unique.
3. Service Client
   Liste des numéros du service client.
4. Calculatrice de Conversion
Convertisseur avec taux en temps réel.

Module Transaction (Client)
Formulaire de Transfert
Champs à remplir :
	Pays d’envoi (liste déroulante, dépend des pays ajoutés par l’admin)
	Numéro d’envoi (indicatif généré automatiquement selon le pays)
	Moyen de paiement (lié au pays)
	Pays de réception
	Numéro de réception
Moyen de réception
	Montant à transférer (devise du pays d’envoi)
	Montant reçu (devise du pays de réception, taux appliqué automatiquement)
Après soumission
 Affichage d’un numéro agréé (lié à un agent).
 Code de suivi unique.
 Compte à rebours de 10 minutes pour effectuer le virement.

---

 Module Suivi de Transaction

Champ de saisie pour le code de suivi.
Affichage de l’état de la transaction :
	En attente
	Effectuée
	Échouée
	Inexistante

---

 Module Service Client
 Liste des agents disponibles avec leurs :
Coordonnées
Pays d’opération
Moyens de contact
---
 Espace Administrateur

 Sécurisé par login/mot de passe
 Fonctionnalités principales
 Profil de l’admin
 Dashboard avec statistiques globales (transferts, volumes, export Excel)
 Gestion des agents
  Création de comptes agents avec identifiants
 Solde des agents

 Consultation, ajout, retrait de fonds
 Ajout & gestion des pays
 Assigner devises & moyens de paiement à chaque pays
 Taux de change

   Ajouter/modifier taux de transaction entre devises
  Numéros agréés de transaction

   Attribuer des numéros à des pays et agents
 Historique global

   Transactions, modifications de solde, changements de taux

---
Espace Agent
 Sécurisé par login/mot de passe

 Fonctionnalités

1. Tableau de bord
    Fonds disponibles par devise
    Transactions en attente/récentes
    Indicateurs visuels (code couleur pour fonds suffisants/insuffisants)

2. Gestion des Transactions
    Possibilité de rediriger une transaction vers un autre agent
    Le gain reste à l’agent initial
    Redirection partielle possible si fonds insuffisants

3. Suivi & Notifications
    Historique complet
    Notifications en cas de redirection ou transaction partielle

4. Gestion des gains
    Gain calculé automatiquement selon le taux et la commission du jour (ex. 0,75%)
---
 Exemples de Calculs
 Calcul du gain de l’agent
 Montant envoyé : 10 000 FR
 Taux : 10 000 FR = 1360 ₽
 Commission : 0,75%
 Gain : `1360 × 0,75% = 10,2 ₽` → arrondi à 10 ₽

 Calcul de la marge entreprise

 Client envoie : 10 000 FR → reçoit 1360 ₽
 Pour 9 900 FR, il remet 1394 ₽
 Marge : `1394 - 1360 = 34 ₽`
 Si agent gagne 10 ₽ → Entreprise gagne : 24 ₽

---

 Architecture technique souhaitée

 Stack : PERN (PostgreSQL, Express.js, React.js, Node.js)
 Frontend :
   React + TypeScript + TailwindCSS
   Pages : Accueil, Suivi, Transaction, Calculatrice
 Backend :
   Express + PostgreSQL
   Auth sécurisée pour agents/admins
   API RESTful
   Calculs dynamiques des gains/marges
   Email notifications (redirection ou fond insuffisant)
 Sécurité :
   Authentification JWT pour admin et agents
   Rôle-Based Access Control
   Horodatage des transactions et actions critiques
