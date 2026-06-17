from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

@app.route('/api/example', methods=['GET'])
def example():
    count = int(request.args.get("count", 0))
    count += 1
    print(count)
    return jsonify({"count": count})

if __name__ == '__main__':
    app.run(port=5000, debug=True)