-- ========================================
-- SCRIPT DE SEED PRODUCTION
-- Données de démonstration complètes
-- ========================================
--
-- Ce script crée 2 événements avec toutes les fonctionnalités :
-- - Event 1: "10 Ans Weevup" (Célébration anniversaire)
-- - Event 2: "Tech Summit 2025" (Conférence tech)
--
-- Fonctionnalités incluses :
-- ✅ Utilisateurs admin
-- ✅ Événements complets
-- ✅ Invités avec tokens uniques
-- ✅ RSVPs (confirmations, refus, en attente)
-- ✅ Check-ins (QR code, manuel, auto)
-- ✅ Module Transport (vols, trains, navettes)
-- ✅ Manifests de transport groupé
-- ✅ Intégrations email (Resend, SendGrid)
--
-- ⚠️ ATTENTION : Ce script SUPPRIME toutes les données existantes
-- ========================================

BEGIN;

-- ========================================
-- 1. NETTOYAGE (supprimer les données existantes)
-- ========================================

-- Ordre important à cause des clés étrangères
DELETE FROM "ManifestParticipant";
DELETE FROM "TransportManifest";
DELETE FROM "TransportBooking";
DELETE FROM "EventModule";
DELETE FROM "EmailTracking";
DELETE FROM "CheckIn";
DELETE FROM "RSVP";
DELETE FROM "Guest";
DELETE FROM "EmailIntegration";
DELETE FROM "Event";
DELETE FROM "User";

-- ========================================
-- 2. UTILISATEUR ADMIN
-- ========================================

INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES
  (
    gen_random_uuid(),
    'contact@weevup.com',
    -- Password: admin123 (bcrypt hash)
    '$2a$10$rOz3qKvBL8K5rE9yGxGZxOZB.d9mO7qxCZGQXZ5bXqKVvHxPwXY5C',
    'Admin Weevup',
    'ADMIN',
    NOW(),
    NOW()
  );

-- Variable pour stocker l'ID de l'admin
DO $$
DECLARE
  admin_user_id UUID;
  event_weevup_id UUID;
  event_summit_id UUID;

  -- Guests Weevup (10 Ans)
  guest_marie UUID;
  guest_thomas UUID;
  guest_sophie UUID;
  guest_pierre UUID;
  guest_julie UUID;
  guest_marc UUID;
  guest_isabelle UUID;
  guest_françois UUID;
  guest_caroline UUID;
  guest_laurent UUID;

  -- Guests Tech Summit
  guest_yann UUID;
  guest_vitalik UUID;
  guest_cassie UUID;
  guest_julie_f UUID;
  guest_marc_d UUID;
  guest_sarah UUID;
  guest_david UUID;
  guest_emma UUID;
  guest_lucas UUID;
  guest_alice UUID;

  -- Manifests
  manifest_cdg UUID;
  manifest_morning1 UUID;
  manifest_evening1 UUID;
  manifest_airport UUID;

BEGIN

-- Récupérer l'ID de l'admin
SELECT id INTO admin_user_id FROM "User" WHERE email = 'contact@weevup.com';

-- ========================================
-- 3. ÉVÉNEMENT 1 : "10 Ans Weevup"
-- ========================================

event_weevup_id := gen_random_uuid();

INSERT INTO "Event" (
  id, name, slug, description, "startsAt", "endsAt",
  "venueName", address, city, "postalCode", country,
  "maxGuests", "rsvpDeadline", "userId",
  "showcaseEnabled", "showcasePrimaryColor", "showcaseSecondaryColor",
  "showcaseBannerImage", "showcaseSections",
  "createdAt", "updatedAt"
) VALUES (
  event_weevup_id,
  '10 Ans Weevup',
  '10-ans-weevup',
  'Célébration des 10 ans de Weevup avec nos clients et partenaires',
  '2025-06-20 19:00:00',
  '2025-06-21 02:00:00',
  'Pavillon Royal',
  '148 Avenue des Champs-Élysées',
  'Paris',
  '75008',
  'France',
  100,
  '2025-06-15',
  admin_user_id,
  true,
  '#004645',
  '#FF4713',
  'https://images.unsplash.com/photo-1519167758481-83f29da8c9b7',
  '["hero", "description", "details", "gallery", "speakers", "cta"]'::jsonb,
  NOW(),
  NOW()
);

-- ========================================
-- 4. INVITÉS ÉVÉNEMENT WEEVUP (10 invités)
-- ========================================

-- Marie Dupont - VIP Cliente confirmée
guest_marie := gen_random_uuid();
INSERT INTO "Guest" (id, "eventId", "firstName", "lastName", email, category, token, "hashedToken", "tokenExpiresAt", "createdAt", "updatedAt")
VALUES (
  guest_marie, event_weevup_id, 'Marie', 'Dupont', 'marie.dupont@tech-corp.fr', 'VIP',
  'tok_' || substr(md5(random()::text), 1, 32),
  '$2a$10$' || substr(md5(random()::text), 1, 53),
  NOW() + INTERVAL '90 days',
  NOW(), NOW()
);

-- Thomas Bernard - Cliente confirmé
guest_thomas := gen_random_uuid();
INSERT INTO "Guest" (id, "eventId", "firstName", "lastName", email, category, token, "hashedToken", "tokenExpiresAt", "createdAt", "updatedAt")
VALUES (
  guest_thomas, event_weevup_id, 'Thomas', 'Bernard', 'thomas.bernard@innov-solutions.com', 'CLIENT',
  'tok_' || substr(md5(random()::text), 1, 32),
  '$2a$10$' || substr(md5(random()::text), 1, 53),
  NOW() + INTERVAL '90 days',
  NOW(), NOW()
);

-- Sophie Leroy - VIP Cliente avec +1
guest_sophie := gen_random_uuid();
INSERT INTO "Guest" (id, "eventId", "firstName", "lastName", email, category, token, "hashedToken", "tokenExpiresAt", "createdAt", "updatedAt")
VALUES (
  guest_sophie, event_weevup_id, 'Sophie', 'Leroy', 'sophie.leroy@digital-agency.fr', 'VIP',
  'tok_' || substr(md5(random()::text), 1, 32),
  '$2a$10$' || substr(md5(random()::text), 1, 53),
  NOW() + INTERVAL '90 days',
  NOW(), NOW()
);

-- Pierre Moreau - Partenaire confirmé
guest_pierre := gen_random_uuid();
INSERT INTO "Guest" (id, "eventId", "firstName", "lastName", email, category, token, "hashedToken", "tokenExpiresAt", "createdAt", "updatedAt")
VALUES (
  guest_pierre, event_weevup_id, 'Pierre', 'Moreau', 'pierre.moreau@consulting-group.com', 'PARTENAIRE',
  'tok_' || substr(md5(random()::text), 1, 32),
  '$2a$10$' || substr(md5(random()::text), 1, 53),
  NOW() + INTERVAL '90 days',
  NOW(), NOW()
);

-- Julie Martin - Team Weevup
guest_julie := gen_random_uuid();
INSERT INTO "Guest" (id, "eventId", "firstName", "lastName", email, category, token, "hashedToken", "tokenExpiresAt", "createdAt", "updatedAt")
VALUES (
  guest_julie, event_weevup_id, 'Julie', 'Martin', 'julie.martin@weevup.com', 'EQUIPE',
  'tok_' || substr(md5(random()::text), 1, 32),
  '$2a$10$' || substr(md5(random()::text), 1, 53),
  NOW() + INTERVAL '90 days',
  NOW(), NOW()
);

-- Marc Dubois - Team Weevup
guest_marc := gen_random_uuid();
INSERT INTO "Guest" (id, "eventId", "firstName", "lastName", email, category, token, "hashedToken", "tokenExpiresAt", "createdAt", "updatedAt")
VALUES (
  guest_marc, event_weevup_id, 'Marc', 'Dubois', 'marc.dubois@weevup.com', 'EQUIPE',
  'tok_' || substr(md5(random()::text), 1, 32),
  '$2a$10$' || substr(md5(random()::text), 1, 53),
  NOW() + INTERVAL '90 days',
  NOW(), NOW()
);

-- Isabelle Rousseau - Presse
guest_isabelle := gen_random_uuid();
INSERT INTO "Guest" (id, "eventId", "firstName", "lastName", email, category, token, "hashedToken", "tokenExpiresAt", "createdAt", "updatedAt")
VALUES (
  guest_isabelle, event_weevup_id, 'Isabelle', 'Rousseau', 'isabelle.rousseau@techjournal.fr', 'PRESSE',
  'tok_' || substr(md5(random()::text), 1, 32),
  '$2a$10$' || substr(md5(random()::text), 1, 53),
  NOW() + INTERVAL '90 days',
  NOW(), NOW()
);

-- François Garcia - Presse
guest_françois := gen_random_uuid();
INSERT INTO "Guest" (id, "eventId", "firstName", "lastName", email, category, token, "hashedToken", "tokenExpiresAt", "createdAt", "updatedAt")
VALUES (
  guest_françois, event_weevup_id, 'François', 'Garcia', 'francois.garcia@digitalmag.com', 'PRESSE',
  'tok_' || substr(md5(random()::text), 1, 32),
  '$2a$10$' || substr(md5(random()::text), 1, 53),
  NOW() + INTERVAL '90 days',
  NOW(), NOW()
);

-- Caroline Petit - VIP Cliente (refus)
guest_caroline := gen_random_uuid();
INSERT INTO "Guest" (id, "eventId", "firstName", "lastName", email, category, token, "hashedToken", "tokenExpiresAt", "createdAt", "updatedAt")
VALUES (
  guest_caroline, event_weevup_id, 'Caroline', 'Petit', 'caroline.petit@startup-lab.io', 'VIP',
  'tok_' || substr(md5(random()::text), 1, 32),
  '$2a$10$' || substr(md5(random()::text), 1, 53),
  NOW() + INTERVAL '90 days',
  NOW(), NOW()
);

-- Laurent Blanc - Partenaire (pas encore répondu)
guest_laurent := gen_random_uuid();
INSERT INTO "Guest" (id, "eventId", "firstName", "lastName", email, category, token, "hashedToken", "tokenExpiresAt", "createdAt", "updatedAt")
VALUES (
  guest_laurent, event_weevup_id, 'Laurent', 'Blanc', 'laurent.blanc@investment-fund.com', 'PARTENAIRE',
  'tok_' || substr(md5(random()::text), 1, 32),
  '$2a$10$' || substr(md5(random()::text), 1, 53),
  NOW() + INTERVAL '90 days',
  NOW(), NOW()
);

-- ========================================
-- 5. RSVPs ÉVÉNEMENT WEEVUP
-- ========================================

-- 7 confirmations, 1 refus, 2 en attente
INSERT INTO "RSVP" (id, "guestId", "eventId", attending, "plusOne", "dietaryRestrictions", message, "respondedAt", "createdAt", "updatedAt")
VALUES
  -- Confirmations
  (gen_random_uuid(), guest_marie, event_weevup_id, true, 0, 'Végétarienne', 'Ravie de participer !', NOW() - INTERVAL '10 days', NOW(), NOW()),
  (gen_random_uuid(), guest_thomas, event_weevup_id, true, 0, NULL, NULL, NOW() - INTERVAL '9 days', NOW(), NOW()),
  (gen_random_uuid(), guest_sophie, event_weevup_id, true, 1, NULL, 'Je viens avec mon conjoint', NOW() - INTERVAL '8 days', NOW(), NOW()),
  (gen_random_uuid(), guest_pierre, event_weevup_id, true, 0, NULL, NULL, NOW() - INTERVAL '7 days', NOW(), NOW()),
  (gen_random_uuid(), guest_julie, event_weevup_id, true, 0, 'Sans gluten', NULL, NOW() - INTERVAL '12 days', NOW(), NOW()),
  (gen_random_uuid(), guest_marc, event_weevup_id, true, 0, NULL, NULL, NOW() - INTERVAL '11 days', NOW(), NOW()),
  (gen_random_uuid(), guest_isabelle, event_weevup_id, true, 0, NULL, 'Super événement !', NOW() - INTERVAL '6 days', NOW(), NOW()),
  -- Refus
  (gen_random_uuid(), guest_caroline, event_weevup_id, false, 0, NULL, 'Désolée, je serai en déplacement', NOW() - INTERVAL '5 days', NOW(), NOW());
  -- François et Laurent n'ont pas encore répondu

-- ========================================
-- 6. CHECK-INS ÉVÉNEMENT WEEVUP
-- ========================================

-- 5 personnes déjà arrivées (différentes méthodes)
INSERT INTO "CheckIn" (id, "guestId", "eventId", method, "checkedInAt", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), guest_marie, event_weevup_id, 'QR_CODE', NOW() - INTERVAL '2 hours', NOW(), NOW()),
  (gen_random_uuid(), guest_thomas, event_weevup_id, 'QR_CODE', NOW() - INTERVAL '1 hour 50 minutes', NOW(), NOW()),
  (gen_random_uuid(), guest_sophie, event_weevup_id, 'MANUAL', NOW() - INTERVAL '1 hour 45 minutes', NOW(), NOW()),
  (gen_random_uuid(), guest_julie, event_weevup_id, 'QR_CODE', NOW() - INTERVAL '2 hours 30 minutes', NOW(), NOW()),
  (gen_random_uuid(), guest_marc, event_weevup_id, 'AUTO', NOW() - INTERVAL '2 hours 15 minutes', NOW(), NOW());

-- ========================================
-- 7. MODULE TRANSPORT - 10 ANS WEEVUP
-- ========================================

-- Activer le module Transport
INSERT INTO "EventModule" (id, "eventId", "moduleType", "isActive", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), event_weevup_id, 'TRANSPORT', true, NOW(), NOW());

-- 4 Réservations individuelles de transport
INSERT INTO "TransportBooking" (
  id, "eventId", "guestId", type, status,
  departure, arrival,
  carrier, "bookingRef", "seatNumber",
  "estimatedCost", "actualCost", "currency", "isPaidByCompany",
  notes, "internalNotes",
  "createdAt", "updatedAt"
) VALUES
  -- Marie - Vol Lyon → Paris
  (
    gen_random_uuid(), event_weevup_id, guest_marie, 'FLIGHT', 'BOOKED',
    '{"city": "Lyon", "airport": "LYS", "date": "2025-06-20", "time": "15:30"}'::jsonb,
    '{"city": "Paris", "airport": "CDG", "date": "2025-06-20", "time": "16:45"}'::jsonb,
    'Air France', 'AF7823', '12A',
    180.00, 175.00, 'EUR', true,
    NULL, 'VIP - Priorité à l''embarquement',
    NOW(), NOW()
  ),
  -- Thomas - Train Marseille → Paris
  (
    gen_random_uuid(), event_weevup_id, guest_thomas, 'TRAIN', 'CONFIRMED',
    '{"city": "Marseille", "station": "Gare Saint-Charles", "date": "2025-06-20", "time": "13:15"}'::jsonb,
    '{"city": "Paris", "station": "Gare de Lyon", "date": "2025-06-20", "time": "16:30"}'::jsonb,
    'SNCF TGV', 'TGV9462', '42',
    120.00, 115.00, 'EUR', true,
    NULL, NULL,
    NOW(), NOW()
  ),
  -- Sophie - Train Bordeaux → Paris
  (
    gen_random_uuid(), event_weevup_id, guest_sophie, 'TRAIN', 'BOOKED',
    '{"city": "Bordeaux", "station": "Gare Saint-Jean", "date": "2025-06-20", "time": "12:00"}'::jsonb,
    '{"city": "Paris", "station": "Gare Montparnasse", "date": "2025-06-20", "time": "15:05"}'::jsonb,
    'SNCF TGV', 'TGV7721', '15',
    145.00, 140.00, 'EUR', true,
    'Préférence siège couloir', NULL,
    NOW(), NOW()
  ),
  -- Pierre - Voiture personnelle
  (
    gen_random_uuid(), event_weevup_id, guest_pierre, 'PERSONAL_CAR', 'CONFIRMED',
    '{"city": "Versailles", "address": "12 Rue de la Paroisse", "date": "2025-06-20", "time": "17:30"}'::jsonb,
    '{"address": "148 Avenue des Champs-Élysées", "city": "Paris", "date": "2025-06-20", "time": "18:15"}'::jsonb,
    NULL, NULL, NULL,
    NULL, NULL, 'EUR', false,
    'Arrivée en Tesla Model S', 'Prévoir place parking VIP',
    NOW(), NOW()
  );

-- Manifest: Navette CDG → Pavillon Royal
manifest_cdg := gen_random_uuid();
INSERT INTO "TransportManifest" (
  id, "eventId", type, name, description,
  departure, arrival,
  "maxCapacity", "currentCount",
  "costPerPerson", currency, status,
  "meetingPoint", "contactName", "contactPhone",
  notes, "internalNotes",
  "createdAt", "updatedAt"
) VALUES (
  manifest_cdg, event_weevup_id, 'SHUTTLE',
  'Navette Aéroport CDG → Pavillon Royal',
  'Navette groupée depuis l''aéroport Charles de Gaulle pour les invités arrivant en avion',
  '{"city": "Roissy-en-France", "address": "Terminal 2E - Porte 8", "date": "2025-06-20", "time": "17:00"}'::jsonb,
  '{"city": "Paris", "address": "148 Avenue des Champs-Élysées", "date": "2025-06-20", "time": "18:00"}'::jsonb,
  20, 0,
  0.00, 'EUR', 'OPEN',
  'Sortie Terminal 2E - Porte 8, chercher panneau "Weevup"',
  'Service Navette Weevup', '+33 1 23 45 67 89',
  'Bus premium climatisé avec wifi',
  'Chauffeur: Jean-Pierre (GSM: 06 12 34 56 78)',
  NOW(), NOW()
);

-- 3 participants dans la navette CDG
INSERT INTO "ManifestParticipant" (id, "manifestId", "guestId", "seatNumber", notes, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), manifest_cdg, guest_marc, '1', NULL, NOW(), NOW()),
  (gen_random_uuid(), manifest_cdg, guest_isabelle, '2', NULL, NOW(), NOW()),
  (gen_random_uuid(), manifest_cdg, guest_françois, '3', NULL, NOW(), NOW());

-- Mettre à jour le compteur de la navette
UPDATE "TransportManifest" SET "currentCount" = 3 WHERE id = manifest_cdg;

-- ========================================
-- 8. ÉVÉNEMENT 2 : "Tech Summit 2025"
-- ========================================

event_summit_id := gen_random_uuid();

INSERT INTO "Event" (
  id, name, slug, description, "startsAt", "endsAt",
  "venueName", address, city, "postalCode", country,
  "maxGuests", "rsvpDeadline", "userId",
  "showcaseEnabled", "showcasePrimaryColor", "showcaseSecondaryColor",
  "showcaseBannerImage", "showcaseSections",
  "createdAt", "updatedAt"
) VALUES (
  event_summit_id,
  'Tech Summit 2025',
  'tech-summit-2025',
  'Le plus grand sommet technologique de l''année réunissant les leaders de l''IA, blockchain et cloud',
  '2025-09-15 09:00:00',
  '2025-09-16 18:00:00',
  'Paris Convention Center',
  '2 Place de la Porte de Versailles',
  'Paris',
  '75015',
  'France',
  500,
  '2025-09-01',
  admin_user_id,
  true,
  '#004645',
  '#009197',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
  '["hero", "description", "speakers", "schedule", "sponsors", "cta"]'::jsonb,
  NOW(),
  NOW()
);

-- ========================================
-- 9. INVITÉS ÉVÉNEMENT TECH SUMMIT (10 invités)
-- ========================================

-- Yann LeCun - VIP Speaker
guest_yann := gen_random_uuid();
INSERT INTO "Guest" (id, "eventId", "firstName", "lastName", email, category, token, "hashedToken", "tokenExpiresAt", "createdAt", "updatedAt")
VALUES (
  guest_yann, event_summit_id, 'Yann', 'LeCun', 'yann.lecun@nyu.edu', 'SPEAKER',
  'tok_' || substr(md5(random()::text), 1, 32),
  '$2a$10$' || substr(md5(random()::text), 1, 53),
  NOW() + INTERVAL '90 days',
  NOW(), NOW()
);

-- Vitalik Buterin - VIP Speaker
guest_vitalik := gen_random_uuid();
INSERT INTO "Guest" (id, "eventId", "firstName", "lastName", email, category, token, "hashedToken", "tokenExpiresAt", "createdAt", "updatedAt")
VALUES (
  guest_vitalik, event_summit_id, 'Vitalik', 'Buterin', 'vitalik@ethereum.org', 'SPEAKER',
  'tok_' || substr(md5(random()::text), 1, 32),
  '$2a$10$' || substr(md5(random()::text), 1, 53),
  NOW() + INTERVAL '90 days',
  NOW(), NOW()
);

-- Cassie Kozyrkov - VIP Speaker
guest_cassie := gen_random_uuid();
INSERT INTO "Guest" (id, "eventId", "firstName", "lastName", email, category, token, "hashedToken", "tokenExpiresAt", "createdAt", "updatedAt")
VALUES (
  guest_cassie, event_summit_id, 'Cassie', 'Kozyrkov', 'cassie@google.com', 'SPEAKER',
  'tok_' || substr(md5(random()::text), 1, 32),
  '$2a$10$' || substr(md5(random()::text), 1, 53),
  NOW() + INTERVAL '90 days',
  NOW(), NOW()
);

-- Julie Fontaine - Participante
guest_julie_f := gen_random_uuid();
INSERT INTO "Guest" (id, "eventId", "firstName", "lastName", email, category, token, "hashedToken", "tokenExpiresAt", "createdAt", "updatedAt")
VALUES (
  guest_julie_f, event_summit_id, 'Julie', 'Fontaine', 'julie.fontaine@techcorp.fr', 'PARTICIPANT',
  'tok_' || substr(md5(random()::text), 1, 32),
  '$2a$10$' || substr(md5(random()::text), 1, 53),
  NOW() + INTERVAL '90 days',
  NOW(), NOW()
);

-- Marc Durand - Participant
guest_marc_d := gen_random_uuid();
INSERT INTO "Guest" (id, "eventId", "firstName", "lastName", email, category, token, "hashedToken", "tokenExpiresAt", "createdAt", "updatedAt")
VALUES (
  guest_marc_d, event_summit_id, 'Marc', 'Durand', 'marc.durand@startup.io', 'PARTICIPANT',
  'tok_' || substr(md5(random()::text), 1, 32),
  '$2a$10$' || substr(md5(random()::text), 1, 53),
  NOW() + INTERVAL '90 days',
  NOW(), NOW()
);

-- Sarah Chen - VIP Participante
guest_sarah := gen_random_uuid();
INSERT INTO "Guest" (id, "eventId", "firstName", "lastName", email, category, token, "hashedToken", "tokenExpiresAt", "createdAt", "updatedAt")
VALUES (
  guest_sarah, event_summit_id, 'Sarah', 'Chen', 'sarah.chen@venture.capital', 'VIP',
  'tok_' || substr(md5(random()::text), 1, 32),
  '$2a$10$' || substr(md5(random()::text), 1, 53),
  NOW() + INTERVAL '90 days',
  NOW(), NOW()
);

-- David Lopez - Partenaire sponsor
guest_david := gen_random_uuid();
INSERT INTO "Guest" (id, "eventId", "firstName", "lastName", email, category, token, "hashedToken", "tokenExpiresAt", "createdAt", "updatedAt")
VALUES (
  guest_david, event_summit_id, 'David', 'Lopez', 'david.lopez@sponsor-corp.com', 'PARTENAIRE',
  'tok_' || substr(md5(random()::text), 1, 32),
  '$2a$10$' || substr(md5(random()::text), 1, 53),
  NOW() + INTERVAL '90 days',
  NOW(), NOW()
);

-- Emma Wilson - Presse
guest_emma := gen_random_uuid();
INSERT INTO "Guest" (id, "eventId", "firstName", "lastName", email, category, token, "hashedToken", "tokenExpiresAt", "createdAt", "updatedAt")
VALUES (
  guest_emma, event_summit_id, 'Emma', 'Wilson', 'emma.wilson@technews.com', 'PRESSE',
  'tok_' || substr(md5(random()::text), 1, 32),
  '$2a$10$' || substr(md5(random()::text), 1, 53),
  NOW() + INTERVAL '90 days',
  NOW(), NOW()
);

-- Lucas Martin - Presse
guest_lucas := gen_random_uuid();
INSERT INTO "Guest" (id, "eventId", "firstName", "lastName", email, category, token, "hashedToken", "tokenExpiresAt", "createdAt", "updatedAt")
VALUES (
  guest_lucas, event_summit_id, 'Lucas', 'Martin', 'lucas.martin@innovation-mag.fr', 'PRESSE',
  'tok_' || substr(md5(random()::text), 1, 32),
  '$2a$10$' || substr(md5(random()::text), 1, 53),
  NOW() + INTERVAL '90 days',
  NOW(), NOW()
);

-- Alice Bernard - Participante (refus)
guest_alice := gen_random_uuid();
INSERT INTO "Guest" (id, "eventId", "firstName", "lastName", email, category, token, "hashedToken", "tokenExpiresAt", "createdAt", "updatedAt")
VALUES (
  guest_alice, event_summit_id, 'Alice', 'Bernard', 'alice.bernard@company.com', 'PARTICIPANT',
  'tok_' || substr(md5(random()::text), 1, 32),
  '$2a$10$' || substr(md5(random()::text), 1, 53),
  NOW() + INTERVAL '90 days',
  NOW(), NOW()
);

-- ========================================
-- 10. RSVPs ÉVÉNEMENT TECH SUMMIT
-- ========================================

INSERT INTO "RSVP" (id, "guestId", "eventId", attending, "plusOne", "dietaryRestrictions", message, "respondedAt", "createdAt", "updatedAt")
VALUES
  -- Confirmations
  (gen_random_uuid(), guest_yann, event_summit_id, true, 0, NULL, 'Looking forward to the keynote!', NOW() - INTERVAL '15 days', NOW(), NOW()),
  (gen_random_uuid(), guest_vitalik, event_summit_id, true, 0, 'Vegan', NULL, NOW() - INTERVAL '14 days', NOW(), NOW()),
  (gen_random_uuid(), guest_cassie, event_summit_id, true, 0, NULL, 'Excited to speak about AI!', NOW() - INTERVAL '13 days', NOW(), NOW()),
  (gen_random_uuid(), guest_julie_f, event_summit_id, true, 1, NULL, 'Je viens avec un collègue', NOW() - INTERVAL '10 days', NOW(), NOW()),
  (gen_random_uuid(), guest_marc_d, event_summit_id, true, 0, NULL, NULL, NOW() - INTERVAL '8 days', NOW(), NOW()),
  (gen_random_uuid(), guest_sarah, event_summit_id, true, 0, 'Sans lactose', 'Hâte de networker !', NOW() - INTERVAL '12 days', NOW(), NOW()),
  (gen_random_uuid(), guest_david, event_summit_id, true, 2, NULL, 'Avec 2 membres de notre équipe', NOW() - INTERVAL '11 days', NOW(), NOW()),
  (gen_random_uuid(), guest_emma, event_summit_id, true, 0, NULL, 'Pour couverture presse', NOW() - INTERVAL '7 days', NOW(), NOW()),
  -- Refus
  (gen_random_uuid(), guest_alice, event_summit_id, false, 0, NULL, 'Conflit d''agenda malheureusement', NOW() - INTERVAL '9 days', NOW(), NOW());
  -- Lucas n'a pas encore répondu

-- ========================================
-- 11. CHECK-INS ÉVÉNEMENT TECH SUMMIT
-- ========================================

-- 3 speakers déjà arrivés
INSERT INTO "CheckIn" (id, "guestId", "eventId", method, "checkedInAt", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), guest_yann, event_summit_id, 'QR_CODE', NOW() - INTERVAL '30 minutes', NOW(), NOW()),
  (gen_random_uuid(), guest_vitalik, event_summit_id, 'MANUAL', NOW() - INTERVAL '25 minutes', NOW(), NOW()),
  (gen_random_uuid(), guest_sarah, event_summit_id, 'QR_CODE', NOW() - INTERVAL '20 minutes', NOW(), NOW());

-- ========================================
-- 12. MODULE TRANSPORT - TECH SUMMIT
-- ========================================

-- Activer le module Transport
INSERT INTO "EventModule" (id, "eventId", "moduleType", "isActive", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), event_summit_id, 'TRANSPORT', true, NOW(), NOW());

-- 5 Réservations VIP individuelles
INSERT INTO "TransportBooking" (
  id, "eventId", "guestId", type, status,
  departure, arrival,
  carrier, "bookingRef", "seatNumber",
  "estimatedCost", "actualCost", "currency", "isPaidByCompany",
  notes, "internalNotes",
  "createdAt", "updatedAt"
) VALUES
  -- Yann - Vol international NYC → Paris
  (
    gen_random_uuid(), event_summit_id, guest_yann, 'FLIGHT', 'BOOKED',
    '{"city": "New York", "airport": "JFK", "date": "2025-09-14", "time": "18:00"}'::jsonb,
    '{"city": "Paris", "airport": "CDG", "date": "2025-09-15", "time": "07:30"}'::jsonb,
    'Air France', 'AF007', '2A',
    4500.00, 4200.00, 'EUR', true,
    NULL, 'VIP Speaker - Business Class confirmée',
    NOW(), NOW()
  ),
  -- Vitalik - Vol Singapore → Paris
  (
    gen_random_uuid(), event_summit_id, guest_vitalik, 'FLIGHT', 'CONFIRMED',
    '{"city": "Singapore", "airport": "SIN", "date": "2025-09-14", "time": "01:00"}'::jsonb,
    '{"city": "Paris", "airport": "CDG", "date": "2025-09-14", "time": "08:45"}'::jsonb,
    'Singapore Airlines', 'SQ334', '1A',
    5500.00, 5200.00, 'EUR', true,
    NULL, 'VIP Speaker - Suite réservée',
    NOW(), NOW()
  ),
  -- Cassie - Vol SF → Paris
  (
    gen_random_uuid(), event_summit_id, guest_cassie, 'FLIGHT', 'BOOKED',
    '{"city": "San Francisco", "airport": "SFO", "date": "2025-09-14", "time": "12:00"}'::jsonb,
    '{"city": "Paris", "airport": "CDG", "date": "2025-09-15", "time": "07:00"}'::jsonb,
    'United Airlines', 'UA990', '3K',
    3800.00, 3600.00, 'EUR', true,
    NULL, NULL,
    NOW(), NOW()
  ),
  -- Julie - Train Lille → Paris
  (
    gen_random_uuid(), event_summit_id, guest_julie_f, 'TRAIN', 'BOOKED',
    '{"city": "Lille", "station": "Lille Europe", "date": "2025-09-15", "time": "06:30"}'::jsonb,
    '{"city": "Paris", "station": "Gare du Nord", "date": "2025-09-15", "time": "07:30"}'::jsonb,
    'SNCF TGV', 'TGV5512', '28',
    45.00, 42.00, 'EUR', true,
    NULL, NULL,
    NOW(), NOW()
  ),
  -- Marc - Taxi
  (
    gen_random_uuid(), event_summit_id, guest_marc_d, 'TAXI', 'REQUESTED',
    '{"city": "Paris", "address": "Hôtel Hilton Opera", "date": "2025-09-15", "time": "08:00"}'::jsonb,
    '{"city": "Paris", "address": "2 Place de la Porte de Versailles", "date": "2025-09-15", "time": "08:30"}'::jsonb,
    NULL, NULL, NULL,
    35.00, NULL, 'EUR', false,
    'Réserver via G7', NULL,
    NOW(), NOW()
  );

-- 3 Manifests de navettes pour le summit
-- Navette Matin J1 : Hôtels → Convention Center
manifest_morning1 := gen_random_uuid();
INSERT INTO "TransportManifest" (
  id, "eventId", type, name, description,
  departure, arrival,
  "maxCapacity", "currentCount",
  "costPerPerson", currency, status,
  "meetingPoint", "contactName", "contactPhone",
  notes, "internalNotes",
  "createdAt", "updatedAt"
) VALUES (
  manifest_morning1, event_summit_id, 'SHUTTLE',
  'Navette Hôtels → Convention Center (Matin J1)',
  'Circuit des hôtels partenaires vers le centre de conférences',
  '{"city": "Paris", "address": "Hôtel Marriott Rive Gauche", "date": "2025-09-15", "time": "08:00"}'::jsonb,
  '{"city": "Paris", "address": "2 Place de la Porte de Versailles", "date": "2025-09-15", "time": "08:45"}'::jsonb,
  50, 0,
  0.00, 'EUR', 'OPEN',
  'Devant l''entrée principale de chaque hôtel',
  'Transport Summit', '+33 1 45 67 89 00',
  'Circuit: Marriott → Hilton Opera → Novotel Tour Eiffel → Convention Center',
  'Bus 1 - Chauffeur: Michel',
  NOW(), NOW()
);

-- Navette Soir J1 : Convention Center → Hôtels
manifest_evening1 := gen_random_uuid();
INSERT INTO "TransportManifest" (
  id, "eventId", type, name, description,
  departure, arrival,
  "maxCapacity", "currentCount",
  "costPerPerson", currency, status,
  "meetingPoint", "contactName", "contactPhone",
  notes, "internalNotes",
  "createdAt", "updatedAt"
) VALUES (
  manifest_evening1, event_summit_id, 'SHUTTLE',
  'Navette Convention Center → Hôtels (Soir J1)',
  'Retour vers les hôtels en fin de première journée',
  '{"city": "Paris", "address": "2 Place de la Porte de Versailles", "date": "2025-09-15", "time": "18:30"}'::jsonb,
  '{"city": "Paris", "address": "Hôtel Marriott Rive Gauche", "date": "2025-09-15", "time": "19:15"}'::jsonb,
  50, 0,
  0.00, 'EUR', 'OPEN',
  'Sortie principale du Convention Center',
  'Transport Summit', '+33 1 45 67 89 00',
  'Circuit retour dans le même ordre',
  'Bus 1 - Chauffeur: Michel',
  NOW(), NOW()
);

-- Navette VIP Aéroport J2
manifest_airport := gen_random_uuid();
INSERT INTO "TransportManifest" (
  id, "eventId", type, name, description,
  departure, arrival,
  "maxCapacity", "currentCount",
  "costPerPerson", currency, status,
  "meetingPoint", "contactName", "contactPhone",
  notes, "internalNotes",
  "createdAt", "updatedAt"
) VALUES (
  manifest_airport, event_summit_id, 'SHUTTLE',
  'Navette VIP Convention Center → CDG',
  'Navette VIP pour les speakers internationaux vers l''aéroport',
  '{"city": "Paris", "address": "2 Place de la Porte de Versailles", "date": "2025-09-16", "time": "19:00"}'::jsonb,
  '{"city": "Roissy-en-France", "airport": "CDG", "date": "2025-09-16", "time": "20:00"}'::jsonb,
  30, 0,
  25.00, 'EUR', 'CONFIRMED',
  'Sortie VIP du Convention Center',
  'VIP Transport', '+33 1 40 50 60 70',
  'Van Mercedes premium avec wifi et rafraîchissements',
  'Service VIP - Chauffeur: Alexandre (bilingue EN/FR)',
  NOW(), NOW()
);

-- Participants navettes
-- 3 dans navette matin
INSERT INTO "ManifestParticipant" (id, "manifestId", "guestId", "seatNumber", notes, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), manifest_morning1, guest_julie_f, '12', NULL, NOW(), NOW()),
  (gen_random_uuid(), manifest_morning1, guest_david, '13', 'Avec équipe', NOW(), NOW()),
  (gen_random_uuid(), manifest_morning1, guest_emma, '14', NULL, NOW(), NOW());

-- 3 VIP speakers dans navette aéroport
INSERT INTO "ManifestParticipant" (id, "manifestId", "guestId", "seatNumber", notes, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), manifest_airport, guest_yann, '1', 'VIP - Vol AF008 20h30', NOW(), NOW()),
  (gen_random_uuid(), manifest_airport, guest_vitalik, '2', 'VIP - Vol SQ335 21h00', NOW(), NOW()),
  (gen_random_uuid(), manifest_airport, guest_cassie, '3', 'VIP - Vol UA991 21h30', NOW(), NOW());

-- Mettre à jour les compteurs
UPDATE "TransportManifest" SET "currentCount" = 3 WHERE id = manifest_morning1;
UPDATE "TransportManifest" SET "currentCount" = 3 WHERE id = manifest_airport;

END $$;

-- ========================================
-- 13. INTÉGRATIONS EMAIL
-- ========================================

-- IMPORTANT: Remplacez 'YOUR_ENCRYPTED_KEY' par vos vraies clés API encryptées
-- Pour l'instant on utilise des placeholders

-- Resend (Principal)
INSERT INTO "EmailIntegration" (
  id, provider, "apiKey", "fromEmail", "fromName", "replyTo",
  "trackOpens", "trackClicks", "isPrimary", "isActive",
  "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'RESEND',
  'YOUR_ENCRYPTED_RESEND_KEY', -- À remplacer par votre clé Resend encryptée
  'noreply@weevup.com',
  'Weevup Events',
  'contact@weevup.com',
  true, true, true, true,
  NOW(), NOW()
);

-- SendGrid (Backup)
INSERT INTO "EmailIntegration" (
  id, provider, "apiKey", "fromEmail", "fromName", "replyTo",
  "trackOpens", "trackClicks", "isPrimary", "isActive",
  "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'SENDGRID',
  'YOUR_ENCRYPTED_SENDGRID_KEY', -- À remplacer par votre clé SendGrid encryptée
  'noreply@weevup.com',
  'Weevup Events',
  'contact@weevup.com',
  true, true, false, true,
  NOW(), NOW()
);

-- ========================================
-- FIN DU SCRIPT
-- ========================================

COMMIT;

-- Afficher un résumé
SELECT
  'Seed terminé avec succès !' as message,
  (SELECT COUNT(*) FROM "User") as users,
  (SELECT COUNT(*) FROM "Event") as events,
  (SELECT COUNT(*) FROM "Guest") as guests,
  (SELECT COUNT(*) FROM "RSVP") as rsvps,
  (SELECT COUNT(*) FROM "CheckIn") as checkins,
  (SELECT COUNT(*) FROM "TransportBooking") as transport_bookings,
  (SELECT COUNT(*) FROM "TransportManifest") as transport_manifests,
  (SELECT COUNT(*) FROM "ManifestParticipant") as manifest_participants,
  (SELECT COUNT(*) FROM "EmailIntegration") as email_integrations;
