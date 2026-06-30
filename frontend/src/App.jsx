import { useState } from "react";

import Header from "./components/Header";
import Upload from "./components/Upload";
import Turntable from "./components/Turntable";

import "./App.css";

function App() {

    const [processing, setProcessing] = useState(false);

    return (
        <>
            <Header />

            <Turntable processing={processing} />

            <Upload setProcessing={setProcessing} />
        </>
    );
}

export default App;