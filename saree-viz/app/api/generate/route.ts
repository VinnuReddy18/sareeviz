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
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    const base64Image = await fileToBase64(image);

    // Define 10 DISTINCTLY DIFFERENT photoshoot poses for variety
    const photoshootPoses = [
      {
        pose: "POSE 1: Full frontal stance - Standing perfectly straight facing camera, feet together, both arms hanging naturally at sides, neutral elegant expression, looking directly at camera. Head straight, shoulders back.",
        cameraAngle: "Direct front view, 0 degrees"
      },
      {
        pose: "POSE 2: Right quarter turn - Body turned 45 degrees to the right, face looking back at camera over right shoulder, right hand gracefully holding pallu near shoulder, left arm extended slightly downward showing saree drape.",
        cameraAngle: "Three-quarter right side view"
      },
      {
        pose: "POSE 3: Left hip hand pose - Facing front, left hand placed confidently on left hip (elbow out), right hand gently touching pallu end, slight smile, chin slightly lifted, weight on right leg.",
        cameraAngle: "Straight front with attitude"
      },
      {
        pose: "POSE 4: Pallu display spread - Facing camera, both hands holding pallu wide open horizontally at chest level to display full pallu design, arms extended to sides, proud expression.",
        cameraAngle: "Front view, pallu showcase"
      },
      {
        pose: "POSE 5: Walking forward motion - Left leg forward in walking stance, right leg back, right hand lifting saree slightly (showing border), left hand holding pallu, dynamic forward movement, confident smile.",
        cameraAngle: "Front diagonal, capturing motion"
      },
      {
        pose: "POSE 6: Side profile elegance - Complete side profile (90 degrees), left side facing camera, right hand adjusting hair near ear, left hand holding pallu drape, serene side face expression.",
        cameraAngle: "Perfect side profile, 90 degrees"
      },
      {
        pose: "POSE 7: Twisting back look - Back three-quarter view, body 135 degrees away from camera, head turned looking back over left shoulder at camera, both hands adjusting pallu on back, mysterious smile.",
        cameraAngle: "Back three-quarter view"
      },
      {
        pose: "POSE 8: Border showcase squat - Standing but leaning forward slightly, both hands lifting saree bottom edges outward to prominently display border design, looking down at the border detail, focused expression.",
        cameraAngle: "Front view, slightly elevated camera"
      },
      {
        pose: "POSE 9: Traditional namaste - Perfect frontal, both palms together in namaste gesture at chest center, eyes closed peacefully or soft gaze downward, serene spiritual expression, centered and balanced.",
        cameraAngle: "Direct centered front"
      },
      {
        pose: "POSE 10: Twirl motion freeze - Captured mid-gentle-twirl, body slightly turned right, pallu flowing outward from motion, both arms gracefully extended out, joyful laughing expression, hair slightly in motion.",
        cameraAngle: "Front-right capturing movement"
      }
    ];

    const currentPose = photoshootPoses[(photoIndex - 1) % photoshootPoses.length];

    // Use Gemini 3 Pro Image Preview for image generation
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3-pro-image-preview',
      generationConfig: {
        temperature: 0.02,  // Extremely low for maximum saree consistency
        topP: 0.7,
        topK: 10,
        candidateCount: 1,
      }
    });

    const prompt = `ANALYZE AND REPLICATE: You are a precision image generator. Study this saree image and create an EXACT replica worn by a model.

CRITICAL REQUIREMENTS - ZERO TOLERANCE FOR DEVIATION:

1. ORIENTATION & FRAMING (MANDATORY):
   - Model MUST be standing UPRIGHT (vertical orientation)
   - Camera angle: STRAIGHT-ON, eye-level shot
   - NO tilted, angled, or rotated shots
   - NO side poses, lying down, or unusual angles
   - PORTRAIT orientation ONLY (vertical frame)
   - Model centered in frame, feet at bottom, head at top

2. SAREE ANALYSIS - REPLICATE EXACTLY:
   
   ⚠️ BORDER EXAMINATION (HIGHEST PRIORITY - MUST BE PIXEL-PERFECT):
   Step 1: Identify border placement
   - Is there a border on the bottom edge? LEFT edge? RIGHT edge? All edges?
   - Document EXACT width of border in centimeters/inches
   - Note if border is single-line, double-line, or multi-layered
   
   Step 2: Extract border colors with EXTREME precision
   - PRIMARY border color: Extract exact RGB/hex value - NOT approximate
   - SECONDARY border color(s): If multiple colors, list ALL in exact order
   - TERTIARY colors: Gold/silver zari, contrast threads, outline colors
   - Color sequence: Document top-to-bottom or inside-to-outside color order
   - NO COLOR SUBSTITUTION: Must use EXACT shades, not similar ones
   
   Step 3: Border design pattern analysis
   - Pattern type: Solid line / Floral motifs / Geometric shapes / Paisley / Temple border / Checks / Waves / Traditional motifs
   - Pattern density: Sparse / Medium / Dense / Continuous
   - Pattern size: Small (1-2cm) / Medium (3-5cm) / Large (6cm+)
   - Repeat interval: How often does the pattern repeat?
   - Embroidery style: Flat / Raised / Zari work / Threadwork / Sequins
   - Border texture: Smooth / Textured / Embossed / Woven
   
   Step 4: Border-to-body contrast
   - Color contrast level: High / Medium / Low / Monochrome
   - Is border same material as body or different?
   - Does border have different sheen level than body?
   
   ⚠️ BORDER GENERATION RULES (NON-NEGOTIABLE):
   ✓ Border width MUST match original (measure in relation to total saree width)
   ✓ Border colors MUST be IDENTICAL - zero tolerance for shade variations
   ✓ Border pattern MUST replicate exactly - count motifs if needed
   ✓ Border placement MUST be accurate - left/right/bottom edges
   ✓ Border should be CLEARLY VISIBLE in the generated image
   ✓ Ensure border is sharp, well-defined, not blurred or merged with body
   ✓ Maintain border color saturation and intensity from original
   
   BODY COLOR: 
   - Extract EXACT hex/RGB color values from the main saree body
   - Note primary color and any secondary/accent colors
   - Percentage distribution of each color in the design
   - Color saturation level: Muted / Vibrant / Pastel / Deep
   
   PATTERNS & MOTIFS:
   - Map every single pattern: floral/geometric/paisley/abstract/traditional
   - Document pattern size, spacing, and repetition frequency
   - Note contrast between motifs and background
   - Identify thread type: zari (gold/silver), colored silk thread, plain cotton
   - Pattern density: How closely packed are the designs?
   
   PALLU (End Piece):
   - Design complexity: simple/moderate/heavily decorated
   - Contrast with main body: same/different/highly contrasted
   - Pattern style on pallu vs body (same or different?)
   - Pallu border: Does it have additional border? What design?
   - Length and draping style visible
   
   FABRIC:
   - Material identification: silk/cotton/chiffon/georgette/synthetic blend
   - Sheen level: matte/semi-matte/glossy/high-shine/metallic
   - Texture: smooth/textured/ribbed/jacquard/brocade
   - Opacity: transparent/semi-transparent/opaque

3. GENERATION CONSTRAINTS (MUST FOLLOW):
   
   🎬 PHOTOSHOOT POSE FOR THIS SHOT (Photo ${photoIndex}/10):
   ${currentPose.pose}
   Camera Angle: ${currentPose.cameraAngle}
   
   ⚠️ CRITICAL: THIS IS THE **ONLY** VARIATION ALLOWED - POSE AND ANGLE ONLY!
   Everything else (model face, saree design, colors, borders, patterns) MUST be IDENTICAL to other 9 photos.
   
   MODEL IDENTITY (CRITICAL - MUST BE IDENTICAL IN ALL 10 SHOTS):
   Reference Seed: ${sessionSeed}
   - EXACT SAME FACE in every generation (use seed for consistency)
   - Same Indian/South Asian female model, age 27
   - Same medium-warm skin tone (#C68642 reference)
   - Same facial features: oval face, almond eyes, defined cheekbones
   - Same height appearance: 5'6"
   - Same body type: professional model physique, slender build
   - Same model identity across ALL 10 photoshoot images
   
   STYLING (LOCKED - ZERO VARIATION ACROSS ALL 10 SHOTS):
   - Hair: EXACT same neat low bun with side part (reference: classic Indian bridal bun)
   - Jewelry: ONLY small gold stud earrings + 4 thin gold bangles on each wrist
   - Makeup: Natural professional (nude pink lips, subtle brown eyeshadow, filled brows, natural blush)
   - Expression: Warm, confident, gentle smile with direct eye contact
   - NO variation in hair, jewelry, or makeup across the 10 shots
   
   🚨 SAREE PRESERVATION (ZERO TOLERANCE FOR CHANGES):
   
   DO NOT MODIFY ANYTHING ABOUT THE SAREE:
   ❌ DO NOT add new patterns or motifs that aren't in the original
   ❌ DO NOT enhance or embellish the design
   ❌ DO NOT add extra borders or decorative elements
   ❌ DO NOT change pattern density or spacing
   ❌ DO NOT modify embroidery details
   ❌ DO NOT alter fabric texture or sheen
   ❌ DO NOT add sequins, beads, or stones if not in original
   ❌ DO NOT change pallu design or complexity
   
   COPY THE SAREE EXACTLY AS-IS:
   ✓ Use EXACT same body color from original image
   ✓ Use EXACT same border color, width, and pattern
   ✓ Use EXACT same pallu design and contrast
   ✓ Use EXACT same pattern density and placement
   ✓ Use EXACT same fabric texture visible in original
   ✓ Copy every detail WITHOUT interpretation or enhancement
   ✓ If original is simple, keep it simple - NO additions
   ✓ If original is plain, keep it plain - NO decorations
   
   REMEMBER: This is PHOTO ${photoIndex} of a continuous photoshoot.
   The saree design MUST be pixel-perfect identical across all 10 photos.
   Only body pose and camera angle change - NOTHING on the saree changes.
   
   CAMERA & LIGHTING (CONSISTENT ACROSS ALL 10 SHOTS):
   - FIXED camera position: eye-level, centered
   - Lens: 85mm portrait focal length
   - Distance: Full body visible (head to toe)
   - Background: Pure white (#FFFFFF) - NO variations across shots
   - Lighting: Soft, even studio lighting (no harsh shadows)
   - Color accuracy: TRUE to original saree colors
   - Focus: Entire saree sharp and clear
   - SPECIAL: Extra focus on border areas to show border details clearly
   - Ensure border is well-lit and visible, not in shadow
   
   IMAGE QUALITY:
   - Resolution: 1024x1536 (2:3 aspect ratio, portrait)
   - File format: PNG for color accuracy
   - No blur, no noise, no artifacts
   - Professional catalog-quality output
   - Border region must be in sharp focus

4. PHOTOSHOOT CONTINUITY ENFORCEMENT:
   
   MUST BE IDENTICAL ACROSS ALL 10 PHOTOSHOOT IMAGES:
   ✓ Model's EXACT same face (use seed: ${sessionSeed})
   ✓ Same model height, build, and body type
   ✓ Same skin tone and facial features
   ✓ Same camera setup and distance
   ✓ Same lighting configuration
   ✓ Same pure white background
   ✓ Same hair style (low bun)
   ✓ Same jewelry (gold studs + bangles)
   ✓ Same makeup style
   ✓ Same saree design, colors, patterns, and borders
   
   VARIATIONS ALLOWED (Creating photoshoot variety):
   ✓ Pose/body position (as specified for photo ${photoIndex})
   ✓ Hand placement and gestures
   ✓ Body rotation/angle (as specified in camera angle)
   ✓ Facial expression variations (always warm and professional)
   
   CRITICAL: This is photo ${photoIndex} of a 10-image professional photoshoot sequence.
   The model and saree MUST remain identical. Only the pose changes.

5. ABSOLUTE PROHIBITIONS:
   ❌ NO color deviations - use EXACT RGB values from original saree
   ❌ NO pattern modifications - copy exactly, don't enhance or simplify
   ❌ NO added decorations - if not in original, don't add it
   ❌ NO border changes - exact width, color, and design only
   ❌ NO fabric texture changes - match original material exactly
   ❌ NO different models - same face (seed: ${sessionSeed}) every time
   ❌ NO background variations - pure white only
   ❌ NO styling changes - same hair, makeup, jewelry
   ❌ NO saree "improvements" - copy as-is, flaws and all
   ❌ NO creative interpretation of the saree design
   ❌ NO adding complexity to simple designs
   ❌ NO enhancing plain areas with patterns
   ❌ NO making simple sarees look more elaborate
   
   🚨 BORDER-SPECIFIC PROHIBITIONS (CRITICAL):
   ❌ NO border color changes - must be EXACT match
   ❌ NO border width alterations - preserve original proportions
   ❌ NO border pattern simplification - replicate ALL details
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

GENERATE: Professional photoshoot image ${photoIndex}/10 - Same model, same saree, different pose. Maintain EXACT model identity (seed: ${sessionSeed}) and EXACT saree design with perfect border preservation. Only the pose varies for photoshoot variety.`;

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
