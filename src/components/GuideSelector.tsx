import { GuideEntry } from "../lib/types";
import { getGuidesByCategory } from "../services/guideIndex";

interface GuideSelectorProps {
    selectedPath: string;
    loading: boolean;
    onSelect: (path: string) => void;
}

const groupedGuides = getGuidesByCategory();

export function GuideSelector({ selectedPath, loading, onSelect }: GuideSelectorProps) {
    return (
        <div className="guide-selector">
            <label htmlFor="guide-select" className="sr-only">
                Select a guide
            </label>
            <select
                id="guide-select"
                value={selectedPath}
                onChange={(e) => onSelect(e.target.value)}
                disabled={loading}
                aria-label="Select a PVME guide"
            >
                <option value="">-- Select a guide --</option>
                {Array.from(groupedGuides.entries()).map(([category, entries]) => (
                    <optgroup key={category} label={category}>
                        {entries.map((entry: GuideEntry) => (
                            <option key={entry.path} value={entry.path}>
                                {entry.label}
                            </option>
                        ))}
                    </optgroup>
                ))}
            </select>
        </div>
    );
}
