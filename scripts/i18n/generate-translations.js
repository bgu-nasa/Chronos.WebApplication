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
    dotenv.config({ path: path.join(projectRoot, ".local.env"), override: true });
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

/** Intl.DateTimeFormat option literals — must not be translated. */
const INTL_LITERAL_VALUES = new Set([
    "short",
    "long",
    "narrow",
    "numeric",
    "2-digit",
]);

function shouldPreserveLiteralString(value) {
    return typeof value === "string" && INTL_LITERAL_VALUES.has(value);
}

/** Matches `{{name}}` (i18next) and `{name}` (runtime .replace) placeholders. */
const PLACEHOLDER_PATTERN = /\{\{([^{}]+)\}\}|\{([^{}\s]+)\}/g;

const PLACEHOLDER_TOKEN_PREFIX = "__CHRNS_PH_";
const PLACEHOLDER_TOKEN_SUFFIX = "__";

/**
 * Replaces interpolation placeholders with opaque tokens before Azure translation.
 * @param {string} text
 * @returns {{ masked: string, placeholders: string[] }}
 */
function maskPlaceholders(text) {
    const placeholders = [];

    const masked = text.replace(PLACEHOLDER_PATTERN, (match) => {
        const index = placeholders.length;
        placeholders.push(match);
        return `${PLACEHOLDER_TOKEN_PREFIX}${index}${PLACEHOLDER_TOKEN_SUFFIX}`;
    });

    return { masked, placeholders };
}

/**
 * Restores original placeholders after translation.
 * @param {string} text
 * @param {string[]} placeholders
 * @returns {string}
 */
function unmaskPlaceholders(text, placeholders) {
    return text.replace(
        new RegExp(
            `${PLACEHOLDER_TOKEN_PREFIX}(\\d+)${PLACEHOLDER_TOKEN_SUFFIX}`,
            "g",
        ),
        (_match, indexText) => {
            const placeholder = placeholders[Number(indexText)];

            if (placeholder === undefined) {
                throw new Error(
                    `Translation output referenced unknown placeholder index ${indexText}: ${text}`,
                );
            }

            return placeholder;
        },
    );
}

function maskTextsForTranslation(texts) {
    return texts.map((text) => maskPlaceholders(text));
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

    const enJson = cloneJson(sourceJson);
    const heJson = cloneJson(sourceJson);

    const leavesToTranslate = [];
    const translateIndices = [];

    for (let index = 0; index < stringLeaves.length; index += 1) {
        const leaf = stringLeaves[index];

        if (shouldPreserveLiteralString(leaf.value)) {
            setByPath(enJson, leaf.pathTokens, leaf.value);
            setByPath(heJson, leaf.pathTokens, leaf.value);
            continue;
        }

        translateIndices.push(index);
        leavesToTranslate.push(leaf);
    }

    if (leavesToTranslate.length > 0) {
        const texts = leavesToTranslate.map((leaf) => leaf.value);
        const maskedTexts = maskTextsForTranslation(texts);
        const translatedMaskedTexts = await translateToHebrew(
            maskedTexts.map((entry) => entry.masked),
        );

        for (let index = 0; index < leavesToTranslate.length; index += 1) {
            const pathTokens = leavesToTranslate[index].pathTokens;
            setByPath(enJson, pathTokens, texts[index]);
            setByPath(
                heJson,
                pathTokens,
                unmaskPlaceholders(
                    translatedMaskedTexts[index],
                    maskedTexts[index].placeholders,
                ),
            );
        }
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

function isExecutedDirectly() {
    const entry = process.argv[1];

    if (!entry) {
        return false;
    }

    return path.resolve(entry) === path.resolve(__filename);
}

if (isExecutedDirectly()) {
    try {
        await run();
    } catch (error) {
        console.error("Failed to generate translations.");
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    }
}
