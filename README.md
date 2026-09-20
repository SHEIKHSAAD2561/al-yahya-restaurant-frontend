 Al-Yahya Restaurant Frontend

The frontend for the Al-Yahya restaurant website, built with Next.js.

Getting Started

You'll need Node.js 18.18 or newer. Check with node -v.

Clone the repo and install dependencies:

bash
git clone https://github.com/SHEIKHSAAD2561/al-yahya-restaurant-frontend.git
cd al-yahya-restaurant-frontend
npm install

Start the dev server:

bash
npm run dev

Open http://localhost:3000 in your browser. The page reloads when you edit a file.

The app uses the App Router, so the main page lives in app/page.tsx.

Scripts
Command	What it does
npm run dev	Starts the development server
npm run build	Builds the app for production
npm run start	Runs the production build
npm run lint	Checks the code with ESLint
Project Structure
.
├── app/            # Routes, layouts and pages
├── public/         # Static files (images, icons, fonts)
├── components/     # Reusable UI components (create this as you go)
├── package.json
└── next.config.ts
Environment Variables

Create a .env.local file in the project root for anything secret or environment-specific:

bash
NEXT_PUBLIC_API_URL=http://localhost:5000

Only variables starting with NEXT_PUBLIC_ are visible in the browser. Never commit .env.local.

Deployment

The easiest option is Vercel. Push the repo to GitHub, import it in Vercel, and it deploys on every push to main.

To run it yourself:

bash
npm run build
npm run start
Learn More
Next.js Documentation
Learn Next.js
Next.js GitHub repo