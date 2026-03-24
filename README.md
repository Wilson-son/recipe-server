# 🍽️ Recipe App - Backend

A RESTful API built with Node.js, Express, and MongoDB for the Recipe sharing platform.

## 🔗 Links

- **Frontend:** [recipe-app-wheat-kappa.vercel.app](https://recipe-app-wheat-kappa.vercel.app)
- **Frontend Repo:** [github.com/Wilson-son/recipe-client](https://github.com/Wilson-son/recipe-client)

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas + Mongoose
- **Image Upload:** Cloudinary
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt

## ✨ Features

- User registration and login with JWT authentication
- Create, read, update, delete recipes
- Image upload via Cloudinary
- Save/unsave recipes
- Add and view reviews
- User profile management

## 📁 Folder Structure

```
recipe-app-backend/
├── middleware/
│   └── authMiddleware.js
├── models/
│   ├── Recipe.js
│   ├── Review.js
│   └── User.js
├── routes/
│   ├── auth.js
│   ├── recipeRoutes.js
│   ├── reviewRoutes.js
│   └── userRoutes.js
├── utils/
│   ├── cloudinary.js
│   └── sendEmail.js
├── .gitignore
├── package.json
└── server.js
```

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/Wilson-son/recipe-server.git
cd recipe-server
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create a `.env` file and add your variables
```
MONGO_URI=your_mongodb_uri
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_jwt_secret
PORT=5000
```

### 4. Run the server
```bash
node server.js
```

Server runs on `http://localhost:5000`

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/recipes` | Get all recipes |
| POST | `/api/recipes` | Create a recipe |
| GET | `/api/recipes/:id` | Get single recipe |
| PUT | `/api/recipes/:id` | Update recipe |
| DELETE | `/api/recipes/:id` | Delete recipe |
| GET | `/api/users/profile` | Get user profile |
| POST | `/api/reviews/:id` | Add a review |

## 🌐 Deployment

Deployed on **Render** - [render.com](https://render.com)
