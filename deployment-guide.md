# Readora — Production Deployment Guide

This guide details step-by-step instructions for deploying the **Readora** application to **Cloudflare Pages** for global distribution with high speed and zero server latency.

---

## 🛠️ Prerequisites
1. A **Cloudflare Account** (Free tier is perfectly sufficient).
2. A **GitHub** or **GitLab** account containing the pushed codebase.
3. Node.js environment installed locally for verification.

---

## 🖥️ Local Build Verification

Before triggering cloud deployments, ensure the production build compiles cleanly on your local system:

```bash
# Navigate to the frontend directory
cd frontend

# Install clean node dependencies
npm install

# Run the local production build task
npm run build
```

The compiled SPA bundle will be generated under the `frontend/dist/` folder.

---

## ☁️ Deploying via Cloudflare Pages (GitHub Integration)

Cloudflare Pages provides fully automated, git-integrated CI/CD. Every time you push changes to your repository, Cloudflare will automatically build and publish them.

### Step 1: Connect your Repository
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to the left sidebar and click **Workers & Pages**.
3. Select the **Pages** tab and click **Create a project** → **Connect to Git**.
4. Authorize Cloudflare to access your GitHub account and select your repository.

### Step 2: Configure Build Settings
Under the **Build settings** section, supply the following values:

| Setting | Value | Explanation |
| :--- | :--- | :--- |
| **Framework preset** | `Vite` | Auto-configures standard Vite behaviors |
| **Root directory** | `frontend` | **(CRITICAL)** Tells Cloudflare to look inside the `frontend/` folder |
| **Build command** | `npm run build` | Builds the production bundle |
| **Build output directory** | `dist` | Relative to the root directory (so `frontend/dist/`) |

### Step 3: Define Environment Variables (Optional)
If you wish to customize defaults during build time, click **Environment variables (advanced)** and define:
* `VITE_APP_TITLE` → `"Readora"`
* `VITE_DEFAULT_LANG` → `"en-US"`

### Step 4: Click Save and Deploy!
* Cloudflare Pages will spin up a build container, execute `npm run build`, and publish your application to a free custom sub-domain (e.g. `readora.pages.dev`).

---

## 📁 Single-Page Application (SPA) Deep Link Redirects

Because Readora is a client-side React SPA, direct browser refreshes on sub-paths can trigger `404 Not Found` errors in normal cloud hosts.

To resolve this, we configured a standard routing fallback file in `public/_redirects`:
```text
/*   /index.html   200
```
Vite automatically copies this file to the root of the `dist/` directory during compilations. Cloudflare Pages automatically detects this file and rewrites all incoming deep URLs back to `index.html`, preserving React state and client routing.

---

## ⚙️ Deploying via Cloudflare Pages CLI (Wrangler Alternative)

If you prefer to deploy directly from your local terminal without linking your GitHub account, you can use the Cloudflare Wrangler CLI:

```bash
# 1. Install Wrangler globally or run via npx
npx wrangler pages deploy frontend/dist --project-name=readora
```

---

## 🔍 Troubleshooting & FAQs

### Q1: My build failed with "directory not found" or compile errors.
* **Fix**: Ensure the **Root directory** in Cloudflare build settings is explicitly set to `frontend`. Cloudflare must build from within the subdirectory, not the workspace root.

### Q2: PDF parsing or Tesseract OCR doesn't load files.
* **Fix**: Readora runs 100% locally in the browser for privacy. If external assets fail to download, make sure your browser is connected to the internet to load any required resources, or allow permissions on the console.

### Q3: How do I configure a custom domain?
* **Fix**: Go to the Cloudflare Pages dashboard → Select your Project → Navigate to the **Custom domains** tab → click **Set up a custom domain** and enter your domain name (e.g. `reader.yourname.com`). Cloudflare will automatically provision SSL certificates and update DNS records!
