import { useCallback, useEffect, useState } from "react";
import * as a1lib from "alt1/base";
import { AppView } from "./components/AppView";
import { fetchGuideByPath } from "./lib/pvmeFetcher";
import { parseGuide } from "./lib/pvmeParser";
import { DisplayMode, ParsedGuide } from "./lib/types";

export function App() {
    const [alt1Connected, setAlt1Connected] = useState(false);
    const [selectedPath, setSelectedPath] = useState("");
    const [url, setUrl] = useState("");
    const [guide, setGuide] = useState<ParsedGuide | null>(null);
    const [displayMode, setDisplayMode] = useState<DisplayMode>("phases");
    const [activePhaseIndex, setActivePhaseIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (a1lib.hasAlt1) {
            a1lib.identifyApp("./appconfig.json");
            setAlt1Connected(true);
        }
    }, []);

    const loadGuide = useCallback(async (fetcher: () => Promise<string>) => {
        setLoading(true);
        setError(null);
        setGuide(null);
        setActivePhaseIndex(0);

        try {
            const rawText = await fetcher();
            const parsed = parseGuide(rawText);

            if (parsed.phases.length === 0) {
                setError("No rotation data found in this guide.");
                return;
            }

            setGuide(parsed);
        } catch (err) {
            const message = err instanceof Error ? err.message : "An unexpected error occurred.";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSelectGuide = useCallback((path: string) => {
        setSelectedPath(path);
        setUrl("");
        if (path) {
            loadGuide(() => fetchGuideByPath(path));
        } else {
            setGuide(null);
            setError(null);
        }
    }, [loadGuide]);

    return (
        <AppView
            alt1Connected={alt1Connected}
            selectedPath={selectedPath}
            onSelectGuide={handleSelectGuide}
            guide={guide}
            displayMode={displayMode}
            onDisplayModeChange={setDisplayMode}
            activePhaseIndex={activePhaseIndex}
            onPhaseChange={setActivePhaseIndex}
            loading={loading}
            error={error}
        />
    );
}
