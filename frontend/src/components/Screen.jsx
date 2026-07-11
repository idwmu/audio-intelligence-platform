import { useEffect, useState } from "react";

import "./Screen.css";

const LOG_LINES = [
    "> Loading audio...",
    "\u2713 Reading waveform",
    "> Sample Rate",
    "16000 Hz",
    "\u2713 Mono detected",
    "> Normalizing audio...",
    "\u2713 Done",
    "> Generating Mel Spectrogram...",
    "\u2588\u2588\u2588\u2588\u2588\u2588\u2591\u2591\u2591\u2591\u2591\u2591",
    "> Extracting MFCC...",
    "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2591\u2591\u2591",
    "> Loading CNN...",
    "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
    "> Running inference...",
    "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
];

const LINE_INTERVAL_MS = 380;
const WINDOW_SIZE = 8; // how many lines stay visible at once, oldest scroll off

function lineType(line) {
    if (line.startsWith(">")) return "line-prompt";
    if (line.startsWith("\u2713")) return "line-check";
    if (/^[\u2588\u2591]+$/.test(line)) return "line-progress";
    return "line-data";
}

function Screen({ status, prediction }) {

    const [visibleCount, setVisibleCount] = useState(0);

    useEffect(() => {
        if (status !== "processing") {
            setVisibleCount(0);
            return;
        }

        let count = 0;

        const interval = setInterval(() => {
            count += 1;
            setVisibleCount(count);

            if (count >= LOG_LINES.length) {
                clearInterval(interval);
            }
        }, LINE_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [status]);

    return (
        <div className="screen">

            {status === "idle" && (
                <div className="screen-idle">
                    <span className="screen-label">READY</span>
                    <span className="screen-sub">Upload Audio</span>
                </div>
            )}

            {status === "processing" && (
                <div className="screen-terminal">
                    {LOG_LINES.slice(Math.max(0, visibleCount - WINDOW_SIZE), visibleCount).map((line, index) => (
                        <div key={visibleCount - WINDOW_SIZE + index} className={`terminal-line ${lineType(line)}`}>
                            {line}
                        </div>
                    ))}
                </div>
            )}

            {status === "complete" && prediction && (
                <div className="screen-result">
                    <span className="result-label">Prediction</span>
                    <span className="result-class">{prediction.label}</span>
                    <span className="result-confidence">{prediction.confidence}%</span>

                    <div className="result-top">
                        <span className="result-top-label">Top Predictions</span>
                        {prediction.top.map((item) => (
                            <span key={item.label} className="result-top-item">
                                {item.label}
                            </span>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}

export default Screen;