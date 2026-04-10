import os
import json
import time
import random
import hashlib
import logging
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

from scraper import ProductScraper
from sentiment import SentimentEngine

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='../frontend/public', static_url_path='')

app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'worthify-ultra-secret-2024-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

CORS(app, resources={r"/api/*": {"origins": "*"}})
jwt = JWTManager(app)

# ─── In-Memory User Store (production → replace with SQLite/Postgres) ──────────
USERS = {}
SEARCH_HISTORY = {}

scraper = ProductScraper()
sentiment_engine = SentimentEngine()

# ─── Auth Endpoints ────────────────────────────────────────────────────────────
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name     = data.get('name', '').strip()
    email    = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not name or not email or not password:
        return jsonify({'error': 'All fields required'}), 400
    if email in USERS:
        return jsonify({'error': 'Email already registered'}), 409
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    USERS[email] = {
        'id': hashlib.md5(email.encode()).hexdigest()[:8],
        'name': name,
        'email': email,
        'password_hash': generate_password_hash(password),
        'created_at': datetime.utcnow().isoformat(),
        'searches': 0
    }
    SEARCH_HISTORY[email] = []
    token = create_access_token(identity=email)
    return jsonify({'token': token, 'user': {'name': name, 'email': email, 'id': USERS[email]['id']}}), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    data     = request.get_json()
    email    = data.get('email', '').strip().lower()
    password = data.get('password', '')

    user = USERS.get(email)
    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Invalid email or password'}), 401

    token = create_access_token(identity=email)
    return jsonify({'token': token, 'user': {'name': user['name'], 'email': email, 'id': user['id']}})


@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def me():
    email = get_jwt_identity()
    user  = USERS.get(email, {})
    return jsonify({'name': user.get('name'), 'email': email, 'id': user.get('id'), 'searches': user.get('searches', 0)})


# ─── Core Analysis Endpoint ────────────────────────────────────────────────────
@app.route('/api/analyze', methods=['POST'])
@jwt_required()
def analyze():
    email = get_jwt_identity()
    data  = request.get_json()
    query = data.get('query', '').strip()

    if not query or len(query) < 2:
        return jsonify({'error': 'Product query is required'}), 400

    logger.info(f"[ANALYZE] User={email} Query='{query}'")

    try:
        # 1. Scrape product data from all platforms
        raw_results = scraper.search_all(query)

        # 2. Run sentiment analysis on collected reviews
        analysis    = sentiment_engine.analyze(query, raw_results)

        # 3. product_info is now embedded in analysis by sentiment engine
        # Also attach it as product_meta for backward compatibility
        if 'product_info' in analysis:
            analysis['product_meta'] = analysis['product_info']

        # 4. Store in history
        if email in SEARCH_HISTORY:
            SEARCH_HISTORY[email].insert(0, {
                'query': query,
                'timestamp': datetime.utcnow().isoformat(),
                'verdict': analysis.get('verdict', 'N/A'),
                'quality_score': analysis.get('quality_score', 0)
            })
            SEARCH_HISTORY[email] = SEARCH_HISTORY[email][:20]

        if email in USERS:
            USERS[email]['searches'] = USERS[email].get('searches', 0) + 1

        return jsonify(analysis)

    except Exception as e:
        logger.error(f"[ANALYZE ERROR] {e}", exc_info=True)
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500


@app.route('/api/history', methods=['GET'])
@jwt_required()
def history():
    email = get_jwt_identity()
    return jsonify(SEARCH_HISTORY.get(email, []))


@app.route('/api/stats', methods=['GET'])
@jwt_required()
def stats():
    email = get_jwt_identity()
    hist  = SEARCH_HISTORY.get(email, [])
    buy   = sum(1 for h in hist if 'Buy' in h.get('verdict', ''))
    wait  = sum(1 for h in hist if 'Wait' in h.get('verdict', ''))
    avoid = sum(1 for h in hist if 'Avoid' in h.get('verdict', ''))
    return jsonify({'total': len(hist), 'buy': buy, 'wait': wait, 'avoid': avoid})


# ─── Serve Frontend ────────────────────────────────────────────────────────────
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=False)
