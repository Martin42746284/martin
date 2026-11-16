-- ============================================================
-- Textes réécrits (version plus humaine) – à exécuter UNE FOIS
-- dans l'éditeur SQL Supabase.
--
-- Pourquoi ce fichier : seed.sql ne met à jour que les colonnes
-- *_en en cas de conflit, donc relancer seed.sql ne changerait
-- rien aux textes déjà en base (ni aux chiffres de la table stats).
-- Généré depuis src/data/fallback.ts : relancez la génération si
-- vous modifiez le contenu local.
-- ============================================================

update public.profile
set tagline = 'Je viens de terminer ma licence d’informatique. Je cherche surtout une équipe où apprendre vite et livrer du travail qui sert vraiment.',
    tagline_en = 'I have just finished my degree in computer science. Mostly I am looking for a team where I can learn fast and ship work that actually matters.',
    bio = 'J’ai obtenu ma licence en informatique (mention Bien) à l’Université Adventiste Zurcher, à Antsirabe. Depuis, je construis des applications de bout en bout : React et TypeScript devant, Node.js derrière, React Native quand il faut que ça tienne dans une poche.

Pendant mon stage chez ARIA-Accompagnement Digital, j’ai écrit une application de gestion d’hôtel et j’ai fait baisser de 30 % le temps de chargement des pages — requêtes optimisées, bundle allégé. Mon projet de fin d’études, Skill2Study, conseille les bacheliers dans le choix de leur filière.

Ce qui me plaît, c’est quand le code débloque un vrai problème. J’ai travaillé en équipe sur des sprints, avec des revues de code et des livraisons régulières, et ça m’a bien convenu.',
    bio_en = 'I hold a bachelor’s degree in computer science (mention Bien) from Université Adventiste Zurcher in Antsirabe. Since then I build applications end to end: React and TypeScript at the front, Node.js behind, React Native when it has to fit in a pocket.

During my internship at ARIA-Accompagnement Digital I wrote a hotel management application and cut page load time by 30% — queries optimised, bundle trimmed. My final-year project, Skill2Study, advises high-school graduates on which degree to pick.

What I like is code that unblocks a real problem. I have worked in a team on sprints, with code reviews and regular releases, and it suited me fine.'
where id = 1;


update public.services t
set description = v.description,
    description_en = v.description_en
from (values
    ('Sites et applications web', 'Des sites et des applications en React et TypeScript, branchés sur une API Node.js et PostgreSQL. Je soigne le temps de chargement, et le fait que ça marche aussi au clavier.', 'Sites and apps in React and TypeScript, wired to a Node.js API and PostgreSQL. I care about load time, and about it working with a keyboard too.'),
    ('Applications mobiles', 'Android et iOS avec React Native et Expo : la navigation, les notifications, et des données qui se mettent à jour toutes seules.', 'Android and iOS with React Native and Expo: navigation, notifications, and data that updates itself.'),
    ('API et back-end', 'Des API Node.js/Express documentées avec Swagger, protégées par JWT, PostgreSQL derrière, et des webhooks quand il faut.', 'Node.js/Express APIs documented with Swagger, protected with JWT, PostgreSQL behind them, and webhooks where needed.'),
    ('Outils de gestion sur mesure', 'Stocks, ventes, réservations, rôles : j’ai déjà fait une appli d’hôtel et une épicerie, je peux faire la vôtre.', 'Stock, sales, bookings, roles: I have already built a hotel app and a grocery app, I can build yours.'),
    ('Fonctionnalités d’IA', 'Recommandation et classification en Python avec scikit-learn, et appel à l’API OpenAI quand c’est justifié. Pas d’IA pour l’IA.', 'Recommendation and classification in Python with scikit-learn, and OpenAI API calls where they earn their place. No AI for the sake of it.'),
    ('Optimisation des performances', 'Requêtes, bundle, temps de chargement : j’ai fait passer une application de 30 % plus vite pendant mon stage.', 'Queries, bundle, load time: I made an application 30% faster during my internship.')
) as v(title, description, description_en)
where t.title = v.title;


update public.projects t
set summary = v.summary,
    summary_en = v.summary_en,
    highlights = v.highlights,
    highlights_en = v.highlights_en
from (values
    ('skill2study', 'Un site qui dit aux bacheliers quelles filières leur correspondent, en fonction de leurs notes, de ce qu’ils aiment et de là où ils vivent.', 'A site that tells high-school graduates which degrees suit them, based on their grades, what they like and where they live.', array['Test d’orientation adaptatif et score de compatibilité pour chaque filière.', 'Moteur de recommandation Random Forest et KNN : 85 % de précision sur plus de 1 500 exemples d’entraînement.', 'Comparaison de filières côte à côte, universités classées par proximité.', 'Trois services qui tournent ensemble : front React/TypeScript, API Node.js/Express avec Sequelize, modèle Python/Flask — et PostgreSQL dans Docker.']::text[], array['Adaptive guidance test and a compatibility score for each programme.', 'Random Forest and KNN recommendation engine: 85% accuracy on more than 1,500 training examples.', 'Side-by-side comparison of programmes, universities ranked by proximity.', 'Three services running together: React/TypeScript front end, Node.js/Express API with Sequelize, Python/Flask model — PostgreSQL in Docker.']::text[]),
    ('plume-relais', 'Chacun commence une histoire, les autres enchaînent, et le groupe vote la meilleure suite. Le récit se met à jour sous les yeux de tous.', 'Someone starts a story, the others carry it on, and the group votes for the best continuation. The story updates for everyone.', array['Authentification, histoires, tours d’écriture, votes, commentaires et réactions.', 'Synchronisation en temps réel avec Supabase Realtime.', 'Notifications locales, partage natif et export d’une histoire.', 'État global avec Zustand et navigation par fichiers avec Expo Router.']::text[], array['Authentication, stories, writing turns, votes, comments and reactions.', 'Real-time sync with Supabase Realtime.', 'Local notifications, native sharing and story export.', 'Global state with Zustand and file-based navigation with Expo Router.']::text[]),
    ('smartepicerie', 'Pour gérer le catalogue, les ventes et les stocks d’une épicerie, avec un espace adapté à chaque rôle.', 'To manage a grocery store’s catalogue, sales and stock, with a separate space for each role.', array['Produits, catégories, ventes et lignes de vente.', 'Historique des mouvements de stock.', 'Authentification et gestion des rôles avec Supabase.', 'Rendu serveur avec TanStack Start, configuré pour un déploiement sur Cloudflare.']::text[], array['Products, categories, sales and sale lines.', 'Stock movement history.', 'Authentication and role management with Supabase.', 'Server rendering with TanStack Start, set up for deployment on Cloudflare.']::text[]),
    ('e-learning-api', 'API REST pour gérer les étudiants, les formateurs, les cours et les inscriptions d’une école de formation.', 'REST API to manage students, trainers, courses and enrolments for a training school.', array['Authentification JWT et routes protégées, pagination et filtres.', 'Webhook de paiement vérifié par signature HMAC.', 'Génération de descriptions de cours avec l’API OpenAI.', 'Documentation OpenAPI consultable avec Swagger UI.']::text[], array['JWT authentication and protected routes, pagination and filters.', 'Payment webhook verified with an HMAC signature.', 'Course description generation with the OpenAI API.', 'OpenAPI documentation available through Swagger UI.']::text[]),
    ('library-api', 'API REST pour gérer les livres et les utilisateurs d’une bibliothèque, avec authentification sécurisée.', 'REST API to manage a library’s books and users, with secure authentication.', array['Inscription et connexion sécurisées avec JWT et bcrypt.', 'Gestion complète des livres.', 'Scripts SQL de création de la base et de données de test, documentation Swagger UI.']::text[], array['Secure sign-up and login with JWT and bcrypt.', 'Full book management.', 'SQL scripts to create the database and test data, Swagger UI documentation.']::text[])
) as v(slug, summary, summary_en, highlights, highlights_en)
where t.slug = v.slug;

-- ============================================================
-- Chiffres (table stats) : seed.sql ne fait qu'un insert si la
-- table est vide, donc on met à jour par sort_order.
-- ============================================================
update public.stats t
set value = v.value,
    suffix = v.suffix,
    label = v.label,
    label_en = v.label_en
from (values
    (1, 30, '%', 'de temps de chargement en moins lors de mon stage', 'less page load time during my internship'),
    (2, 85, '%', 'de précision pour le moteur de recommandation de Skill2Study', 'accuracy of the Skill2Study recommendation engine'),
    (3, 5, '', 'projets disponibles sur GitHub', 'projects available on GitHub')
) as v(sort_order, value, suffix, label, label_en)
where t.sort_order = v.sort_order;
