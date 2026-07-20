MODELS = {

    "animal": {
        "weights": "models/best_animal_cnn.pt",
        "classes": [
            "bear",
            "bird",
            "cat",
            "cow",
            "crow",
            "dog",
            "dolphin",
            "donkey",
            "elephant",
            "frog",
            "hen",
            "horse",
            "insects",
            "lion",
            "monkey",
            "pig",
            "rooster",
            "sheep",
        ],
    },

    "machine": {
        "weights": "models/machine_cnn14_best.pt",
        "classes": [
            "air_conditioner",
            "car_horn",
            "drilling",
            "engine_idling",
            "fan",
            "jackhammer",
            "pump",
            "siren",
            "slider",
            "toycar",
            "toyconveyor",
            "valve",
        ],
    },

    "human": {
        "weights": "models/gender_cnn14_best.pt",
        "classes": [
            "female",
            "male",
        ],
    },

}