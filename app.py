from flask import Flask, jsonify, render_template, request
import json
import numpy as np
import random
from scipy.spatial import ConvexHull
import keras.models
from keras.preprocessing.sequence import pad_sequences
import pickle

app = Flask(__name__)

def Classify(X_padded, output_points, output):
    for i in range(len(X_padded[0])):
        if X_padded[0][i][0] != 0.0:
            if output[0][i] != 0.0:
                output_points.append(X_padded[0][i])
    return output_points


@app.route("/", methods=["GET", "POST"])
def home():
    output_points = []
    if request.is_json:
        if request.method == "POST":
            inputdata = json.loads(request.data).get("xyCords")
            type = json.loads(request.data).get("models")
            X_padded = np.float32(
                pad_sequences([inputdata], maxlen=21, padding="pre", truncating="post")
            )
            X_padded = X_padded.tolist()
            if type == "random":
                output = [[]]
                for i in range(21):
                    output[0].append(random.randint(0, 1))
                    
                Classify(X_padded, output_points, output)

            elif type == "oracle":
                points = inputdata
                serialized_points = np.vstack(points)
                hull = ConvexHull(serialized_points)
                output_points = serialized_points[(hull.vertices)]
                output_points = output_points.tolist()

            elif type == "Crf":
                model = pickle.load(open("./models/crf.pkl", "rb"))
                new_points = []

                for i in inputdata:
                    p = {}
                    for _ in range(len(i)):
                        p["x"] = i[0]
                        p["y"] = i[1]
                    new_points.append(p)

                output = model.predict(new_points)

                # output = list(map(float, output[0]))
                for i in range(len(new_points)):
                    if output[i] != "0":
                        output_points.append([new_points[i]["x"], new_points[i]["y"]])

            elif type == "Pix":
                pass

            else:
                model = keras.models.load_model(f"./models/{type}.h5")

                output = model.predict(X_padded)
                output[output > 0.5] = 1
                output[output <= 0.5] = 0

                Classify(X_padded, output_points, output)

            return jsonify({"img_data": output_points})
    return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)