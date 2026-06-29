import "./Upload.css";

function Upload(){
    return(
        <section className="upload">
            <label htmlFor = "audio-upload" className="upload-button">
                Upload Audio
            </label>
            <input
                id = "audio-upload"
                type = "file"
                accept = ".wav, .mp3, .flac,.ogg.m4a,audio/*"
            />
        </section> 
        
    );
}

export default Upload;