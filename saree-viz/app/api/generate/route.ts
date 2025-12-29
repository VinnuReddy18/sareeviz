import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

// Helper function to convert File to base64
async function fileToBase64(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString('base64');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const photoIndex = parseInt(formData.get('photoIndex') as string) || 1;
    const sessionSeed = formData.get('sessionSeed') as string || `${Date.now()}`;
    const customPrompt = formData.get('customPrompt') as string || '';
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    const base64Image = await fileToBase64(image);

    // Define 10 MINIMAL poses - ONLY arm/hand positions change, everything else IDENTICAL
    // Model ALWAYS faces front, standing straight - NO body turns, NO angle changes
    const photoshootPoses = [
      {
        pose: "🚨 FIRST: EXAMINE THE UPLOADED SAREE IMAGE CAREFULLY 🚨\nLook at the saree's exact colors, borders, patterns, and fabric.\nMEMORIZE every detail before generating.\n\n📸 POSE: Standing naturally with both arms relaxed at sides, neutral elegant expression.\n\n✓ NOW GENERATE: Use the EXACT saree you just examined - same colors, same border width, same patterns, same fabric texture. DO NOT change ANY detail of the saree.",
        cameraAngle: "Front, eye-level"
      },
      {
        pose: "🚨 FIRST: EXAMINE THE UPLOADED SAREE IMAGE CAREFULLY 🚨\nLook at the saree's exact colors, borders, patterns, and fabric.\nMEMORIZE every detail before generating.\n\n📸 POSE: Right hand resting on right hip, left arm at side, slight smile.\n\n✓ NOW GENERATE: Use the EXACT saree you just examined - same colors, same border width, same patterns, same fabric texture. DO NOT change ANY detail of the saree.",
        cameraAngle: "Front, eye-level"
      },
      {
        pose: "🚨 FIRST: EXAMINE THE UPLOADED SAREE IMAGE CAREFULLY 🚨\nLook at the saree's exact colors, borders, patterns, and fabric.\nMEMORIZE every detail before generating.\n\n📸 POSE: Left hand resting on left hip, right arm at side, confident look.\n\n✓ NOW GENERATE: Use the EXACT saree you just examined - same colors, same border width, same patterns, same fabric texture. DO NOT change ANY detail of the saree.",
        cameraAngle: "Front, eye-level"
      },
      {
        pose: "🚨 FIRST: EXAMINE THE UPLOADED SAREE IMAGE CAREFULLY 🚨\nLook at the saree's exact colors, borders, patterns, and fabric.\nMEMORIZE every detail before generating.\n\n📸 POSE: Both hands on hips, elbows out, strong confident stance.\n\n✓ NOW GENERATE: Use the EXACT saree you just examined - same colors, same border width, same patterns, same fabric texture. DO NOT change ANY detail of the saree.",
        cameraAngle: "Front, eye-level"
      },
      {
        pose: "🚨 FIRST: EXAMINE THE UPLOADED SAREE IMAGE CAREFULLY 🚨\nLook at the saree's exact colors, borders, patterns, and fabric.\nMEMORIZE every detail before generating.\n\n📸 POSE: Right hand gently touching pallu on right shoulder, left arm down.\n\n✓ NOW GENERATE: Use the EXACT saree you just examined - same colors, same border width, same patterns, same fabric texture. DO NOT change ANY detail of the saree.",
        cameraAngle: "Front, eye-level"
      },
      {
        pose: "🚨 FIRST: EXAMINE THE UPLOADED SAREE IMAGE CAREFULLY 🚨\nLook at the saree's exact colors, borders, patterns, and fabric.\nMEMORIZE every detail before generating.\n\n📸 POSE: Left hand adjusting pallu on left shoulder, right arm relaxed.\n\n✓ NOW GENERATE: Use the EXACT saree you just examined - same colors, same border width, same patterns, same fabric texture. DO NOT change ANY detail of the saree.",
        cameraAngle: "Front, eye-level"
      },
      {
        pose: "🚨 FIRST: EXAMINE THE UPLOADED SAREE IMAGE CAREFULLY 🚨\nLook at the saree's exact colors, borders, patterns, and fabric.\nMEMORIZE every detail before generating.\n\n📸 POSE: Both hands holding pallu edges at chest level displaying the design.\n\n✓ NOW GENERATE: Use the EXACT saree you just examined - same colors, same border width, same patterns, same fabric texture. DO NOT change ANY detail of the saree.",
        cameraAngle: "Front, eye-level"
      },
      {
        pose: "🚨 FIRST: EXAMINE THE UPLOADED SAREE IMAGE CAREFULLY 🚨\nLook at the saree's exact colors, borders, patterns, and fabric.\nMEMORIZE every detail before generating.\n\n📸 POSE: Right hand placed gently on chest center, left arm at side.\n\n✓ NOW GENERATE: Use the EXACT saree you just examined - same colors, same border width, same patterns, same fabric texture. DO NOT change ANY detail of the saree.",
        cameraAngle: "Front, eye-level"
      },
      {
        pose: "🚨 FIRST: EXAMINE THE UPLOADED SAREE IMAGE CAREFULLY 🚨\nLook at the saree's exact colors, borders, patterns, and fabric.\nMEMORIZE every detail before generating.\n\n📸 POSE: Both hands in namaste position at chest, peaceful expression.\n\n✓ NOW GENERATE: Use the EXACT saree you just examined - same colors, same border width, same patterns, same fabric texture. DO NOT change ANY detail of the saree.",
        cameraAngle: "Front, eye-level"
      },
      {
        pose: "🚨 FIRST: EXAMINE THE UPLOADED SAREE IMAGE CAREFULLY 🚨\nLook at the saree's exact colors, borders, patterns, and fabric.\nMEMORIZE every detail before generating.\n\n📸 POSE: Arms crossed comfortably at waist, relaxed sophisticated look.\n\n✓ NOW GENERATE: Use the EXACT saree you just examined - same colors, same border width, same patterns, same fabric texture. DO NOT change ANY detail of the saree.",
        cameraAngle: "Front, eye-level"
      }
    ];

    const currentPose = photoshootPoses[(photoIndex - 1) % photoshootPoses.length];

    // Use Gemini 3 Pro Image Preview for image generation
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3-pro-image-preview',
      generationConfig: {
        temperature: 0.0,  // Absolute zero for maximum consistency
        topP: 0.5,
        topK: 5,
        candidateCount: 1,
      }
    });

    const prompt = `TASK: Create professional photoshoot image ${photoIndex}/10 showing an Indian model wearing the EXACT saree from the uploaded image.

🎯 PRIMARY OBJECTIVE: EXACT SAREE REPLICATION
This is a COPY job, not a design job. Your ONLY task is to replicate the saree EXACTLY as shown in the uploaded image.

CRITICAL RULE - SAREE MUST BE IDENTICAL:
Think of this as scanning and reprinting the same saree in different poses. The saree colors, patterns, borders, fabric, and every detail must be EXACTLY the same as the uploaded image - just worn by a model in different poses.

STEP 1 - ANALYZE THE UPLOADED SAREE IMAGE:
Before generating, carefully examine the uploaded saree image and note:

COLOR EXTRACTION (Most Important):
- Main body color: Note the EXACT primary color (use specific color names: burgundy, navy, teal, mustard, etc.)
- Border color(s): Note ALL border colors in exact sequence
- If saree is plain/solid color → Generate plain/solid color (NO patterns)
- If saree is light colored → Generate light colored (NO darkening)
- If saree has patterns → Note exact pattern type and density
- If saree has NO patterns → Generate NO patterns

BORDER ANALYSIS (Critical):
- Does the saree have a border? YES or NO
- If YES: Border location (bottom/left/right/all sides)
- If YES: Border width (thin/medium/thick - measure relative to saree width)
- If YES: Border color (EXACT color match required)
- If YES: Border design (plain line/dual tone/patterned/zari work)
- If NO: Generate without border

FABRIC & TEXTURE:
- Fabric type: Cotton/Silk/Chiffon/Georgette/Synthetic
- Sheen level: Matte/Slight shine/Glossy/High shine
- Texture: Smooth/Textured/Woven pattern

STEP 2 - REPLICATION RULES (ZERO DEVIATION):
✓ Copy the EXACT color from uploaded image (no similar shades)
✓ Copy the EXACT border design (same width, color, pattern)
✓ Copy the EXACT pattern density (if original is sparse, keep sparse)
✓ Copy the EXACT fabric appearance (match sheen and texture)
✓ If saree is simple → Keep it simple
✓ If saree is plain → Keep it plain  
✓ If border is thin → Keep it thin
✓ If there's NO border → Don't add a border

PROHIBITIONS - NEVER DO THESE:
❌ DO NOT "enhance" or "improve" the saree
❌ DO NOT add decorations that aren't in the original
❌ DO NOT change colors to "better" shades
❌ DO NOT add patterns if original is plain
❌ DO NOT add borders if original has none
❌ DO NOT make borders thicker or more decorative
❌ DO NOT change fabric sheen or texture

STEP 3 - MODEL & POSE SETUP:

POSE ${photoIndex}/10:
${currentPose.pose}

Camera: ${currentPose.cameraAngle} (eye-level, full body visible, centered)

⚠️ FRAMING CRITICAL: DO NOT CUT THE HEAD - Entire head must be visible in frame from top to bottom

MODEL CONSISTENCY (SAME MODEL ACROSS ALL 10 PHOTOS):
- Indian/South Asian female model, age 25-28
- Professional model appearance
- Medium skin tone
Drape the saree on the model exactly as you observed from the uploaded image:
- Use the EXACT same colors (body + border)
- Use the EXACT same patterns (if any)
- Use the EXACT same border design (if present)
- Traditional Indian saree draping: Pleated at waist, pallu over left shoulder
- Ensure all saree details are clearly visible and well-lit
- Make the saree look professional and photoshoot-ready

KEY REMINDER:
- If uploaded saree is PLAIN → Generate PLAIN saree (no patterns)
- If uploaded saree is PATTERNED → Copy patterns exactly
- If uploaded saree has THIN border → Keep border thin
- If uploaded saree has NO border → Don't add a border
- Match the fabric sheen (matte vs glossy) from uploaded image

BEFORE FINALIZING, VERIFY:
✓ Saree color matches uploaded image (use color picker mentally)
✓ Border design matches uploaded image (width, color, pattern)
✓ Pattern density matches uploaded image (not more, not less)
✓ Fabric sheen matches uploaded image (matte/glossy)
✓ Model appears same as other photos (face consistency)
✓ ENTIRE HEAD is visible - NO cropping of head or hair
✓ Background is pure white
✓ Lighting is soft and even
✓ Full body is visible and centered (head to toe)
✓ Image is sharp and high quality (4K: 2160x3840)
✓ Full body is visible and centered
✓ Image is sharp and high quality (4K: 2160x3840)

PHOTOSHOOT CONTINUITY:
This is photo ${photoIndex} of 10 total photos. The saree and model must look IDENTICAL across all 10 shots - only the hand/arm pose changes.

Reference seed for model consistency: ${sessionSeed}

OUTPUT QUALITY:
- Resolution: 2160x3840 pixels (9:16 portrait, 4K quality)
- Sharp focus on entire saree
- Professional studio lighting
- Clean white background
- Magazine-quality finishplicate ALL details
   ❌ NO missing borders - if original has border, generated image MUST have it
   ❌ NO blurred or unclear borders - must be sharp and defined
   ❌ NO merged borders - border must be distinct from saree body
   ❌ NO wrong border placement - must be on correct edges
   ❌ NO border color fading - maintain original color intensity

6. FINAL BORDER VERIFICATION CHECKLIST:
   Before finalizing the image, verify:
   ✓ Border width matches original (measure against saree width)
   ✓ Border colors are IDENTICAL (no shade variations)
   ✓ Border pattern is complete and accurate
   ✓ Border is clearly visible and well-defined
   ✓ Border placement is correct (left/right/bottom edges)
   ✓ Border has same sheen/texture as original
   ✓ Border contrast with body is preserved
   ✓ Border details are sharp, not blurred

GENERATE: Professional photoshoot image ${photoIndex}/10 - Same model, same saree, different pose. Maintain EXACT model identity (seed: ${sessionSeed}) and EXACT saree design with perfect border preservation. Only the pose varies for photoshoot variety.

${customPrompt ? `\n🎯 ADDITIONAL INSTRUCTIONS:\n${customPrompt}\n` : ''}`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: image.type,
        },
      },
    ]);

    const response = await result.response;

    // Extract generated image from response
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('No response generated from Gemini');
    }

    const candidate = candidates[0];
    let imageUrl = null;
    let localImagePath = null;
    let analysisText = '';

    // Parse response parts for image data and text
    if (candidate.content && candidate.content.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          // Image returned as base64 inline data
          const imageData = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          
          // Save image locally
          const timestamp = Date.now();
          const extension = mimeType.split('/')[1] || 'png';
          const filename = `saree-${timestamp}.${extension}`;
          const publicPath = join(process.cwd(), 'public', 'generated', filename);
          
          // Convert base64 to buffer and save
          const imageBuffer = Buffer.from(imageData, 'base64');
          await writeFile(publicPath, imageBuffer);
          
          // Set both data URL and local path
          imageUrl = `data:${mimeType};base64,${imageData}`;
          localImagePath = `/generated/${filename}`;
        } else if (part.text) {
          analysisText += part.text;
        }
      }
    }

    // If no inline image, check if text contains a URL
    if (!imageUrl && analysisText) {
      const urlMatch = analysisText.match(/https?:\/\/[^\s)]+\.(png|jpg|jpeg|webp)/i);
      if (urlMatch) {
        imageUrl = urlMatch[0];
      }
    }
    
    return NextResponse.json({
      success: true,
      analysis: analysisText || 'Saree analyzed successfully',
      imageUrl: imageUrl,
      localPath: localImagePath,
      downloadUrl: localImagePath,
      hasImage: !!imageUrl,
      debug: {
        hasCandidates: !!candidates,
        candidateCount: candidates?.length || 0,
        parts: candidate.content?.parts?.map(p => Object.keys(p)) || [],
      }
    });

  } catch (error: unknown) {
    console.error('Error generating image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to generate image', details: errorMessage },
      { status: 500 }
    );
  }
}
