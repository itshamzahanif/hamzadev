export function isHeadlessBot(): boolean {
  if (typeof window === "undefined") return true;

  const ua = navigator.userAgent.toLowerCase();

  // 1. Direct UA check for legacy/unmasked headless Chrome
  if (ua.includes("headlesschrome") || ua.includes("phantomjs")) {
    return true;
  }

  // 2. WebDriver automation flag
  if (navigator.webdriver) {
    return true;
  }

  // 3. Screen or window dimension anomalies
  if (window.outerWidth === 0 && window.outerHeight === 0) {
    return true;
  }

  // 4. Missing browser languages
  if (!navigator.languages || navigator.languages.length === 0) {
    return true;
  }

  // 5. Software WebGL rendering check (SwiftShader / Virtualized GPU)
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;

    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        const renderer = gl
          .getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
          .toLowerCase();
        if (
          renderer.includes("swiftshader") ||
          renderer.includes("llvmpipe") ||
          renderer.includes("virtualbox")
        ) {
          return true; // Virtualized cloud GPU used by server scrapers
        }
      }
    }
  } catch (e) {
    // Ignore canvas execution errors
  }

  return false;
}
