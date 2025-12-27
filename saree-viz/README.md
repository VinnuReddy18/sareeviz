# SareeViz - AI Virtual Photoshoot Generator

Transform saree floor shots into professional model photoshoots using AI. Built with Next.js and Google's Gemini AI.

## 🎯 Project Overview

SareeViz uses advanced AI to generate virtual photoshoots of models wearing sarees. Simply upload a floor shot of a saree, and the app will:

- Analyze the saree's design, colors, patterns, borders, and pallu
- Generate professional photoshoot images of a model wearing the exact same saree
- Maintain consistency across multiple generations
- Preserve all design elements: main body, pallu/aanchal, and borders

## ✨ Features

- **Accurate Design Preservation**: Matches saree patterns, colors, borders, and pallu exactly
- **Batch Generation**: Generate up to 20 images in one session
- **Consistency Testing**: Built-in support for testing consistency across 10+ consecutive generations
- **Real-time Progress**: Visual feedback during generation process
- **Detailed Analysis**: AI provides detailed analysis of uploaded saree
- **Success Metrics**: Track generation success rates

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
   
   Create a `.env.local` file in the root directory:
   ```bash
   GOOGLE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

1. **Upload a Saree Image**: Click the upload area or drag and drop a floor shot of a saree
2. **Set Generation Count**: Choose how many images to generate (default: 10 for consistency testing)
3. **Generate**: Click the generate button to start the AI process
4. **Review Results**: View all generated images in a grid layout
5. **Check Consistency**: Verify that all generations maintain the same design elements

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Model**: Google Gemini 2.0 Flash + Imagen 3
- **Image Processing**: Native File API

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

## 🔧 Configuration

### API Endpoint (`/app/api/generate/route.ts`)

The API uses a two-step process:

1. **Analysis**: Gemini Vision analyzes the uploaded saree image
2. **Generation**: Imagen 3 generates the photoshoot based on the analysis

### Key Parameters

- **Vision Model**: `gemini-2.0-flash-exp` for image analysis
- **Image Model**: `imagen-3.0-generate-001` for generation
- **Generation Count**: Configurable (1-20 images)

## 🎨 Design Requirements

The app ensures generated images match the original saree exactly:

### Main Body Design
- Pattern preservation
- Exact color matching
- Texture and weave replication
- Embroidery/print accuracy

### Pallu/Aanchal
- Design pattern matching
- Decorative element preservation
- Color scheme consistency
- Proper length and draping

### Border/Lace
- Width and placement accuracy
- Pattern replication
- Color matching
- Decorative detail preservation

## 📊 Consistency Testing

The app is designed to pass the consistency test:

- Generate 10 consecutive images
- Verify all images maintain the same saree design
- Track success rate metrics
- Display all generations for comparison

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

## 📝 Notes

- **API Limitations**: Imagen 3 access may require Google Cloud project setup with Vertex AI enabled
- **Rate Limits**: Google API has rate limits; adjust generation count accordingly
- **Image Quality**: Higher quality images produce better results
- **Processing Time**: Each generation may take 10-30 seconds depending on API response time

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### API errors
- Verify your API key is correct
- Check API quota limits
- Ensure billing is enabled (for Imagen 3)

### Generation fails
- Check image format (PNG, JPG, WEBP supported)
- Reduce image size if too large (< 10MB)
- Verify internet connection

## 📄 License

This project is part of the SareeViz technical assessment.

## 👤 Author

**Vinay** - Technical Assessment Submission

## 🙏 Acknowledgments

- Google Gemini AI for image analysis and generation
- Next.js team for the excellent framework
- Tailwind CSS for styling utilities

---

**Note**: This is a demonstration project for the SareeViz Round 1 technical assessment. The focus is on generating consistent, accurate virtual photoshoots that preserve all saree design elements across multiple generations.
