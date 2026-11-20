import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "../app/manifest";

const root = path.resolve(__dirname, "../..");
const read = (p: string) => fs.readFileSync(path.join(root, p), "utf8");
const m = manifest();

/** Width and height from a PNG header. */
function pngSize(file: string) {
  const buf = fs.readFileSync(path.join(root, "public", file));
  if (buf.toString("ascii", 1, 4) !== "PNG") throw new Error(`${file} is not a PNG`);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

describe("web app manifest", () => {
  it("is installable: name, start URL, standalone display", () => {
    expect(m.name).toBe("CUORE");
    expect(m.start_url).toBe("/");
    expect(m.display).toBe("standalone");
  });

  it("has 192 and 512 px PNG icons whose files exist and match the declared size", () => {
    for (const size of [192, 512]) {
      const icon = m.icons?.find((i) => i.sizes === `${size}x${size}`);
      expect(icon, `${size}px icon`).toBeDefined();
      expect(icon?.type).toBe("image/png");
      expect(pngSize(icon!.src)).toEqual({ width: size, height: size });
    }
  });

  it("uses the same theme colour as the app", () => {
    expect(read("src/app/layout.tsx")).toContain(`themeColor: "${m.theme_color}"`);
  });
});

describe("service worker (public/sw.js)", () => {
  const sw = read("public/sw.js");

  it("precaches the start page, About, Model card and the three QR pages, all of which exist as routes", () => {
    const listed = /const PAGES = \[([\s\S]*?)\]/.exec(sw)?.[1].match(/"[^"]+"/g)?.map((s) => s.slice(1, -1)) ?? [];
    expect(listed).toEqual(["/", "/about", "/model", "/cup/s", "/cup/m", "/cup/l"]);
    for (const p of ["src/app/page.tsx", "src/app/about/page.tsx", "src/app/model/page.tsx", "src/app/cup/[variant]/page.tsx"]) {
      expect(fs.existsSync(path.join(root, p)), p).toBe(true);
    }
  });

  it("only touches GET requests from its own origin, so no answers or other user data can be cached", () => {
    expect(sw).toMatch(/request\.method !== "GET"\) return/);
    expect(sw).toMatch(/url\.origin !== self\.location\.origin\) return/);
  });

  it("uses no browser storage and contacts no other host", () => {
    expect(sw).not.toMatch(/localStorage|sessionStorage|indexedDB|sendBeacon|XMLHttpRequest/);
    expect(sw).not.toMatch(/https?:\/\//);
  });

  it("drops caches from older builds on activate", () => {
    expect(sw).toMatch(/key\.startsWith\("cuore-"\) && key !== CACHE/);
  });

  it("is served without an HTTP cache and registered per build", () => {
    const config = read("next.config.ts");
    expect(config).toMatch(/source: "\/sw\.js"/);
    expect(config).toMatch(/no-cache, no-store, must-revalidate/);
    expect(read("src/components/ServiceWorkerRegister.tsx")).toContain("/sw.js?v=");
  });

  it("does not register in development", () => {
    expect(read("src/components/ServiceWorkerRegister.tsx")).toMatch(/NODE_ENV !== "production"/);
  });
});
