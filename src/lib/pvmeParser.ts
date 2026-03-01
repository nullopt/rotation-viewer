import { Ability, ParsedGuide, Phase, RotationLine, RotationToken } from "./types";

const EMOJI_PATTERN = /<:([^:]+):(\d+)>/g;
const HEADING_PATTERN = /^(#{1,6})\s+(.+)$/;
const PVME_DIRECTIVE_PATTERN = /^\.(tag|img|embed|pin):/;
const DISCORD_CDN_BASE = "https://cdn.discordapp.com/emojis";

function stripUnderscoreFormatting(text: string): string {
    return text.replace(/^__(.+)__$/, "$1");
}

function getHeadingLevel(line: string): { level: number; text: string } | null {
    const match = line.match(HEADING_PATTERN);
    if (!match) return null;
    return { level: match[1].length, text: stripUnderscoreFormatting(match[2].trim()) };
}

function buildAbility(name: string, emojiId: string): Ability {
    return {
        name,
        emojiId,
        imageUrl: `${DISCORD_CDN_BASE}/${emojiId}.png?v=1`,
    };
}

function detectStallRelease(line: string, matchIndex: number): "stall" | "release" | undefined {
    if (matchIndex === 0) return undefined;
    const charBefore = line[matchIndex - 1];
    if (charBefore !== "s" && charBefore !== "r") return undefined;

    const isStandalone = matchIndex === 1 || /[\s→+]/.test(line[matchIndex - 2]);
    if (!isStandalone) return undefined;

    return charBefore === "s" ? "stall" : "release";
}

function tokenizeLine(line: string): RotationToken[] {
    const tokens: RotationToken[] = [];
    let lastIndex = 0;

    const regex = new RegExp(EMOJI_PATTERN.source, "g");
    let match: RegExpExecArray | null;

    while ((match = regex.exec(line)) !== null) {
        const prefix = detectStallRelease(line, match.index);
        const sliceEnd = prefix ? match.index - 1 : match.index;
        const before = line.slice(lastIndex, sliceEnd);
        processTextSegment(before, tokens);

        const [, name, emojiId] = match;
        const ability = buildAbility(name, emojiId);

        tokens.push({ type: "ability", ability, prefix });
        lastIndex = regex.lastIndex;
    }

    const remaining = line.slice(lastIndex);
    processTextSegment(remaining, tokens);

    return tokens;
}

function processTextSegment(text: string, tokens: RotationToken[]): void {
    if (!text) return;

    const parts = text.split(/(\s*→\s*|\s*\+\s*)/);
    for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed === "→") {
            tokens.push({ type: "arrow" });
        } else if (trimmed === "+") {
            tokens.push({ type: "plus" });
        } else if (trimmed) {
            tokens.push({ type: "text", value: trimmed });
        }
    }
}

function measureIndent(line: string): number {
    const stripped = line.replace(/^[\s\u200b\u200e]+/, "");
    return line.length - stripped.length;
}

function isNoteLine(line: string): boolean {
    const trimmed = line.trim();
    return trimmed.startsWith("*Note") || trimmed.startsWith("*note");
}

function isPvmeDirective(line: string): boolean {
    return PVME_DIRECTIVE_PATTERN.test(line.trim());
}

function isBlankOrDecorative(line: string): boolean {
    const trimmed = line.trim();
    return trimmed === "" || trimmed === "." || trimmed === "\u200B";
}

function isJsonBlock(line: string): boolean {
    const trimmed = line.trim();
    return trimmed === "{" || trimmed.startsWith("{") && trimmed.includes("\"embed\"");
}

function isRotationLine(line: string): boolean {
    return line.includes("→") && /<:[^:]+:\d+>/.test(line);
}

function isBulletNote(line: string): boolean {
    const trimmed = line.trim();
    return trimmed.startsWith("⬥") || trimmed.startsWith("•");
}

export function parseGuide(rawText: string): ParsedGuide {
    const lines = rawText.split("\n");

    let title = "";
    const phases: Phase[] = [];
    let currentHeadingH2 = "";
    let currentHeadingH3 = "";
    let currentPhase: Phase | null = null;
    let inJsonBlock = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // skip json embed blocks
        if (inJsonBlock) {
            if (trimmed === "}" || trimmed.endsWith("}")) {
                inJsonBlock = false;
            }
            continue;
        }

        if (isJsonBlock(trimmed)) {
            inJsonBlock = true;
            continue;
        }

        if (isPvmeDirective(line) || isBlankOrDecorative(line)) continue;

        const heading = getHeadingLevel(line);
        if (heading) {
            if (!title && heading.level === 1) {
                title = heading.text;
                continue;
            }

            if (heading.level === 2) {
                currentHeadingH2 = heading.text;
                currentHeadingH3 = "";
                currentPhase = null;
            } else if (heading.level === 3) {
                currentHeadingH3 = heading.text;
                currentPhase = null;
            }
            continue;
        }

        if (isRotationLine(line)) {
            if (!currentPhase) {
                const name = currentHeadingH3
                    ? `${currentHeadingH2} - ${currentHeadingH3}`
                    : currentHeadingH2 || "Rotation";

                currentPhase = { name, rotationLines: [], notes: [] };
                phases.push(currentPhase);
            }

            const tokens = tokenizeLine(line);
            if (tokens.length > 0) {
                currentPhase.rotationLines.push({
                    tokens,
                    indent: measureIndent(line),
                });
            }
            continue;
        }

        // collect notes that appear after rotation lines in the same phase
        if (currentPhase && currentPhase.rotationLines.length > 0) {
            if (isNoteLine(line)) {
                const noteText = trimmed.replace(/^\*Notes?:\*?\s*/i, "").trim();
                if (noteText) currentPhase.notes.push(noteText);
            } else if (isBulletNote(line)) {
                const noteText = trimmed.replace(/^[⬥•]\s*/, "").trim();
                if (noteText) currentPhase.notes.push(noteText);
            }
        }
    }

    return { title: title || "Unknown Guide", phases };
}
