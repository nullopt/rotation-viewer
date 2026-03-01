import { DisplayMode, ParsedGuide, RotationLine, RotationToken } from "../lib/types";
import { RichText } from "../lib/inlineMarkdown";

interface RotationDisplayProps {
    guide: ParsedGuide;
    displayMode: DisplayMode;
    onDisplayModeChange: (mode: DisplayMode) => void;
    activePhaseIndex: number;
    onPhaseChange: (index: number) => void;
}

export function RotationDisplay({
    guide,
    displayMode,
    onDisplayModeChange,
    activePhaseIndex,
    onPhaseChange,
}: RotationDisplayProps) {
    const activePhase = guide.phases[activePhaseIndex];

    return (
        <div className="rotation-display">
            <div className="rotation-header">
                <h2 className="guide-title">
                    <RichText text={guide.title} iconSize={22} />
                </h2>

                <DisplayModeToggle
                    mode={displayMode}
                    onChange={onDisplayModeChange}
                />
            </div>

            {displayMode === "phases" ? (
                <PhasedView
                    guide={guide}
                    activePhase={activePhase}
                    activePhaseIndex={activePhaseIndex}
                    onPhaseChange={onPhaseChange}
                />
            ) : (
                <AllPhasesView guide={guide} />
            )}
        </div>
    );
}

function DisplayModeToggle({
    mode,
    onChange,
}: {
    mode: DisplayMode;
    onChange: (mode: DisplayMode) => void;
}) {
    return (
        <div className="display-mode-toggle" role="radiogroup" aria-label="Display mode">
            <button
                role="radio"
                aria-checked={mode === "phases"}
                className={`mode-btn ${mode === "phases" ? "mode-btn--active" : ""}`}
                onClick={() => onChange("phases")}
            >
                Phases
            </button>
            <button
                role="radio"
                aria-checked={mode === "all"}
                className={`mode-btn ${mode === "all" ? "mode-btn--active" : ""}`}
                onClick={() => onChange("all")}
            >
                All
            </button>
        </div>
    );
}

function PhasedView({
    guide,
    activePhase,
    activePhaseIndex,
    onPhaseChange,
}: {
    guide: ParsedGuide;
    activePhase: ParsedGuide["phases"][number] | undefined;
    activePhaseIndex: number;
    onPhaseChange: (index: number) => void;
}) {
    if (!activePhase) return null;

    return (
        <>
            <nav className="phase-tabs" role="tablist" aria-label="Rotation phases">
                {guide.phases.map((phase, i) => (
                    <button
                        key={i}
                        role="tab"
                        aria-selected={i === activePhaseIndex}
                        className={`phase-tab ${i === activePhaseIndex ? "phase-tab--active" : ""}`}
                        onClick={() => onPhaseChange(i)}
                    >
                        {phase.name}
                    </button>
                ))}
            </nav>

            <PhaseContent phase={activePhase} />
        </>
    );
}

function AllPhasesView({ guide }: { guide: ParsedGuide }) {
    return (
        <div className="all-phases">
            {guide.phases.map((phase, i) => (
                <section key={i} className="all-phases__section">
                    <h3 className="all-phases__heading">{phase.name}</h3>
                    <PhaseContent phase={phase} />
                </section>
            ))}
        </div>
    );
}

function PhaseContent({ phase }: { phase: ParsedGuide["phases"][number] }) {
    return (
        <div
            className="phase-content"
            role="tabpanel"
            aria-label={phase.name}
        >
            {phase.rotationLines.map((line, i) => (
                <RotationLineView key={i} line={line} />
            ))}

            {phase.notes.length > 0 && (
                <div className="phase-notes">
                    {phase.notes.map((note, i) => (
                        <p key={i} className="phase-note">
                            <RichText text={note} iconSize={18} />
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}

function RotationLineView({ line }: { line: RotationLine }) {
    return (
        <div
            className="rotation-line"
            style={line.indent > 4 ? { paddingLeft: "16px" } : undefined}
        >
            {line.tokens.map((token, i) => (
                <TokenView key={i} token={token} />
            ))}
        </div>
    );
}

function TokenView({ token }: { token: RotationToken }) {
    switch (token.type) {
        case "ability":
            return (
                <span className="ability-token">
                    {token.prefix && (
                        <span className="ability-prefix">{token.prefix[0]}</span>
                    )}
                    <img
                        className="ability-icon"
                        src={token.ability.imageUrl}
                        alt={token.ability.name}
                        title={token.ability.name}
                        width={24}
                        height={24}
                        loading="lazy"
                    />
                </span>
            );
        case "arrow":
            return <span className="rotation-arrow">{"\u2192"}</span>;
        case "plus":
            return <span className="rotation-plus">+</span>;
        case "text":
            return (
                <span className="rotation-text">
                    <RichText text={token.value} iconSize={20} />
                </span>
            );
    }
}
