import "./Upload.css";

function Upload({ status, onUpload }) {

    const isProcessing = status === "processing";

    const handleChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        onUpload(file);

        // Allow selecting the same file again on a future upload.
        event.target.value = "";
    };

    return (
        <section className="upload">

            <label
                htmlFor="audio-upload"
                className={isProcessing ? "upload-button disabled" : "upload-button"}
            >
                {isProcessing ? "Processing..." : "Upload Audio"}
            </label>

            <input
                id="audio-upload"
                type="file"
                accept=".wav,.mp3,.flac,.ogg,.m4a,audio/*"
                onChange={handleChange}
                disabled={isProcessing}
            />

        </section>
    );
}

export default Upload;