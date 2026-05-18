/**
 * pixelMatch.js — Canvas-based flag comparison utilities.
 *
 * Key design decisions:
 *  - All images are drawn onto a white background before reading pixels.
 *    This handles transparent flags (Vatican, Switzerland, Nepal…) uniformly.
 *  - We always normalise to CANVAS_W × CANVAS_H regardless of source aspect ratio.
 *  - A "mask" is a Uint8Array of length (width × height), where 1 = pixel revealed.
 *  - Masks accumulate across guesses: once a pixel is revealed it stays revealed.
 *
 * To tweak comparison sensitivity → change COLOR_THRESHOLD (default 45, range 0-441).
 * Lower = stricter matching; higher = more pixels revealed per guess.
 */

export const CANVAS_W = 320;
export const CANVAS_H = 213;
export const COLOR_THRESHOLD = 45; // Euclidean RGB distance

// ─── Image loading ────────────────────────────────────────────────────────────

/**
 * Loads an image from a URL and returns a promise<HTMLImageElement>.
 * Sets crossOrigin="anonymous" to avoid CORS taint issues with flagcdn.
 */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

// ─── Canvas helpers ───────────────────────────────────────────────────────────

/**
 * Creates an off-screen canvas, draws the image (stretched) on a white bg,
 * and returns the ImageData.
 */
export function getImageDataFromFlag(img, width = CANVAS_W, height = CANVAS_H) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // White background so transparent areas don't read as (0,0,0,0)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  return ctx.getImageData(0, 0, width, height);
}

// ─── Color math ──────────────────────────────────────────────────────────────

/**
 * Euclidean distance in RGB space (max ≈ 441.67).
 * @param {number[]} a  [r, g, b]
 * @param {number[]} b  [r, g, b]
 */
export function colorDistance(a, b) {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

// ─── Mask operations ─────────────────────────────────────────────────────────

/**
 * Compares each pixel of two ImageData objects.
 * Returns a Uint8Array mask: 1 where colors are within threshold, 0 otherwise.
 */
export function compareFlags(targetData, guessData, threshold = COLOR_THRESHOLD) {
  const total = targetData.width * targetData.height;
  const mask = new Uint8Array(total);

  for (let i = 0; i < total; i++) {
    const idx = i * 4;
    const tPx = [targetData.data[idx], targetData.data[idx + 1], targetData.data[idx + 2]];
    const gPx = [guessData.data[idx],  guessData.data[idx + 1],  guessData.data[idx + 2]];
    mask[i] = colorDistance(tPx, gPx) < threshold ? 1 : 0;
  }

  return mask;
}

/**
 * Merges two masks with OR logic — revealed pixels stay revealed.
 */
export function mergeMasks(prevMask, newMask) {
  const merged = new Uint8Array(prevMask.length);
  for (let i = 0; i < prevMask.length; i++) {
    merged[i] = prevMask[i] | newMask[i];
  }
  return merged;
}

/**
 * Returns the fraction of revealed pixels as a percentage (0–100).
 */
export function calculateMatchPercentage(mask) {
  if (!mask || mask.length === 0) return 0;
  let revealed = 0;
  for (let i = 0; i < mask.length; i++) {
    if (mask[i]) revealed++;
  }
  return Math.round((revealed / mask.length) * 100);
}

// ─── Drawing revealed flag ────────────────────────────────────────────────────

/**
 * Renders the target flag onto `canvas`, but only paints pixels where the
 * mask is 1. The rest stays as the background colour (dark).
 *
 * @param {HTMLCanvasElement} canvas   The visible canvas on screen
 * @param {ImageData}         targetImageData  Full flag image data
 * @param {Uint8Array}        mask             Current reveal mask
 * @param {string}            bgColor          Background for hidden pixels
 */
export function drawRevealedFlag(canvas, targetImageData, mask, bgColor = "#12141a") {
  const ctx = canvas.getContext("2d");
  const { width, height } = targetImageData;

  canvas.width = width;
  canvas.height = height;

  // Start with background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Build a fresh ImageData from target, but zero-alpha for hidden pixels
  const output = ctx.createImageData(width, height);
  for (let i = 0; i < mask.length; i++) {
    const idx = i * 4;
    if (mask[i]) {
      output.data[idx]     = targetImageData.data[idx];
      output.data[idx + 1] = targetImageData.data[idx + 1];
      output.data[idx + 2] = targetImageData.data[idx + 2];
      output.data[idx + 3] = 255;
    }
    // else: leave transparent (background shows through)
  }
  ctx.putImageData(output, 0, 0);
}
