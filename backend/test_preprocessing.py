from services.preprocessing import extract_mel

print("Starting...")

mel = extract_mel("uploads/test.mp3")

print("Shape:", mel.shape)
print("Done!")