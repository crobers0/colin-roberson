from flask import Flask, jsonify, send_from_directory
import os, time

app = Flask(__name__, static_folder='.', static_url_path='')
start = time.time()
visits = 0

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/api/stats')
def stats():
    global visits
    visits += 1
    return jsonify({
        'last_update': '2025-07-03',
        'visits': visits
    })

@app.route('/api/ping')
def ping():
    return ('', 204)

@app.route('/api/posts')
def posts_list():
    post_dir = os.path.join(os.getcwd(), 'posts')
    return jsonify([f for f in os.listdir(post_dir) if f.endswith('.md')])

@app.route('/posts/<path:filename>')
def serve_post(filename):
    return send_from_directory('posts', filename)

@app.route('/api/projects')
def projects_list():
    proj_dir = os.path.join(os.getcwd(), 'projects')
    return jsonify([f for f in os.listdir(proj_dir) if f.endswith('.md')])

@app.route('/projects/<path:filename>')
def serve_project(filename):
    return send_from_directory('projects', filename)

if __name__ == '__main__':
    app.run(debug=True)
