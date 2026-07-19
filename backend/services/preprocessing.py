import librosa
import numpy as np

SAMPLE_RATE = 44100
DURATION = 5
N_MELS = 256
HOP_LENGTH = 512
N_FFT = 2048


def extract_mel(
    file_path,
    sr=SAMPLE_RATE,
    duration=DURATION,
    n_mels=N_MELS,
    n_fft=N_FFT,
    hop_length=HOP_LENGTH,
):

    y, _ = librosa.load(
        file_path,
        sr=sr,
        mono=True,
        duration=duration,
    )

    expected_length = sr * duration

    if len(y) < expected_length:
        y = np.pad(
            y,
            (0, expected_length - len(y)),
            mode="constant",
        )

    if len(y) > expected_length:
        y = y[:expected_length]

    mel = librosa.feature.melspectrogram(
        y=y,
        sr=sr,
        n_fft=n_fft,
        hop_length=hop_length,
        n_mels=n_mels,
    )

    mel = librosa.power_to_db(
        mel,
        ref=np.max,
    )

    return mel.astype(np.float32)