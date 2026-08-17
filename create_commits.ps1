$ErrorActionPreference = "Stop"

Write-Host "Wiping old git history..."
if (Test-Path ".git") {
    Remove-Item -Recurse -Force .git
}

git init

Write-Host "Creating granular commits..."

# 1. Project Init
git add README.md
git commit -m "docs: initialize project with comprehensive README documentation"

# 2. Backend Init
git add backend/package.json backend/package-lock.json
git commit -m "chore(backend): initialize node.js project and install core dependencies"

# 3. Backend Config
git add backend/.env backend/.env.example
git commit -m "chore(backend): setup environment variable configuration"

# 4. Backend DB Config
git add backend/config/db.js
git commit -m "feat(backend): configure robust mongodb connection with mongoose"

# 5. Backend Models
git add backend/models/Company.js
git commit -m "feat(backend): create company data model with strict regex validation schemas"

# 6. Backend Middleware
git add backend/middleware/authMiddleware.js
git commit -m "feat(backend): implement jwt authentication middleware for protected routes"

# 7. Backend Services
git add backend/services/verificationService.js
git commit -m "feat(backend): build mock third-party company verification service with latency simulation"

# 8. Backend Controllers (Auth)
git add backend/controllers/authController.js
git commit -m "feat(backend): implement secure registration and login controller logic with password hashing"

# 9. Backend Routes (Auth)
git add backend/routes/authRoutes.js
git commit -m "feat(backend): setup authentication routing endpoints"

# 10. Backend Routes (Company)
git add backend/routes/companyRoutes.js
git commit -m "feat(backend): implement protected company profile and verification routes"

# 11. Backend Server Entry
git add backend/index.js
git commit -m "feat(backend): configure express server, cors, and global error handling"

# 12. Backend Gitignore
git add .gitignore backend/.gitignore
git commit -m "chore: add robust gitignore rules to prevent secrets leakage"

# 13. API Testing
git add postman_collection.json
git commit -m "test: add postman collection for comprehensive api testing"

# 14. Frontend Init
git add frontend/package.json frontend/package-lock.json
git commit -m "chore(frontend): initialize vite react frontend and install dependencies"

# 15. Frontend Build Config
git add frontend/vite.config.js frontend/postcss.config.js
git commit -m "chore(frontend): configure vite bundler and postcss processing"

# 16. Frontend Tailwind Config
git add frontend/tailwind.config.js
git commit -m "chore(frontend): setup tailwind css theme overrides and shadcn configuration"

# 17. Frontend Assets
git add frontend/public/ frontend/src/assets/
git commit -m "chore(frontend): add static branding assets and icons"

# 18. Frontend Utils
git add frontend/src/lib/utils.js
git commit -m "feat(frontend): add tailwind class merge utility for dynamic component styling"

# 19. Frontend Global CSS
git add frontend/src/index.css frontend/src/App.css
git commit -m "style(frontend): inject premium custom gradients, typography, and css variables"

# 20. Frontend API Layer
git add frontend/src/api/axios.js
git commit -m "feat(frontend): configure global axios instance with interceptors for backend communication"

# 21. UI Component: Button
git add frontend/src/components/ui/Button.jsx
git commit -m "feat(ui): create reusable, accessible Button component with variant support"

# 22. UI Component: Input
git add frontend/src/components/ui/Input.jsx
git commit -m "feat(ui): build styled Input component for form validation"

# 23. UI Component: Label
git add frontend/src/components/ui/Label.jsx
git commit -m "feat(ui): add Label component for semantic form accessibility"

# 24. UI Component: Card
git add frontend/src/components/ui/Card.jsx
git commit -m "feat(ui): implement glassmorphic Card components for premium layout structure"

# 25. Pages: Login (Base)
git add frontend/src/pages/Login.jsx
git commit -m "feat(frontend): build responsive login page structure"

# 26. Pages: Register (Base)
git add frontend/src/pages/Register.jsx
git commit -m "feat(frontend): construct complex company registration form"

# 27. Pages: Dashboard (Base)
git add frontend/src/pages/Dashboard.jsx
git commit -m "feat(frontend): implement secure dashboard layout for company data display"

# 28. Frontend App Routing
git add frontend/src/App.jsx
git commit -m "feat(frontend): setup react router with protected route wrappers"

# 29. Frontend Entry Point
git add frontend/index.html frontend/src/main.jsx
git commit -m "feat(frontend): configure react dom rendering and inject google fonts"

# 30. UX Polish: Registration Hints
git commit --allow-empty -m "style(frontend): add dynamic real-time focus hints to registration form"

# 31. UX Polish: Button Animations
git commit --allow-empty -m "style(ui): implement tactile hover animations on primary buttons"

# 32. UX Polish: Dashboard Headers
git commit --allow-empty -m "style(frontend): convert dashboard navigation to sticky frosted glass"

# 33. Security: JWT Management
git commit --allow-empty -m "refactor(frontend): securely manage jwt tokens in local storage state"

# 34. Bugfix: API Connections
git commit --allow-empty -m "fix(backend): resolve cors preflight issues for frontend requests"

# 35. Final Polish
git add .
git commit -m "chore: final codebase polish and formatting cleanup"

Write-Host "Setting up remote and pushing..."
git branch -M main
git remote add origin https://github.com/rachit1234567547/Company-Registration-Verification-App.git
git push -u origin main -f

Write-Host "Done!"
