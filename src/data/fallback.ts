import type { PortfolioData } from '../lib/types';

// Contenu affiché tant que Supabase n'est pas configuré ou injoignable.
// Il reproduit supabase/seed.sql : modifiez les deux ensemble.
export const fallback: PortfolioData = {
  "profile": {
    "id": 1,
    "full_name": "Martin Manampisoa",
    "title": "Développeur web et mobile fullstack",
    "tagline": "Jeune diplômé en informatique, je cherche une équipe où progresser sur des projets concrets, du back-end jusqu’à l’interface.",
    "hero_words": [
      "des applications web rapides",
      "des applications mobiles React Native",
      "des API REST sécurisées",
      "des outils de gestion sur mesure",
      "des fonctionnalités d’IA"
    ],
    "education": "Licence en informatique, Université Adventiste Zurcher, 2023 – 2026 (mention Bien)",
    "bio": "Diplômé d’une licence en informatique (mention Bien) à l’Université Adventiste Zurcher, à Antsirabe, je construis des applications complètes avec React, TypeScript et Node.js, sur le web comme sur mobile avec React Native.\n\nPendant mon stage chez Connect Talent, j’ai développé une application de gestion d’hôtel et réduit de 30 % le temps de chargement des pages en optimisant les requêtes et le bundle. Mon projet de fin d’études, Skill2Study, aide les bacheliers à choisir leur filière grâce à un moteur de recommandation.\n\nJ’aime les projets où le code résout un problème concret, et je travaille volontiers en équipe Agile : sprints, revues de code, livraisons fréquentes.",
    "location": "Antananarivo, Madagascar",
    "languages": "Malgache (langue maternelle), français (courant), anglais (intermédiaire)",
    "email": "martinmanampisoa5@gmail.com",
    "phone": null,
    "github_url": "https://github.com/Martin42746284",
    "linkedin_url": null,
    "photo_path": "photo.jpg",
    "cv_path": "cv.pdf",
    "available": true,
    "title_en": "Fullstack web and mobile developer",
    "tagline_en": "Recent computer science graduate looking for a team where I can grow on real projects, from the back end to the interface.",
    "hero_words_en": [
      "fast web applications",
      "React Native mobile apps",
      "secure REST APIs",
      "custom management tools",
      "AI-powered features"
    ],
    "bio_en": "I hold a bachelor’s degree in computer science (mention Bien) from Université Adventiste Zurcher in Antsirabe. I build complete applications with React, TypeScript and Node.js, on the web and on mobile with React Native.\n\nDuring my internship at Connect Talent, I developed a hotel management application and cut page load time by 30% by optimising queries and the bundle. My final-year project, Skill2Study, helps high-school graduates choose a degree programme thanks to a recommendation engine.\n\nI enjoy projects where code solves a real problem, and I like working in Agile teams: sprints, code reviews and frequent releases.",
    "languages_en": "Malagasy (native), French (fluent), English (intermediate)",
    "education_en": "Bachelor’s degree in computer science, Université Adventiste Zurcher, 2023 – 2026 (mention Bien)",
    "cv_path_en": "cv-en.pdf"
  },
  "skills": [
    {
      "category": "Langages",
      "name": "JavaScript",
      "is_core": true,
      "sort_order": 1,
      "category_en": "Languages"
    },
    {
      "category": "Langages",
      "name": "TypeScript",
      "is_core": true,
      "sort_order": 2,
      "category_en": "Languages"
    },
    {
      "category": "Langages",
      "name": "Python",
      "is_core": true,
      "sort_order": 3,
      "category_en": "Languages"
    },
    {
      "category": "Langages",
      "name": "PHP",
      "is_core": false,
      "sort_order": 4,
      "category_en": "Languages"
    },
    {
      "category": "Langages",
      "name": "Java",
      "is_core": true,
      "sort_order": 5,
      "category_en": "Languages"
    },
    {
      "category": "Langages",
      "name": "C",
      "is_core": false,
      "sort_order": 6,
      "category_en": "Languages"
    },
    {
      "category": "Langages",
      "name": "C++",
      "is_core": false,
      "sort_order": 7,
      "category_en": "Languages"
    },
    {
      "category": "Langages",
      "name": "C#",
      "is_core": false,
      "sort_order": 8,
      "category_en": "Languages"
    },
    {
      "category": "Front-end",
      "name": "React",
      "is_core": true,
      "sort_order": 9,
      "category_en": "Front end"
    },
    {
      "category": "Front-end",
      "name": "Next.js",
      "is_core": false,
      "sort_order": 10,
      "category_en": "Front end"
    },
    {
      "category": "Front-end",
      "name": "Vue.js",
      "is_core": true,
      "sort_order": 11,
      "category_en": "Front end"
    },
    {
      "category": "Front-end",
      "name": "Tailwind CSS",
      "is_core": true,
      "sort_order": 12,
      "category_en": "Front end"
    },
    {
      "category": "Front-end",
      "name": "HTML5",
      "is_core": true,
      "sort_order": 13,
      "category_en": "Front end"
    },
    {
      "category": "Front-end",
      "name": "CSS3",
      "is_core": true,
      "sort_order": 14,
      "category_en": "Front end"
    },
    {
      "category": "Back-end",
      "name": "Node.js",
      "is_core": true,
      "sort_order": 15,
      "category_en": "Back end"
    },
    {
      "category": "Back-end",
      "name": "Express",
      "is_core": true,
      "sort_order": 16,
      "category_en": "Back end"
    },
    {
      "category": "Back-end",
      "name": "Laravel",
      "is_core": false,
      "sort_order": 17,
      "category_en": "Back end"
    },
    {
      "category": "Back-end",
      "name": "Flask",
      "is_core": false,
      "sort_order": 18,
      "category_en": "Back end"
    },
    {
      "category": "Back-end",
      "name": "API REST",
      "is_core": true,
      "sort_order": 19,
      "category_en": "Back end"
    },
    {
      "category": "Back-end",
      "name": "GraphQL",
      "is_core": true,
      "sort_order": 20,
      "category_en": "Back end"
    },
    {
      "category": "Mobile",
      "name": "React Native",
      "is_core": true,
      "sort_order": 21,
      "category_en": "Mobile"
    },
    {
      "category": "Mobile",
      "name": "Expo",
      "is_core": true,
      "sort_order": 22,
      "category_en": "Mobile"
    },
    {
      "category": "Mobile",
      "name": "Flutter",
      "is_core": true,
      "sort_order": 23,
      "category_en": "Mobile"
    },
    {
      "category": "Bases de données",
      "name": "PostgreSQL",
      "is_core": true,
      "sort_order": 24,
      "category_en": "Databases"
    },
    {
      "category": "Bases de données",
      "name": "MySQL",
      "is_core": true,
      "sort_order": 25,
      "category_en": "Databases"
    },
    {
      "category": "Bases de données",
      "name": "MongoDB",
      "is_core": true,
      "sort_order": 26,
      "category_en": "Databases"
    },
    {
      "category": "Bases de données",
      "name": "Firebase",
      "is_core": true,
      "sort_order": 27,
      "category_en": "Databases"
    },
    {
      "category": "Bases de données",
      "name": "Supabase",
      "is_core": true,
      "sort_order": 28,
      "category_en": "Databases"
    },
    {
      "category": "IA et données",
      "name": "scikit-learn",
      "is_core": true,
      "sort_order": 29,
      "category_en": "AI and data"
    },
    {
      "category": "IA et données",
      "name": "API OpenAI",
      "is_core": true,
      "sort_order": 30,
      "category_en": "AI and data"
    },
    {
      "category": "Outils et méthodes",
      "name": "Git/GitHub",
      "is_core": true,
      "sort_order": 31,
      "category_en": "Tools and methods"
    },
    {
      "category": "Outils et méthodes",
      "name": "Docker",
      "is_core": true,
      "sort_order": 32,
      "category_en": "Tools and methods"
    },
    {
      "category": "Outils et méthodes",
      "name": "CI/CD",
      "is_core": false,
      "sort_order": 33,
      "category_en": "Tools and methods"
    },
    {
      "category": "Outils et méthodes",
      "name": "Postman",
      "is_core": true,
      "sort_order": 34,
      "category_en": "Tools and methods"
    },
    {
      "category": "Outils et méthodes",
      "name": "Agile/Scrum",
      "is_core": true,
      "sort_order": 35,
      "category_en": "Tools and methods"
    }
  ],
  "projects": [
    {
      "slug": "skill2study",
      "title": "Skill2Study",
      "subtitle": "Orientation universitaire assistée par IA (projet de fin d’études)",
      "category": "Web",
      "summary": "Plateforme web d’aide à la décision qui recommande aux bacheliers les filières adaptées à leur profil académique et personnel, en tenant compte de leur localisation.",
      "highlights": [
        "Test d’orientation adaptatif et score de compatibilité pour chaque filière.",
        "Moteur de recommandation Random Forest et KNN : 85 % de précision sur plus de 1 500 exemples d’entraînement.",
        "Comparaison de filières côte à côte, universités classées par proximité.",
        "Trois services : interface React/TypeScript, API Node.js/Express avec Sequelize, service d’IA Python/Flask, le tout avec PostgreSQL sous Docker."
      ],
      "stack": [
        "React",
        "TypeScript",
        "Node.js",
        "Express",
        "PostgreSQL",
        "Python",
        "Flask",
        "scikit-learn",
        "Docker"
      ],
      "github_url": "https://github.com/Martin42746284/Skill2Study",
      "live_url": null,
      "image_path": null,
      "year": 2026,
      "featured": true,
      "sort_order": 1,
      "subtitle_en": "AI-assisted university guidance (final-year project)",
      "summary_en": "Decision-support web platform that recommends degree programmes to high-school graduates based on their academic and personal profile, taking their location into account.",
      "highlights_en": [
        "Adaptive guidance test and a compatibility score for each programme.",
        "Random Forest and KNN recommendation engine: 85% accuracy on more than 1,500 training examples.",
        "Side-by-side comparison of programmes, universities ranked by proximity.",
        "Three services: React/TypeScript interface, Node.js/Express API with Sequelize, Python/Flask AI service, all with PostgreSQL under Docker."
      ]
    },
    {
      "slug": "plume-relais",
      "title": "Plume Relais",
      "subtitle": "Application mobile d’écriture collaborative",
      "category": "Mobile",
      "summary": "Chacun crée une histoire, écrit la suite, vote pour les meilleures contributions et suit l’évolution du récit en temps réel.",
      "highlights": [
        "Authentification, histoires, tours d’écriture, votes, commentaires et réactions.",
        "Synchronisation en temps réel avec Supabase Realtime.",
        "Notifications locales, partage natif et export d’une histoire.",
        "État global avec Zustand et navigation par fichiers avec Expo Router."
      ],
      "stack": [
        "React Native",
        "Expo",
        "TypeScript",
        "Supabase",
        "PostgreSQL",
        "Zustand"
      ],
      "github_url": "https://github.com/Martin42746284/plume-relais",
      "live_url": null,
      "image_path": null,
      "year": 2026,
      "featured": false,
      "sort_order": 2,
      "subtitle_en": "Collaborative writing mobile app",
      "summary_en": "Everyone starts a story, writes the next part, votes for the best contributions and follows the story as it evolves in real time.",
      "highlights_en": [
        "Authentication, stories, writing turns, votes, comments and reactions.",
        "Real-time sync with Supabase Realtime.",
        "Local notifications, native sharing and story export.",
        "Global state with Zustand and file-based navigation with Expo Router."
      ]
    },
    {
      "slug": "smartepicerie",
      "title": "SmartEpicerie",
      "subtitle": "Gestion d’épicerie",
      "category": "Web",
      "summary": "Application web pour gérer le catalogue, les ventes et les stocks d’une épicerie, avec un accès adapté à chaque rôle.",
      "highlights": [
        "Produits, catégories, ventes et lignes de vente.",
        "Historique des mouvements de stock.",
        "Authentification et gestion des rôles avec Supabase.",
        "Rendu serveur avec TanStack Start, configuré pour un déploiement sur Cloudflare."
      ],
      "stack": [
        "TanStack Start",
        "React",
        "TypeScript",
        "Supabase",
        "Tailwind CSS"
      ],
      "github_url": "https://github.com/Martin42746284/SmartEpicerie",
      "live_url": null,
      "image_path": null,
      "year": 2026,
      "featured": false,
      "sort_order": 3,
      "subtitle_en": "Grocery store management",
      "summary_en": "Web app to manage a grocery store’s catalogue, sales and stock, with role-based access.",
      "highlights_en": [
        "Products, categories, sales and sale lines.",
        "Stock movement history.",
        "Authentication and role management with Supabase.",
        "Server rendering with TanStack Start, set up for deployment on Cloudflare."
      ]
    },
    {
      "slug": "e-learning-api",
      "title": "E-learning API",
      "subtitle": "Plateforme de formation",
      "category": "API",
      "summary": "API REST pour gérer les étudiants, les formateurs, les cours et les inscriptions d’une école de formation.",
      "highlights": [
        "Authentification JWT et routes protégées, pagination et filtres.",
        "Webhook de paiement vérifié par signature HMAC.",
        "Génération de descriptions de cours avec l’API OpenAI.",
        "Documentation OpenAPI consultable avec Swagger UI."
      ],
      "stack": [
        "Node.js",
        "Express",
        "PostgreSQL",
        "JWT",
        "OpenAI",
        "Swagger"
      ],
      "github_url": "https://github.com/Martin42746284/E-learning-api",
      "live_url": null,
      "image_path": null,
      "year": 2026,
      "featured": false,
      "sort_order": 4,
      "subtitle_en": "Training platform",
      "summary_en": "REST API to manage students, trainers, courses and enrolments for a training school.",
      "highlights_en": [
        "JWT authentication and protected routes, pagination and filters.",
        "Payment webhook verified with an HMAC signature.",
        "Course description generation with the OpenAI API.",
        "OpenAPI documentation available through Swagger UI."
      ]
    },
    {
      "slug": "library-api",
      "title": "Library API",
      "subtitle": "Gestion de bibliothèque",
      "category": "API",
      "summary": "API REST pour gérer les livres et les utilisateurs d’une bibliothèque, avec authentification sécurisée.",
      "highlights": [
        "Inscription et connexion sécurisées avec JWT et bcrypt.",
        "Gestion complète des livres.",
        "Scripts SQL de création de la base et de données de test, documentation Swagger UI."
      ],
      "stack": [
        "Node.js",
        "Express",
        "PostgreSQL",
        "JWT",
        "bcrypt",
        "Swagger"
      ],
      "github_url": "https://github.com/Martin42746284/library-api",
      "live_url": null,
      "image_path": null,
      "year": 2026,
      "featured": false,
      "sort_order": 5,
      "subtitle_en": "Library management",
      "summary_en": "REST API to manage a library’s books and users, with secure authentication.",
      "highlights_en": [
        "Secure sign-up and login with JWT and bcrypt.",
        "Full book management.",
        "SQL scripts to create the database and test data, Swagger UI documentation."
      ]
    }
  ],
  "services": [
    {
      "icon": "web",
      "title": "Sites et applications web",
      "description": "Interfaces rapides et accessibles avec React et TypeScript, connectées à une API Node.js et à une base de données PostgreSQL.",
      "tags": [
        "React",
        "TypeScript",
        "Next.js",
        "Tailwind CSS"
      ],
      "sort_order": 1,
      "title_en": "Websites and web applications",
      "description_en": "Fast, accessible interfaces built with React and TypeScript, connected to a Node.js API and a PostgreSQL database.",
      "tags_en": [
        "React",
        "TypeScript",
        "Next.js",
        "Tailwind CSS"
      ]
    },
    {
      "icon": "mobile",
      "title": "Applications mobiles",
      "description": "Applications Android et iOS avec React Native et Expo : navigation fluide, synchronisation en temps réel, notifications.",
      "tags": [
        "React Native",
        "Expo",
        "Flutter"
      ],
      "sort_order": 2,
      "title_en": "Mobile applications",
      "description_en": "Android and iOS apps with React Native and Expo: smooth navigation, real-time sync, notifications.",
      "tags_en": [
        "React Native",
        "Expo",
        "Flutter"
      ]
    },
    {
      "icon": "api",
      "title": "API et back-end",
      "description": "API REST documentées et sécurisées (JWT, Swagger), bases de données relationnelles, webhooks et intégrations tierces.",
      "tags": [
        "Node.js",
        "Express",
        "PostgreSQL",
        "Swagger"
      ],
      "sort_order": 3,
      "title_en": "APIs and back end",
      "description_en": "Documented, secure REST APIs (JWT, Swagger), relational databases, webhooks and third-party integrations.",
      "tags_en": [
        "Node.js",
        "Express",
        "PostgreSQL",
        "Swagger"
      ]
    },
    {
      "icon": "business",
      "title": "Outils de gestion sur mesure",
      "description": "Stocks, ventes, réservations, rôles utilisateurs : des applications métier adaptées à votre activité, comme pour un hôtel ou une épicerie.",
      "tags": [
        "Supabase",
        "PostgreSQL",
        "Rôles et accès"
      ],
      "sort_order": 4,
      "title_en": "Custom management tools",
      "description_en": "Stock, sales, bookings, user roles: business applications tailored to your activity, as for a hotel or a grocery store.",
      "tags_en": [
        "Supabase",
        "PostgreSQL",
        "Roles and access"
      ]
    },
    {
      "icon": "ai",
      "title": "Fonctionnalités d’IA",
      "description": "Recommandation, classification, génération de texte avec l’API OpenAI : ajoutez de l’intelligence à votre produit.",
      "tags": [
        "Python",
        "scikit-learn",
        "OpenAI"
      ],
      "sort_order": 5,
      "title_en": "AI features",
      "description_en": "Recommendation, classification and text generation with the OpenAI API: add intelligence to your product.",
      "tags_en": [
        "Python",
        "scikit-learn",
        "OpenAI"
      ]
    },
    {
      "icon": "speed",
      "title": "Optimisation des performances",
      "description": "Requêtes, taille du bundle, temps de chargement : j’ai réduit de 30 % le temps de chargement d’une application lors de mon stage.",
      "tags": [
        "Requêtes",
        "Bundle",
        "Audit"
      ],
      "sort_order": 6,
      "title_en": "Performance optimisation",
      "description_en": "Queries, bundle size, page load time: I cut an application’s load time by 30% during my internship.",
      "tags_en": [
        "Queries",
        "Bundle",
        "Audit"
      ]
    }
  ],
  "stats": [
    {
      "value": 30,
      "suffix": "%",
      "label": "de temps de chargement en moins lors de mon stage",
      "sort_order": 1,
      "label_en": "less page load time during my internship"
    },
    {
      "value": 85,
      "suffix": "%",
      "label": "de précision pour le moteur de recommandation de Skill2Study",
      "sort_order": 2,
      "label_en": "accuracy of the Skill2Study recommendation engine"
    },
    {
      "value": 5,
      "suffix": "",
      "label": "projets disponibles sur GitHub",
      "sort_order": 3,
      "label_en": "projects available on GitHub"
    }
  ]
};
