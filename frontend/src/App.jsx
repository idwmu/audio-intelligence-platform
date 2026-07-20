import { useState } from "react";

import Header from "./components/Header";
import Upload from "./components/Upload";
import Turntable from "./components/Turntable";
import Screen from "./components/Screen";

import "./App.css";

function App() {

    const [status, setStatus] = useState("idle");
    const [selectedModel, setSelectedModel] = useState("animal");
    const [prediction, setPrediction] = useState(null);

    const handleUpload = async (file) => {

        setPrediction(null);
        setStatus("processing");

        try {

            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(
                `http://127.0.0.1:8000/predict/${selectedModel}`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error("Prediction failed");
            }

            const result = await response.json();

            setPrediction({
                label: result.prediction,
                confidence: result.confidence,
                top: [
                    {
                        label: result.prediction,
                        confidence: result.confidence,
                    },
                ],
            });

            setStatus("complete");

        } catch (err) {

            console.error(err);

            setPrediction({
                label: "Error",
                confidence: 0,
                top: [],
            });

            setStatus("complete");
        }
    };

    return (
        <>
            <Header
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
            />

            <Turntable status={status} />

            <Screen
                status={status}
                prediction={prediction}
            />

            <Upload
                status={status}
                onUpload={handleUpload}
            />
        </>
    );
}

export default App;