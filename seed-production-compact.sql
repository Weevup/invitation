-- ========================================
-- SCRIPT DE SEED PRODUCTION - VERSION COMPACTE
-- 2 événements avec toutes les fonctionnalités
-- ========================================

BEGIN;

-- Nettoyage (garde les Users et EmailIntegration)
DELETE FROM "ManifestParticipant";
DELETE FROM "TransportManifest";
DELETE FROM "TransportBooking";
DELETE FROM "EventModule";
DELETE FROM "EmailTracking";
DELETE FROM "CheckIn";
DELETE FROM "RSVP";
DELETE FROM "Guest";
DELETE FROM "Event";

-- Créer admin si n'existe pas
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'contact@weevup.com', '$2a$10$rOz3qKvBL8K5rE9yGxGZxOZB.d9mO7qxCZGQXZ5bXqKVvHxPwXY5C', 'Admin Weevup', 'ADMIN', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "User" WHERE email = 'contact@weevup.com');

-- Variables
DO $$
DECLARE
  admin_id UUID := (SELECT id FROM "User" WHERE email = 'contact@weevup.com' OR role = 'ADMIN' LIMIT 1);
  event1_id UUID := gen_random_uuid();
  event2_id UUID := gen_random_uuid();
  guest_ids UUID[] := ARRAY[gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid()];
  guest2_ids UUID[] := ARRAY[gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid()];
  manifest1_id UUID := gen_random_uuid();
  manifest2_id UUID := gen_random_uuid();
  manifest3_id UUID := gen_random_uuid();
  manifest4_id UUID := gen_random_uuid();
BEGIN

-- ========================================
-- ÉVÉNEMENT 1: 10 Ans Weevup
-- ========================================
INSERT INTO "Event" (id, name, slug, description, "startsAt", "endsAt", "venueName", address, city, "postalCode", country, "maxGuests", "rsvpDeadline", "userId", "showcaseEnabled", "showcasePrimaryColor", "showcaseSecondaryColor", "createdAt", "updatedAt")
VALUES (event1_id, '10 Ans Weevup', '10-ans-weevup', 'Célébration des 10 ans de Weevup', '2025-06-20 19:00:00', '2025-06-21 02:00:00', 'Pavillon Royal', '148 Avenue des Champs-Élysées', 'Paris', '75008', 'France', 100, '2025-06-15', admin_id, true, '#004645', '#FF4713', NOW(), NOW());

-- 10 Invités Event 1
INSERT INTO "Guest" (id, "eventId", "firstName", "lastName", email, category, token, "hashedToken", "tokenExpiresAt", "createdAt", "updatedAt") VALUES
(guest_ids[1], event1_id, 'Marie', 'Dupont', 'marie.dupont@tech.fr', 'VIP', 'tok_'||substr(md5(random()::text), 1, 32), '$2a$10$'||substr(md5(random()::text), 1, 53), NOW() + INTERVAL '90 days', NOW(), NOW()),
(guest_ids[2], event1_id, 'Thomas', 'Bernard', 'thomas.bernard@innov.com', 'CLIENT', 'tok_'||substr(md5(random()::text), 1, 32), '$2a$10$'||substr(md5(random()::text), 1, 53), NOW() + INTERVAL '90 days', NOW(), NOW()),
(guest_ids[3], event1_id, 'Sophie', 'Leroy', 'sophie.leroy@digital.fr', 'VIP', 'tok_'||substr(md5(random()::text), 1, 32), '$2a$10$'||substr(md5(random()::text), 1, 53), NOW() + INTERVAL '90 days', NOW(), NOW()),
(guest_ids[4], event1_id, 'Pierre', 'Moreau', 'pierre.moreau@consulting.com', 'PARTENAIRE', 'tok_'||substr(md5(random()::text), 1, 32), '$2a$10$'||substr(md5(random()::text), 1, 53), NOW() + INTERVAL '90 days', NOW(), NOW()),
(guest_ids[5], event1_id, 'Julie', 'Martin', 'julie.martin@weevup.com', 'EQUIPE', 'tok_'||substr(md5(random()::text), 1, 32), '$2a$10$'||substr(md5(random()::text), 1, 53), NOW() + INTERVAL '90 days', NOW(), NOW()),
(guest_ids[6], event1_id, 'Marc', 'Dubois', 'marc.dubois@weevup.com', 'EQUIPE', 'tok_'||substr(md5(random()::text), 1, 32), '$2a$10$'||substr(md5(random()::text), 1, 53), NOW() + INTERVAL '90 days', NOW(), NOW()),
(guest_ids[7], event1_id, 'Isabelle', 'Rousseau', 'isabelle.rousseau@techjournal.fr', 'PRESSE', 'tok_'||substr(md5(random()::text), 1, 32), '$2a$10$'||substr(md5(random()::text), 1, 53), NOW() + INTERVAL '90 days', NOW(), NOW()),
(guest_ids[8], event1_id, 'François', 'Garcia', 'francois.garcia@digitalmag.com', 'PRESSE', 'tok_'||substr(md5(random()::text), 1, 32), '$2a$10$'||substr(md5(random()::text), 1, 53), NOW() + INTERVAL '90 days', NOW(), NOW()),
(guest_ids[9], event1_id, 'Caroline', 'Petit', 'caroline.petit@startup.io', 'VIP', 'tok_'||substr(md5(random()::text), 1, 32), '$2a$10$'||substr(md5(random()::text), 1, 53), NOW() + INTERVAL '90 days', NOW(), NOW()),
(guest_ids[10], event1_id, 'Laurent', 'Blanc', 'laurent.blanc@fund.com', 'PARTENAIRE', 'tok_'||substr(md5(random()::text), 1, 32), '$2a$10$'||substr(md5(random()::text), 1, 53), NOW() + INTERVAL '90 days', NOW(), NOW());

-- RSVPs Event 1 (7 oui, 1 non, 2 pending)
INSERT INTO "RSVP" (id, "guestId", "eventId", attending, "plusOne", "dietaryRestrictions", message, "respondedAt", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), guest_ids[1], event1_id, true, 0, 'Végétarienne', 'Ravie !', NOW() - INTERVAL '10 days', NOW(), NOW()),
(gen_random_uuid(), guest_ids[2], event1_id, true, 0, NULL, NULL, NOW() - INTERVAL '9 days', NOW(), NOW()),
(gen_random_uuid(), guest_ids[3], event1_id, true, 1, NULL, 'Avec +1', NOW() - INTERVAL '8 days', NOW(), NOW()),
(gen_random_uuid(), guest_ids[4], event1_id, true, 0, NULL, NULL, NOW() - INTERVAL '7 days', NOW(), NOW()),
(gen_random_uuid(), guest_ids[5], event1_id, true, 0, 'Sans gluten', NULL, NOW() - INTERVAL '12 days', NOW(), NOW()),
(gen_random_uuid(), guest_ids[6], event1_id, true, 0, NULL, NULL, NOW() - INTERVAL '11 days', NOW(), NOW()),
(gen_random_uuid(), guest_ids[7], event1_id, true, 0, NULL, 'Super !', NOW() - INTERVAL '6 days', NOW(), NOW()),
(gen_random_uuid(), guest_ids[9], event1_id, false, 0, NULL, 'Désolée', NOW() - INTERVAL '5 days', NOW(), NOW());

-- Check-ins Event 1
INSERT INTO "CheckIn" (id, "guestId", "eventId", method, "checkedInAt", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), guest_ids[1], event1_id, 'QR_CODE', NOW() - INTERVAL '2 hours', NOW(), NOW()),
(gen_random_uuid(), guest_ids[2], event1_id, 'QR_CODE', NOW() - INTERVAL '1 hour 50 min', NOW(), NOW()),
(gen_random_uuid(), guest_ids[3], event1_id, 'MANUAL', NOW() - INTERVAL '1 hour 45 min', NOW(), NOW()),
(gen_random_uuid(), guest_ids[5], event1_id, 'QR_CODE', NOW() - INTERVAL '2 hours 30 min', NOW(), NOW()),
(gen_random_uuid(), guest_ids[6], event1_id, 'AUTO', NOW() - INTERVAL '2 hours 15 min', NOW(), NOW());

-- Module Transport Event 1
INSERT INTO "EventModule" (id, "eventId", "moduleType", "isActive", "createdAt", "updatedAt") VALUES (gen_random_uuid(), event1_id, 'TRANSPORT', true, NOW(), NOW());

-- Transport bookings Event 1
INSERT INTO "TransportBooking" (id, "eventId", "guestId", type, status, departure, arrival, carrier, "bookingRef", "seatNumber", "estimatedCost", "actualCost", currency, "isPaidByCompany", notes, "createdAt", "updatedAt") VALUES
(gen_random_uuid(), event1_id, guest_ids[1], 'FLIGHT', 'BOOKED', '{"city":"Lyon","airport":"LYS","date":"2025-06-20","time":"15:30"}'::jsonb, '{"city":"Paris","airport":"CDG","date":"2025-06-20","time":"16:45"}'::jsonb, 'Air France', 'AF7823', '12A', 180, 175, 'EUR', true, 'VIP', NOW(), NOW()),
(gen_random_uuid(), event1_id, guest_ids[2], 'TRAIN', 'CONFIRMED', '{"city":"Marseille","station":"Gare Saint-Charles","date":"2025-06-20","time":"13:15"}'::jsonb, '{"city":"Paris","station":"Gare de Lyon","date":"2025-06-20","time":"16:30"}'::jsonb, 'SNCF TGV', 'TGV9462', '42', 120, 115, 'EUR', true, NULL, NOW(), NOW()),
(gen_random_uuid(), event1_id, guest_ids[3], 'TRAIN', 'BOOKED', '{"city":"Bordeaux","station":"Gare Saint-Jean","date":"2025-06-20","time":"12:00"}'::jsonb, '{"city":"Paris","station":"Gare Montparnasse","date":"2025-06-20","time":"15:05"}'::jsonb, 'SNCF TGV', 'TGV7721', '15', 145, 140, 'EUR', true, NULL, NOW(), NOW()),
(gen_random_uuid(), event1_id, guest_ids[4], 'PERSONAL_CAR', 'CONFIRMED', '{"city":"Versailles","address":"12 Rue de la Paroisse","date":"2025-06-20","time":"17:30"}'::jsonb, '{"address":"148 Avenue des Champs-Élysées","city":"Paris","date":"2025-06-20","time":"18:15"}'::jsonb, NULL, NULL, NULL, NULL, NULL, 'EUR', false, 'Tesla Model S', NOW(), NOW());

-- Manifest Event 1
INSERT INTO "TransportManifest" (id, "eventId", type, name, description, departure, arrival, "maxCapacity", "currentCount", "costPerPerson", currency, status, "meetingPoint", "contactName", "contactPhone", "createdAt", "updatedAt") VALUES
(manifest1_id, event1_id, 'SHUTTLE', 'Navette CDG → Pavillon Royal', 'Navette aéroport', '{"city":"Roissy","address":"Terminal 2E","date":"2025-06-20","time":"17:00"}'::jsonb, '{"city":"Paris","address":"148 Av Champs-Élysées","date":"2025-06-20","time":"18:00"}'::jsonb, 20, 3, 0, 'EUR', 'OPEN', 'Terminal 2E Porte 8', 'Navette Weevup', '+33123456789', NOW(), NOW());

INSERT INTO "ManifestParticipant" (id, "manifestId", "guestId", "seatNumber", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), manifest1_id, guest_ids[6], '1', NOW(), NOW()),
(gen_random_uuid(), manifest1_id, guest_ids[7], '2', NOW(), NOW()),
(gen_random_uuid(), manifest1_id, guest_ids[8], '3', NOW(), NOW());

-- ========================================
-- ÉVÉNEMENT 2: Tech Summit 2025
-- ========================================
INSERT INTO "Event" (id, name, slug, description, "startsAt", "endsAt", "venueName", address, city, "postalCode", country, "maxGuests", "rsvpDeadline", "userId", "showcaseEnabled", "showcasePrimaryColor", "showcaseSecondaryColor", "createdAt", "updatedAt")
VALUES (event2_id, 'Tech Summit 2025', 'tech-summit-2025', 'Le plus grand sommet tech de l''année', '2025-09-15 09:00:00', '2025-09-16 18:00:00', 'Paris Convention Center', '2 Place Porte de Versailles', 'Paris', '75015', 'France', 500, '2025-09-01', admin_id, true, '#004645', '#009197', NOW(), NOW());

-- 10 Invités Event 2
INSERT INTO "Guest" (id, "eventId", "firstName", "lastName", email, category, token, "hashedToken", "tokenExpiresAt", "createdAt", "updatedAt") VALUES
(guest2_ids[1], event2_id, 'Yann', 'LeCun', 'yann.lecun@nyu.edu', 'SPEAKER', 'tok_'||substr(md5(random()::text), 1, 32), '$2a$10$'||substr(md5(random()::text), 1, 53), NOW() + INTERVAL '90 days', NOW(), NOW()),
(guest2_ids[2], event2_id, 'Vitalik', 'Buterin', 'vitalik@ethereum.org', 'SPEAKER', 'tok_'||substr(md5(random()::text), 1, 32), '$2a$10$'||substr(md5(random()::text), 1, 53), NOW() + INTERVAL '90 days', NOW(), NOW()),
(guest2_ids[3], event2_id, 'Cassie', 'Kozyrkov', 'cassie@google.com', 'SPEAKER', 'tok_'||substr(md5(random()::text), 1, 32), '$2a$10$'||substr(md5(random()::text), 1, 53), NOW() + INTERVAL '90 days', NOW(), NOW()),
(guest2_ids[4], event2_id, 'Julie', 'Fontaine', 'julie.fontaine@techcorp.fr', 'PARTICIPANT', 'tok_'||substr(md5(random()::text), 1, 32), '$2a$10$'||substr(md5(random()::text), 1, 53), NOW() + INTERVAL '90 days', NOW(), NOW()),
(guest2_ids[5], event2_id, 'Marc', 'Durand', 'marc.durand@startup.io', 'PARTICIPANT', 'tok_'||substr(md5(random()::text), 1, 32), '$2a$10$'||substr(md5(random()::text), 1, 53), NOW() + INTERVAL '90 days', NOW(), NOW()),
(guest2_ids[6], event2_id, 'Sarah', 'Chen', 'sarah.chen@vc.com', 'VIP', 'tok_'||substr(md5(random()::text), 1, 32), '$2a$10$'||substr(md5(random()::text), 1, 53), NOW() + INTERVAL '90 days', NOW(), NOW()),
(guest2_ids[7], event2_id, 'David', 'Lopez', 'david.lopez@sponsor.com', 'PARTENAIRE', 'tok_'||substr(md5(random()::text), 1, 32), '$2a$10$'||substr(md5(random()::text), 1, 53), NOW() + INTERVAL '90 days', NOW(), NOW()),
(guest2_ids[8], event2_id, 'Emma', 'Wilson', 'emma.wilson@news.com', 'PRESSE', 'tok_'||substr(md5(random()::text), 1, 32), '$2a$10$'||substr(md5(random()::text), 1, 53), NOW() + INTERVAL '90 days', NOW(), NOW()),
(guest2_ids[9], event2_id, 'Lucas', 'Martin', 'lucas.martin@mag.fr', 'PRESSE', 'tok_'||substr(md5(random()::text), 1, 32), '$2a$10$'||substr(md5(random()::text), 1, 53), NOW() + INTERVAL '90 days', NOW(), NOW()),
(guest2_ids[10], event2_id, 'Alice', 'Bernard', 'alice.bernard@company.com', 'PARTICIPANT', 'tok_'||substr(md5(random()::text), 1, 32), '$2a$10$'||substr(md5(random()::text), 1, 53), NOW() + INTERVAL '90 days', NOW(), NOW());

-- RSVPs Event 2 (8 oui, 1 non, 1 pending)
INSERT INTO "RSVP" (id, "guestId", "eventId", attending, "plusOne", "dietaryRestrictions", message, "respondedAt", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), guest2_ids[1], event2_id, true, 0, NULL, 'Excited!', NOW() - INTERVAL '15 days', NOW(), NOW()),
(gen_random_uuid(), guest2_ids[2], event2_id, true, 0, 'Vegan', NULL, NOW() - INTERVAL '14 days', NOW(), NOW()),
(gen_random_uuid(), guest2_ids[3], event2_id, true, 0, NULL, 'Looking forward', NOW() - INTERVAL '13 days', NOW(), NOW()),
(gen_random_uuid(), guest2_ids[4], event2_id, true, 1, NULL, 'Avec collègue', NOW() - INTERVAL '10 days', NOW(), NOW()),
(gen_random_uuid(), guest2_ids[5], event2_id, true, 0, NULL, NULL, NOW() - INTERVAL '8 days', NOW(), NOW()),
(gen_random_uuid(), guest2_ids[6], event2_id, true, 0, 'Sans lactose', 'Hâte!', NOW() - INTERVAL '12 days', NOW(), NOW()),
(gen_random_uuid(), guest2_ids[7], event2_id, true, 2, NULL, 'Avec équipe', NOW() - INTERVAL '11 days', NOW(), NOW()),
(gen_random_uuid(), guest2_ids[8], event2_id, true, 0, NULL, 'Presse', NOW() - INTERVAL '7 days', NOW(), NOW()),
(gen_random_uuid(), guest2_ids[10], event2_id, false, 0, NULL, 'Conflit agenda', NOW() - INTERVAL '9 days', NOW(), NOW());

-- Check-ins Event 2
INSERT INTO "CheckIn" (id, "guestId", "eventId", method, "checkedInAt", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), guest2_ids[1], event2_id, 'QR_CODE', NOW() - INTERVAL '30 min', NOW(), NOW()),
(gen_random_uuid(), guest2_ids[2], event2_id, 'MANUAL', NOW() - INTERVAL '25 min', NOW(), NOW()),
(gen_random_uuid(), guest2_ids[6], event2_id, 'QR_CODE', NOW() - INTERVAL '20 min', NOW(), NOW());

-- Module Transport Event 2
INSERT INTO "EventModule" (id, "eventId", "moduleType", "isActive", "createdAt", "updatedAt") VALUES (gen_random_uuid(), event2_id, 'TRANSPORT', true, NOW(), NOW());

-- Transport bookings Event 2
INSERT INTO "TransportBooking" (id, "eventId", "guestId", type, status, departure, arrival, carrier, "bookingRef", "seatNumber", "estimatedCost", "actualCost", currency, "isPaidByCompany", "internalNotes", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), event2_id, guest2_ids[1], 'FLIGHT', 'BOOKED', '{"city":"New York","airport":"JFK","date":"2025-09-14","time":"18:00"}'::jsonb, '{"city":"Paris","airport":"CDG","date":"2025-09-15","time":"07:30"}'::jsonb, 'Air France', 'AF007', '2A', 4500, 4200, 'EUR', true, 'VIP Speaker', NOW(), NOW()),
(gen_random_uuid(), event2_id, guest2_ids[2], 'FLIGHT', 'CONFIRMED', '{"city":"Singapore","airport":"SIN","date":"2025-09-14","time":"01:00"}'::jsonb, '{"city":"Paris","airport":"CDG","date":"2025-09-14","time":"08:45"}'::jsonb, 'Singapore Airlines', 'SQ334', '1A', 5500, 5200, 'EUR', true, 'VIP Suite', NOW(), NOW()),
(gen_random_uuid(), event2_id, guest2_ids[3], 'FLIGHT', 'BOOKED', '{"city":"San Francisco","airport":"SFO","date":"2025-09-14","time":"12:00"}'::jsonb, '{"city":"Paris","airport":"CDG","date":"2025-09-15","time":"07:00"}'::jsonb, 'United', 'UA990', '3K', 3800, 3600, 'EUR', true, NULL, NOW(), NOW()),
(gen_random_uuid(), event2_id, guest2_ids[4], 'TRAIN', 'BOOKED', '{"city":"Lille","station":"Lille Europe","date":"2025-09-15","time":"06:30"}'::jsonb, '{"city":"Paris","station":"Gare du Nord","date":"2025-09-15","time":"07:30"}'::jsonb, 'TGV', 'TGV5512', '28', 45, 42, 'EUR', true, NULL, NOW(), NOW()),
(gen_random_uuid(), event2_id, guest2_ids[5], 'TAXI', 'REQUESTED', '{"city":"Paris","address":"Hôtel Hilton","date":"2025-09-15","time":"08:00"}'::jsonb, '{"city":"Paris","address":"Convention Center","date":"2025-09-15","time":"08:30"}'::jsonb, NULL, NULL, NULL, 35, NULL, 'EUR', false, NULL, NOW(), NOW());

-- Manifests Event 2
INSERT INTO "TransportManifest" (id, "eventId", type, name, description, departure, arrival, "maxCapacity", "currentCount", "costPerPerson", currency, status, "meetingPoint", "contactName", "contactPhone", "createdAt", "updatedAt") VALUES
(manifest2_id, event2_id, 'SHUTTLE', 'Navette Matin J1', 'Hôtels → Convention', '{"city":"Paris","address":"Hôtel Marriott","date":"2025-09-15","time":"08:00"}'::jsonb, '{"city":"Paris","address":"Convention Center","date":"2025-09-15","time":"08:45"}'::jsonb, 50, 3, 0, 'EUR', 'OPEN', 'Devant hôtels', 'Transport', '+33145678900', NOW(), NOW()),
(manifest3_id, event2_id, 'SHUTTLE', 'Navette Soir J1', 'Convention → Hôtels', '{"city":"Paris","address":"Convention Center","date":"2025-09-15","time":"18:30"}'::jsonb, '{"city":"Paris","address":"Hôtel Marriott","date":"2025-09-15","time":"19:15"}'::jsonb, 50, 0, 0, 'EUR', 'OPEN', 'Sortie principale', 'Transport', '+33145678900', NOW(), NOW()),
(manifest4_id, event2_id, 'SHUTTLE', 'Navette VIP → CDG', 'VIP aéroport', '{"city":"Paris","address":"Convention Center","date":"2025-09-16","time":"19:00"}'::jsonb, '{"city":"Roissy","airport":"CDG","date":"2025-09-16","time":"20:00"}'::jsonb, 30, 3, 25, 'EUR', 'CONFIRMED', 'Sortie VIP', 'VIP Transport', '+33140506070', NOW(), NOW());

INSERT INTO "ManifestParticipant" (id, "manifestId", "guestId", "seatNumber", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), manifest2_id, guest2_ids[4], '12', NOW(), NOW()),
(gen_random_uuid(), manifest2_id, guest2_ids[7], '13', NOW(), NOW()),
(gen_random_uuid(), manifest2_id, guest2_ids[8], '14', NOW(), NOW()),
(gen_random_uuid(), manifest4_id, guest2_ids[1], '1', NOW(), NOW()),
(gen_random_uuid(), manifest4_id, guest2_ids[2], '2', NOW(), NOW()),
(gen_random_uuid(), manifest4_id, guest2_ids[3], '3', NOW(), NOW());

END $$;

COMMIT;

-- Résumé
SELECT
  'Seed terminé !' as message,
  (SELECT COUNT(*) FROM "User") as users,
  (SELECT COUNT(*) FROM "Event") as events,
  (SELECT COUNT(*) FROM "Guest") as guests,
  (SELECT COUNT(*) FROM "RSVP") as rsvps,
  (SELECT COUNT(*) FROM "CheckIn") as checkins,
  (SELECT COUNT(*) FROM "TransportBooking") as bookings,
  (SELECT COUNT(*) FROM "TransportManifest") as manifests,
  (SELECT COUNT(*) FROM "ManifestParticipant") as participants;
