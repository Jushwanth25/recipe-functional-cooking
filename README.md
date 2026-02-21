# Recipe Cooking Dashboard

This project is a full-stack Recipe Cooking Dashboard built with Node.js, Express, MongoDB (Mongoose), and a responsive vanilla HTML/CSS/JS frontend.

**Features**
- Add, edit, delete recipes (title, ingredients, steps, time, difficulty, image).
- Search and filter by ingredient, max time, and difficulty.
- Favorites section and toggle.
- Dark / Light mode.
- Dashboard analytics (total recipes, average time, quick recipes).
- REST API with modular routes and Mongoose models.

**Project structure**

```
recipe-functional-cooking/
├── package.json
├── server.js
├── config/
│   └── db.js
├── models/
│   └── Recipe.js
├── routes/
│   └── recipes.js
├── seed/
│   └── sampleData.js
├── public/
│   ├── index.html
│   ├── css/styles.css
│   └── js/app.js
├── .env.example
└── README.md
```

Step-by-step explanation
1. Scaffolded an Express server (`server.js`) and MongoDB connector (`config/db.js`).
2. Created a `Recipe` Mongoose model with fields for title, ingredients, steps, time, difficulty, image and favorite flag.
3. Implemented REST routes in `routes/recipes.js` for listing (with filters), creating, reading, updating, deleting, and toggling favorites.
4. Added an analytics endpoint (`/api/analytics`) in `server.js` that returns total recipes, average cooking time, and count of quick recipes.
5. Built a responsive frontend in `public/` with a sidebar, header, and main dashboard area. The UI supports search, filters, favorites, add/edit forms, and dark/light mode.
6. Added a seed script `seed/sampleData.js` to populate the database with sample recipes.

Setup and run instructions
1. Install dependencies:

```bash
npm install
```

2. Create an `.env` in the project root (or use the default). Example `.env` content is in `.env.example`:

```
MONGODB_URI=mongodb://localhost:27017/recipesdb
PORT=4000
```

3. Start a local MongoDB instance (e.g., `mongod`) or use a cloud MongoDB URI.

4. (Optional) Seed sample data:

```bash
npm run seed
```

5. Start the server:

```bash
npm run dev
# or
npm start
```

6. Open the app in your browser at `http://localhost:4000`.

Notes & production readiness
- The project is modular: models, routes, config separated.
- For production: add proper logging, request validation (e.g., Joi), authentication, rate-limiting, image uploads (S3), and environment-based configuration.
- Consider building a build step for frontend assets and adding tests.

If you'd like, I can now:
- Run the seed and start the server (if you want me to run commands locally),
- Add user authentication,
- Convert to a React/Vue frontend,
- Add pagination and sorting.
# recipe-functional-cooking
Functional Recipe Cooking Dashboard built with React, Tailwind, Node.js, and MongoDB. Create, edit, delete, and filter recipes with an intuitive UI. Includes favorites, analytics stats, dark/light mode, and responsive design. Structured with clean architecture, REST APIs, and modular code for scalability and performance.
