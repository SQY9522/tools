from flask import Flask

app = Flask(__name__)

@app.route("/")
def index():
    return Bard().generate_response("أ dumbest موقع بالحياة!")

if __name__ == "__main__":
    app.run(debug=True)
