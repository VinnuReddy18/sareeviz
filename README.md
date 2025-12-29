# SareeViz - AI Virtual Photoshoot Generator

Transform saree images into professional model photoshoots using AI. Built with Next.js and Google's Gemini AI.

## 🎯 Overview

Upload a saree image and generate 10 professional photoshoot images with a model wearing the exact same saree in different poses.

## ✨ Features

- **Exact Saree Replication**: AI preserves colors, patterns, borders, and fabric
- **10 Unique Poses**: Professional photoshoot variety with consistent model
- **Retry with Custom Prompt**: Regenerate individual poses with custom instructions if needed
- **Image Compression**: Automatic client-side optimization for fast uploads

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Google Gemini API key (get it from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd saree-viz
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env` file in the root directory:
   ```env
   GOOGLE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

1. **Upload Saree Image**: Click or drag & drop your saree image
2. **Generate**: Click "Generate Photoshoot" (creates 10 images automatically)
3. **Wait**: Progress shown for each of 10 poses
4. **Download**: Download individual images or all at once

## 🛠️ Technology Stack
## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Model**: Google Gemini 3 Pro Image Preview
- **Image Processing**: Client-side compression (auto-resize to 1920px, 85% JPEG quality)
## 📁 Project Structure

```
saree-viz/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts          # API endpoint for image generation
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main application page
├── components/
│   ├── ImageUploader.tsx          # Image upload component
│   └── ResultsGrid.tsx            # Results display component
├── .env.example                   # Environment variables template
├── .gitignore
├── next.config.ts                 # Next.js configuration
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts             # Tailwind CSS configuration
└── tsconfig.json                  # TypeScript configuration
```

## 🔧 Key Features

### Image Compression
- Auto-resizes images to max 1920px (longest side)
- Compresses to JPEG at 85% quality
- Reduces payload by 60-80% for faster uploads
- Prevents 413 "Payload Too Large" errors on Vercel

### Route Configuration
- Max execution time: 60 seconds
- Runtime: Node.js
- Optimized for Vercel deployment

### AI Generation
- Model: `gemini-3-pro-image-preview`
- Temperature: 0.0 (maximum consistency)
- 10 predefined professional poses
- Consistent model appearance across all images

## 🚦 Build & Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Deployment

Deploy to Vercel (recommended):

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Remember to add your `GOOGLE_GEMINI_API_KEY` to the environment variables in your deployment platform.

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_GEMINI_API_KEY` | Your Google Gemini API key | Yes |
