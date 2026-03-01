import React from "react";

const DISCORD_CDN_BASE = "https://cdn.discordapp.com/emojis";

interface InlineSegment {
    type: "text" | "bold" | "italic" | "link" | "emoji";
    value: string;
    href?: string;
    emojiId?: string;
}

const INLINE_PATTERN =
    /(<:[^:]+:\d+>)|\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)]+)\)/g;

function parseInlineSegments(text: string): InlineSegment[] {
    const segments: InlineSegment[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    const regex = new RegExp(INLINE_PATTERN.source, "g");

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
        }

        if (match[1]) {
            const emojiMatch = match[1].match(/<:([^:]+):(\d+)>/);
            if (emojiMatch) {
                segments.push({
                    type: "emoji",
                    value: emojiMatch[1],
                    emojiId: emojiMatch[2],
                });
            }
        } else if (match[2]) {
            segments.push({ type: "bold", value: match[2] });
        } else if (match[3]) {
            segments.push({ type: "italic", value: match[3] });
        } else if (match[4] && match[5]) {
            segments.push({ type: "link", value: match[4], href: match[5] });
        }

        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        segments.push({ type: "text", value: text.slice(lastIndex) });
    }

    return segments;
}

interface RichTextProps {
    text: string;
    iconSize?: number;
}

export function RichText({ text, iconSize = 20 }: RichTextProps) {
    const segments = parseInlineSegments(text);

    return (
        <>
            {segments.map((seg, i) => {
                switch (seg.type) {
                    case "emoji":
                        return (
                            <img
                                key={i}
                                className="ability-icon"
                                src={`${DISCORD_CDN_BASE}/${seg.emojiId}.png?v=1`}
                                alt={seg.value}
                                title={seg.value}
                                width={iconSize}
                                height={iconSize}
                                loading="lazy"
                            />
                        );
                    case "bold":
                        return <strong key={i}><RichText text={seg.value} iconSize={iconSize} /></strong>;
                    case "italic":
                        return <em key={i}><RichText text={seg.value} iconSize={iconSize} /></em>;
                    case "link":
                        return (
                            <a key={i} href={seg.href} target="_blank" rel="noopener noreferrer">
                                <RichText text={seg.value} iconSize={iconSize} />
                            </a>
                        );
                    case "text":
                    default:
                        return <span key={i}>{seg.value}</span>;
                }
            })}
        </>
    );
}
