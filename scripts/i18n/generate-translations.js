import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..");
const outputBaseDir = path.join(projectRoot, "src", "infra", "i18n", "locales");

const requiredEnv = [
    "AZURE_TRANSLATOR_KEY",
    "AZURE_TRANSLATOR_REGION",
    "AZURE_TRANSLATOR_ENDPOINT",
];

function assertRequiredEnv() {
    const missing = requiredEnv.filter((name) => !process.env[name]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required env vars for translation generation: ${missing.join(", ")}`,
        );
    }
}

function loadLocalEnvironment() {
    dotenv.config({ path: path.join(projectRoot, ".env") });
    dotenv.config({ path: path.join(projectRoot, ".env.local"), override: true });
}

async function findResourceFiles(dirPath) {
    const entries = await readdir(dirPath, { withFileTypes: true });
    const result = [];

    for (const entry of entries) {
        if (entry.name === "node_modules" || entry.name === "dist") {
            continue;
        }

        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            const childFiles = await findResourceFiles(fullPath);
            result.push(...childFiles);
            continue;
        }

        if (entry.isFile() && entry.name.endsWith(".resources.json")) {
            result.push(fullPath);
        }
    }

    return result;
}

function collectStringLeaves(node, pathTokens = []) {
    if (typeof node === "string") {
        return [{ pathTokens, value: node }];
    }

    if (Array.isArray(node)) {
        return node.flatMap((item, index) =>
            collectStringLeaves(item, [...pathTokens, index]),
        );
    }

    if (node && typeof node === "object") {
        return Object.entries(node).flatMap(([key, value]) =>
            collectStringLeaves(value, [...pathTokens, key]),
        );
    }

    return [];
}

function cloneJson(value) {
    return structuredClone(value);
}

function setByPath(target, pathTokens, value) {
    let cursor = target;

    for (let index = 0; index < pathTokens.length - 1; index += 1) {
        cursor = cursor[pathTokens[index]];
    }

    cursor[pathTokens[pathTokens.length - 1]] = value;
}

async function translateToHebrew(texts) {
    const endpoint = process.env.AZURE_TRANSLATOR_ENDPOINT;
    const key = process.env.AZURE_TRANSLATOR_KEY;
    const region = process.env.AZURE_TRANSLATOR_REGION;

    const body = texts.map((text) => ({ Text: text }));

    const endpointBase = endpoint.endsWith("/") ? endpoint : `${endpoint}/`;
    const candidateUrls = [
        new URL("translate", endpointBase),
        new URL("translator/text/v3.0/translate", endpointBase),
    ];

    for (const candidateUrl of candidateUrls) {
        candidateUrl.searchParams.set("api-version", "3.0");
        candidateUrl.searchParams.set("from", "en");
        candidateUrl.searchParams.set("to", "he");
    }

    const buildHeaders = (includeRegion) => {
        const headers = {
            "Ocp-Apim-Subscription-Key": key,
            "Content-Type": "application/json",
            "X-ClientTraceId": randomUUID(),
        };

        if (includeRegion && region) {
            headers["Ocp-Apim-Subscription-Region"] = region;
        }

        return headers;
    };

    const sendRequest = async (requestUrl, includeRegion) => {
        return fetch(requestUrl, {
            method: "POST",
            headers: buildHeaders(includeRegion),
            body: JSON.stringify(body),
        });
    };

    let lastErrorText = "";
    let lastStatus = 0;
    let lastUrl = "";

    for (const candidateUrl of candidateUrls) {
        lastUrl = candidateUrl.toString();
        let response = await sendRequest(candidateUrl, true);

        if (response.status === 401 && region) {
            response = await sendRequest(candidateUrl, false);
        }

        lastStatus = response.status;

        if (response.ok) {
            const data = await response.json();

            if (!Array.isArray(data) || data.length !== texts.length) {
                throw new Error("Unexpected Azure Translator response shape.");
            }

            return data.map((item) => {
                const translatedText = item?.translations?.[0]?.text;

                if (typeof translatedText !== "string") {
                    throw new TypeError(
                        "Unexpected Azure Translator translation item shape.",
                    );
                }

                return translatedText;
            });
        }

        lastErrorText = await response.text();
    }

    throw new Error(
        `Azure Translator request failed (${lastStatus}) for ${lastUrl}: ${lastErrorText}`,
    );
}

function getTranslationNamespaceFromResourcePath(sourceFilePath) {
    const normalizedPath = path
        .relative(projectRoot, sourceFilePath)
        .split(path.sep)
        .join("/");

    const modulePageMatch = normalizedPath.match(
        /^src\/modules\/([^/]+)\/src\/pages\/([^/]+)\//,
    );

    if (modulePageMatch) {
        return `${modulePageMatch[1]}.${modulePageMatch[2]}`;
    }

    const moduleMatch = normalizedPath.match(/^src\/modules\/([^/]+)\//);

    if (moduleMatch) {
        return moduleMatch[1];
    }

    const filename = path
        .basename(sourceFilePath)
        .replace(/\.resources\.json$/, "")
        .replace(/\.json$/, "");

    return filename;
}

function getOutputPath(locale, sourceFilePath) {
    const namespace = getTranslationNamespaceFromResourcePath(sourceFilePath);
    const generatedFileName = path
        .basename(sourceFilePath)
        .replace(/\.resources\.json$/, ".generated.json");

    return path.join(outputBaseDir, locale, namespace, generatedFileName);
}

async function writeJson(filePath, content) {
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, `${JSON.stringify(content, null, 4)}\n`, "utf8");
}

async function processResourceFile(resourceFilePath) {
    const rawContent = await readFile(resourceFilePath, "utf8");
    const sourceJson = JSON.parse(rawContent);
    const stringLeaves = collectStringLeaves(sourceJson);

    const outputEnPath = getOutputPath("en", resourceFilePath);
    const outputHePath = getOutputPath("he", resourceFilePath);

    if (stringLeaves.length === 0) {
        await Promise.all([
            writeJson(outputEnPath, sourceJson),
            writeJson(outputHePath, sourceJson),
        ]);
        return;
    }

    const texts = stringLeaves.map((leaf) => leaf.value);
    const translatedTexts = await translateToHebrew(texts);

    const enJson = cloneJson(sourceJson);
    const heJson = cloneJson(sourceJson);

    for (let index = 0; index < stringLeaves.length; index += 1) {
        const pathTokens = stringLeaves[index].pathTokens;
        setByPath(enJson, pathTokens, texts[index]);
        setByPath(heJson, pathTokens, translatedTexts[index]);
    }

    await Promise.all([
        writeJson(outputEnPath, enJson),
        writeJson(outputHePath, heJson),
    ]);
}

async function run() {
    loadLocalEnvironment();
    assertRequiredEnv();

    const resourceFiles = await findResourceFiles(projectRoot);

    if (resourceFiles.length === 0) {
        throw new Error("No .resources.json files found in project.");
    }

    for (const resourceFilePath of resourceFiles) {
        await processResourceFile(resourceFilePath);
    }

    console.log(`Generated translation files for ${resourceFiles.length} resources files.`);
}

try {
    await run();
} catch (error) {
    console.error("Failed to generate translations.");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
}
