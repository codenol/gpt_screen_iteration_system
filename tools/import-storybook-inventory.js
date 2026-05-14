import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const uikitDir = path.join(rootDir, "uikit-main");
const outputPath = path.join(rootDir, "protocol", "uikit-inventory.json");

function scanComponents(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const components = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".")) continue;
    if (["app", "assets", "context", "hook", "styles", "types", "utils", "tests", ".gitlab"].includes(entry.name)) continue;

    const indexPath = path.join(dir, entry.name, "index.ts");
    const tsxPath = path.join(dir, entry.name, `${entry.name}.tsx`);

    if (fs.existsSync(indexPath)) {
      const componentFiles = fs.readdirSync(path.join(dir, entry.name))
        .filter((f) => f.endsWith(".tsx") || f.endsWith(".ts") || f.endsWith(".scss") || f.endsWith(".css"));

      components.push({
        name: entry.name,
        path: `uikit-main/${entry.name}`,
        indexExport: fs.existsSync(indexPath),
        componentFile: fs.existsSync(tsxPath),
        files: componentFiles
      });
    }
  }

  return components;
}

const components = scanComponents(uikitDir);
const inventory = {
  source: "uikit-main",
  generatedAt: new Date().toISOString(),
  totalComponents: components.length,
  components
};

fs.writeFileSync(outputPath, JSON.stringify(inventory, null, 2));
console.log(`Generated uikit-inventory.json: ${inventory.totalComponents} components found`);
