import { chromium } from "playwright";
import { existsSync } from "node:fs";

const URL = process.env.GLOBE_VERIFY_URL ?? "http://127.0.0.1:5173/";
const localChromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const viewports = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

async function checkCanvas(page, name) {
  const canvas = page.locator(".globe-map canvas").first();
  await canvas.waitFor({ state: "visible", timeout: 15000 });
  await page.waitForTimeout(1800);

  const result = await canvas.evaluate(node => {
    const gl = node.getContext("webgl2") ?? node.getContext("webgl");
    if (!gl) return { ok: false, reason: "No WebGL context" };

    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    const pixels = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    let colored = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];
      if (a > 0 && r + g + b > 32) colored++;
    }

    return {
      ok: colored > 1000,
      width,
      height,
      colored,
    };
  });

  if (!result.ok) {
    throw new Error(`${name} globe canvas did not render: ${JSON.stringify(result)}`);
  }

  await page.screenshot({
    path: `/private/tmp/globe-${name}.png`,
    fullPage: true,
  });

  console.log(`${name}: ${result.width}x${result.height}, colored pixels ${result.colored}`);
}

const browser = await chromium.launch({
  headless: true,
  executablePath: existsSync(localChromePath) ? localChromePath : undefined,
});

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    await page.goto(URL, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /Globle/i }).click();
    await page.getByRole("button", { name: "Diario" }).click();
    await page.getByText(/Diario \d{4}-\d{2}-\d{2}/).waitFor({ timeout: 5000 });
    await page.getByRole("button", { name: "Práctica" }).click();
    const labelToggle = page.getByRole("button", { name: /Ocultar nombres/i });
    await labelToggle.click();
    await page.getByRole("button", { name: /Mostrar nombres/i }).waitFor({ timeout: 5000 });
    await page.getByRole("button", { name: /Mostrar nombres/i }).click();
    await page.getByRole("button", { name: /Ocultar nombres/i }).waitFor({ timeout: 5000 });
    await checkCanvas(page, viewport.name);
    await page.close();
  }
} finally {
  await browser.close();
}
