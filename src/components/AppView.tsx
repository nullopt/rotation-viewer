import { DisplayMode, ParsedGuide } from "../lib/types";
import { GuideSelector } from "./GuideSelector";
import { RotationDisplay } from "./RotationDisplay";

interface AppViewProps {
    alt1Connected: boolean;
    selectedPath: string;
    onSelectGuide: (path: string) => void;
    guide: ParsedGuide | null;
    displayMode: DisplayMode;
    onDisplayModeChange: (mode: DisplayMode) => void;
    activePhaseIndex: number;
    onPhaseChange: (index: number) => void;
    loading: boolean;
    error: string | null;
}

export function AppView({
    alt1Connected,
    selectedPath,
    onSelectGuide,
    guide,
    displayMode,
    onDisplayModeChange,
    activePhaseIndex,
    onPhaseChange,
    loading,
    error,
}: AppViewProps) {
    return (
        <>
            <header>
                <h1>Rotation Viewer</h1>
                {!alt1Connected && (
                    <p className="alt1-warning">
                        Alt1 not detected. Running in standalone mode.
                    </p>
                )}
            </header>

            <main>
                <details className="guide-picker" open>
                    <summary>Guide Selection</summary>
                    <div className="guide-picker__body">
                        <GuideSelector
                            selectedPath={selectedPath}
                            loading={loading}
                            onSelect={onSelectGuide}
                        />
                    </div>
                </details>

                {error && (
                    <div className="error-message" role="alert">
                        {error}
                    </div>
                )}

                {loading && <div className="loading-indicator">Fetching guide...</div>}

                {guide && (
                    <RotationDisplay
                        guide={guide}
                        displayMode={displayMode}
                        onDisplayModeChange={onDisplayModeChange}
                        activePhaseIndex={activePhaseIndex}
                        onPhaseChange={onPhaseChange}
                    />
                )}

                {!guide && !loading && !error && (
                    <p className="placeholder-text">
                        Select a guide above to view rotations.
                    </p>
                )}
            </main>
        </>
    );
}
