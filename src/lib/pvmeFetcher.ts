const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/pvme/pvme-guides/master";

const cache = new Map<string, string>();

export function convertPvmeUrlToRaw(pvmeUrl: string): string {
    const url = new URL(pvmeUrl);
    const pathSegments = url.pathname
        .replace(/^\/pvme-guides\//, "")
        .replace(/\/$/, "");

    return `${GITHUB_RAW_BASE}/${pathSegments}.txt`;
}

export function buildRawUrl(repoPath: string): string {
    return `${GITHUB_RAW_BASE}/${repoPath}`;
}

async function fetchRaw(rawUrl: string): Promise<string> {
    const cached = cache.get(rawUrl);
    if (cached) return cached;

    const response = await fetch(rawUrl);

    if (!response.ok) {
        throw new Error(`Failed to fetch guide: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    cache.set(rawUrl, text);
    return text;
}

export async function fetchGuideByPath(repoPath: string): Promise<string> {
    const rawUrl = buildRawUrl(repoPath);
    return fetchRaw(rawUrl);
}
