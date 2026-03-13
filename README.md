# Academic Portfolio Template

A sleek, professional, and easily customizable purely static website template designed for academic researchers, PhD students, and developers.

![Template Preview](https://via.placeholder.com/800x400?text=Academic+Portfolio+Template)

## Features

- **No Build Step Required**: It's pure HTML, CSS, and vanilla JS. Exactly what you see is what you get.
- **Markdown Driven Content**: Your CV and Publications are written in simple `.md` files in the `/content` folder. The site automatically parses and styles them.
- **Reusable Components**: The Navigation bar and Footer are stored in `/components/` and injected dynamically into every page. Update them once, and they change everywhere.
- **Sleek Modern Design**: Glassmorphism cards, glowing 3D hover effects, smooth scroll animations, and a subtle animated SV background.
- **Responsive**: Fully optimized for mobile, tablet, and desktop viewing.

---

##  Getting Started (Local Development)

Because this template uses JavaScript to fetch components (`navbar.html`, `footer.html`) and markdown files, **you cannot just double-click `index.html` to open it in your browser**. Modern browsers block fetching local files for security reasons (CORS policy).

You need to run a simple local web server.

### Option 1: Using Node.js (Recommended)
If you have Node.js installed, open your terminal in the project folder and run:
```bash
npx serve
```
Then open your browser to `http://localhost:3000`.

### Option 2: Using VS Code
If you use Visual Studio Code, install the extension **"Live Server"** by Ritwick Dey. 
Open `index.html`, right-click anywhere in the code, and select **"Open with Live Server"**.

### Option 3: Using Python
If you have Python installed, open your terminal in the project folder and run:
- Mac/Linux: `python3 -m http.server`
- Windows: `python -m http.server`
Then open your browser to `http://localhost:8000`.

---

##  Step-by-Step Customisation Guide

### 1. The Global Setup (`js/components.js`)
The Nav Bar and Footer are shared across all pages. 
- Open `components/navbar.html` to change your Logo text and navigation links.
- Open `components/footer.html` to change the Copyright name and link up your social media profiles (Google Scholar, ORCID, GitHub, LinkedIn).

### 2. Changing the Content (HTML Pages)
To change the text on the main pages (like your name on the home page), you edit the `.html` files directly:
- `index.html` - Home page summary and hero section.
- `about.html` - Extended bio and education highlights.
- `contact.html` - Email and institutional details.

*Note: The titles and descriptions in `<head>` (like `<title>YourName</title>`) should also be updated in every HTML file for SEO purposes.*

### 3. Updating your CV and Publications (Markdown)
You do not need to write HTML for your long-form text.
Go to the `content/` folder:
- Edit `cv.md` for your Curriculum Vitae. Use `#` for major sections (e.g., `# Education`) to create distinct timeline blocks. Use `##` for individual entries (e.g., `## PhD in Science`). Use `---` lines to separate entries.
- Edit `publications.md` for your papers. The formatting rules are the same. Add links using standard markdown `[Link Text](https://link.com)`.

### 4. How to Add or Change Your Photo
1. Place a square or portrait aspect ratio photo in the project folder (e.g., create an `/assets/images/` folder and put `profile.jpg` in it).
2. Open `index.html` and find the `<img src="...">` tag inside the `<div class="hero__photo-wrapper">`. Change the `src` attribute to point to your new image:
   `src="assets/images/profile.jpg"`
3. Do the same in `about.html` for the photo on the About page.

### 5. How to Change the Colour Scheme
This template uses CSS Variables, making it incredibly easy to re-brand the entire site from a single file.
1. Open up `css/variables.css`.
2. Look at the top under `:root`. You will see primary colours (`--color-primary`), accent colours, and background colours.
3. Change the HEX codes. For example, to change from Teal to a deep Ruby Red:
   - `--color-primary: #e11d48;`
   - `--color-primary-hover: #be123c;`
4. **Important for glowing shadows:** Ensure you also update the RGB values for the `alpha` parameters (e.g., `--color-primary-alpha-20`) so that your shadows match your new primary colour. Use an online Hex to RGB converter to find your RGB values.

---

##  Hosting on GitHub Pages (Free Deployment)

Since there is no build step required (no React, no bundlers), deploying to GitHub pages takes less than 2 minutes.

1. **Create a Repository:** Go to GitHub and create a new repository (e.g., `yourusername.github.io` or `portfolio`).
2. **Upload Files:** Upload all the files from this folder directly into the `main` branch of that repository.
3. **Enable GitHub Pages:**
   - Go to your repository's **Settings** tab.
   - On the left sidebar, click on **Pages**.
   - Under "Build and deployment", select **Deploy from a branch**.
   - Under "Branch", select `main` (or `master`), and leave the folder as `/ (root)`.
   - Click **Save**.
4. **Wait a minute**, and GitHub will give you a live URL where your website is now hosted!

Whenever you want to update your CV or add a new publication, simply edit the file on your computer and push the changes to GitHub. The live site will update automatically.
