import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..", "..");

function toResourceKey(absolutePath) {
    const rel = path.relative(projectRoot, absolutePath).split(path.sep).join("/");
    if (rel.startsWith("src/")) {
        return rel;
    }
    return `src/${rel}`;
}

async function convertFile(filePath) {
    let content = await readFile(filePath, "utf8");
    const importMatch = content.match(
        /^import resources from ["'](.+?)["'];?\s*$/m,
    );

    if (!importMatch) {
        return false;
    }

    let importPath = importMatch[1];
    if (importPath.startsWith("@/")) {
        importPath = importPath.replace("@/", "src/");
    } else if (importPath.startsWith(".")) {
        importPath = path
            .relative(
                projectRoot,
                path.resolve(path.dirname(filePath), importPath),
            )
            .split(path.sep)
            .join("/");
    }

    const resourceKey = toResourceKey(
        path.resolve(projectRoot, importPath),
    );
    const jsonFileName = path.basename(importPath);

    const replacement = `import resourcesJson from "${importMatch[1]}";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources(
    "${resourceKey}",
    resourcesJson,
);`;

    content = content.replace(importMatch[0], replacement);
    await writeFile(filePath, content, "utf8");
    return true;
}

const targets = process.argv.slice(2);
let converted = 0;

for (const target of targets) {
    const absolute = path.resolve(projectRoot, target);
    if (await convertFile(absolute)) {
        converted += 1;
        console.log(`converted: ${target}`);
    }
}

console.log(`done: ${converted} files`);
