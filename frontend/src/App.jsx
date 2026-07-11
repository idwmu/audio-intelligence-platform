import { useState } from "react";

import Header from "./components/Header";
import Upload from "./components/Upload";
import Turntable from "./components/Turntable";
import Screen from "./components/Screen";

import "./App.css";

function App() {

    const [status, setStatus] = useState("idle"); // "idle" | "processing" | "complete"
    const [prediction, setPrediction] = useState(null);

    const handleUpload = async (file) => {

        console.log("Selected:", file.name);

        setPrediction(null);
        setStatus("processing");

        // Simulating the FastAPI call for now.
        // Swap this block for a real fetch() to the backend later —
        // the response shape should match the "prediction" object below.
        await new Promise((resolve) => setTimeout(resolve, 6200));

        setPrediction({
            label: "Dog",
            confidence: 98.2,
            top: [
                { label: "Dog", confidence: 98.2 },
                { label: "Wolf", confidence: 1.1 },
                { label: "Fox", confidence: 0.5 },
            ],
        });

        setStatus("complete");
    };

    return (
        <>
            <Header />

            <Turntable status={status} />

            <Screen status={status} prediction={prediction} />

            <Upload status={status} onUpload={handleUpload} />
        </>
    );
}

export default App;