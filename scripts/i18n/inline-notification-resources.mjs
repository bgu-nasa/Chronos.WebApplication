import { readFile, writeFile } from "node:fs/promises";
import { glob } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..", "..");

const NOTIFICATION_BLOCK = `import notificationResourcesJson from "@/infra/service/notification/notification.resources.json";

const notificationResources = translatedResources(
    "src/infra/service/notification/notification.resources.json",
    notificationResourcesJson,
);`;

async function findFiles() {
    const { execSync } = await import("node:child_process");
    try {
        const out = execSync(
            'git grep -l "sharedNotifications" -- "src/**/*.ts" "src/**/*.tsx"',
            { cwd: projectRoot, encoding: "utf8" },
        );
        return out.trim().split("\n").filter(Boolean);
    } catch {
        return [];
    }
}

async function processFile(relativePath) {
    const filePath = path.join(projectRoot, relativePath);
    let content = await readFile(filePath, "utf8");

    if (!content.includes("sharedNotifications")) {
        return false;
    }

    content = content.replace(
        /import \{ sharedNotifications \} from "@\/infra\/service\/notification";\r?\n/g,
        "",
    );

    if (!content.includes("notificationResourcesJson")) {
        if (content.includes('from "@/infra/i18n"')) {
            content = content.replace(
                /(import \{ translatedResources \} from "@\/infra\/i18n";)\r?\n/,
                `$1\n${NOTIFICATION_BLOCK}\n`,
            );
        } else {
            content = content.replace(
                /^/,
                `import { translatedResources } from "@/infra/i18n";\n${NOTIFICATION_BLOCK}\n\n`,
            );
        }
    }

    content = content.replaceAll("sharedNotifications.", "notificationResources.");

    await writeFile(filePath, content, "utf8");
    return true;
}

const files = process.argv.slice(2).length
    ? process.argv.slice(2)
    : await findFiles();

let count = 0;
for (const file of files) {
    if (await processFile(file)) {
        count += 1;
        console.log(`updated: ${file}`);
    }
}

console.log(`done: ${count} files`);
