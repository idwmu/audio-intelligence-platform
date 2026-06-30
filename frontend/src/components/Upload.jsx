import "./Upload.css";

function Upload({ setProcessing }) {

    /*
    const handleUpload = (event) => {

        const file = event.target.files[0];

        if (!file) return;

        console.log(file);

        // Start spinning the disk
        setProcessing(true);

        // We'll replace this with the Flask API call later.
        // For now, stop after 5 seconds.
        setTimeout(() => {
            setProcessing(false);
        }, 5000);
    }; */

    const handleUpload = async (event) => {
  const file = event.target.files[0];

  if (!file) return;

  console.log("Selected:", file.name);

  // Start processing
  setProcessing(true);

  // Simulate Flask taking 30 seconds
  await new Promise((resolve) => setTimeout(resolve, 30000));

  // Stop processing
  setProcessing(false);

  console.log("Finished!");
};

    return (
        <section className="upload">

            <label htmlFor="audio-upload" className="upload-button">
                Upload Audio
            </label>

            <input
                id="audio-upload"
                type="file"
                accept=".wav,.mp3,.flac,.ogg,.m4a,audio/*"
                onChange={handleUpload}
            />

        </section>
    );
}

export default Upload;