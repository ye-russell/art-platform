
# 🎨 Art Platform (MVP)

This is a simple, non-commercial web platform for art enthusiasts to **showcase their artwork**. Artists can list their creations, provide descriptions, and include links to external sites (like Instagram, Etsy, personal websites) along with contact information.

## 🧩 Tech Stack

### Frontend
- **Angular** with **Angular Material**
- Angular use modern approach without modules
- Responsive UI for desktop/mobile
- Page-based routing and basic state management

### Backend
- **Node.js** with **Express**
- REST API for managing artists and artwork
- File/image upload support
- Optional: Serverless deployment via AWS Lambda + API Gateway

### Cloud & Storage (AWS Free Tier)
- **S3** 
  - Static hosting for frontend
  - Image uploads storage
  - Bucket policies for public/private access
- **CloudFront** 
  - CDN for global content delivery
  - HTTPS support
  - Cache optimization
- **DynamoDB**
  - Store metadata (artist info, artwork entries)
  - Secondary indexes for efficient queries
  - TTL for temporary data
- **Lambda**
  - Run backend APIs
  - Image processing
  - Thumbnail generation
- **API Gateway**
  - RESTful API endpoints
  - API key management
  - Request throttling
- **Cognito**
  - User authentication
  - OAuth2 social login (Google, Facebook)
  - JWT token management
  - User pools and identity pools

## 🗂 Project Structure

```
art-platform/
├── client/                 # Angular frontend app
│   ├── src/app/
│   │   ├── core/           # Services (API, etc.)
│   │   ├── shared/         # Shared models, components
│   │   └── pages/          # Home, Gallery, Artist, Submit
│   └── angular.json
├── server/                 # Node.js backend API
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── index.js
├── deploy/                 # AWS deploy scripts (Lambda, S3, etc.)
│   └── cloudformation.yml
└── README.md
```

## ✨ Features (MVP Scope)

- 🌐 Public site to browse artwork
- 🧑 Artist profiles with bio and links
- 🖼 Art listing cards (title, image, description, link)
- 📬 Submission form to add new artwork/profile
- 🔁 REST API to support the above
- ☁️ AWS Free Tier deployment

## ✅ What's Done

- Angular project set up
- Angular Material configured
- Pages scaffolded: `Home`, `Gallery`, `Artist`, `Submit`
- Sample gallery layout using Material Cards
- Routing in place

### 🔹 Frontend
- Implement Submit Form with:
  - Title, description, image upload, external link, artist info
  - Form validation (Reactive Forms)
- Create shared `ArtItem` and `Artist` models
- Add service (`api.service.ts`) to call backend

## 🛠️ TODO (Next Steps)

### 🔹 Backend
- Setup Node.js + Express app
- Create REST API endpoints:
  - `GET /api/artworks`
  - `POST /api/artworks`
  - `GET /api/artists`
  - `POST /api/artists`
- Integrate with AWS S3 for image uploads
- Connect with DynamoDB to store metadata

### 🔹 AWS (Deployment)
- Host Angular app on S3 with static hosting
- Deploy backend via Lambda + API Gateway
- Set up IAM roles and policies
- Optional: Add CloudFront CDN and Cognito auth

## 💡 Notes

- Project is intended for **non-commercial** use, using **AWS Free Tier**
- Focus is on **discoverability**, not transactions
- Goal is to provide artists with a platform to **showcase and connect**

## 🤝 Contributions

Solo project for now, but future contributions might involve:
- Admin dashboard
- SEO optimization
- Artist verification
- More advanced filtering/sorting in the gallery
