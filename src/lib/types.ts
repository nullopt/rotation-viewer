export interface GuideEntry {
    label: string;
    category: string;
    boss: string;
    path: string;
}

export interface Ability {
    name: string;
    emojiId: string;
    imageUrl: string;
}

export type RotationToken =
    | { type: "ability"; ability: Ability; prefix?: "stall" | "release" }
    | { type: "arrow" }
    | { type: "plus" }
    | { type: "text"; value: string };

export interface RotationLine {
    tokens: RotationToken[];
    indent: number;
}

export interface Phase {
    name: string;
    rotationLines: RotationLine[];
    notes: string[];
}

export interface ParsedGuide {
    title: string;
    phases: Phase[];
}

export type DisplayMode = "phases" | "all";
