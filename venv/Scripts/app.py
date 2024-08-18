from flask import Flask, request, jsonify, redirect, url_for, session, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
from functools import wraps
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

from flask import Flask, send_from_directory



app = Flask(__name__)
CORS(app)

# Configure CORS with support for credentials
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

# Configure secret key for sessions
app.config['SECRET_KEY'] = 'your_secret_key_here'

# Configure the SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///foods.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define the User model for admin login


# Define the Food and Comment models
class Food(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    description = db.Column(db.String(200), nullable=False)
    image_url = db.Column(db.String(200), nullable=False)
    comments = db.relationship('Comment', backref='food', cascade="all, delete-orphan", lazy=True)

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    text = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    food_id = db.Column(db.Integer, db.ForeignKey('food.id'), nullable=False)

# Create the database and tables
with app.app_context():
    db.create_all()

# Define the admin login route
def get_db_connection():
    conn = sqlite3.connect('admin.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''CREATE TABLE IF NOT EXISTS admin_users
                    (id INTEGER PRIMARY KEY AUTOINCREMENT,
                     username TEXT UNIQUE NOT NULL,
                     password TEXT NOT NULL)''')
    

    # Check if the preset admin user already exists
    cursor = conn.execute('SELECT * FROM admin_users WHERE username = ?', ('admin',))
    if cursor.fetchone() is None:
        # Insert preset admin user
        preset_username = 'admin'
        preset_password = 'password123'  # Replace with your desired password
        hashed_password = generate_password_hash(preset_password)
        conn.execute('INSERT INTO admin_users (username, password) VALUES (?, ?)',
                     (preset_username, hashed_password))

    conn.commit()
    conn.close()


init_db()

@app.route('/admin/create_user', methods=['POST'])
def create_user():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    conn = get_db_connection()
    
    # Check if the username already exists
    if conn.execute('SELECT * FROM admin_users WHERE username = ?', (username,)).fetchone():
        conn.close()
        return jsonify({"error": "Username already exists"}), 400
    
    # Hash the password
    hashed_password = generate_password_hash(password)
    
    # Insert the new user
    try:
        conn.execute('INSERT INTO admin_users (username, password) VALUES (?, ?)', 
                     (username, hashed_password))
        conn.commit()
    except Exception as e:
        conn.close()
        return jsonify({"error": str(e)}), 500
    
    conn.close()
    return jsonify({"message": "User created successfully"}), 201





def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.route('/admin/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM admin_users WHERE username = ?', (username,)).fetchone()
    conn.close()
    
    if user and check_password_hash(user['password'], password):
        session['user_id'] = user['id']
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401


    
    # conn = get_db_connection()
    # user = conn.execute('SELECT * FROM admin_users WHERE username = ?', (username,)).fetchone()
    # conn.close()
    
    # if user and check_password_hash(user['password'], password):
    #     session['user_id'] = user['id']
    #     return jsonify({"message": "Login successful"}), 200
    # else:
    #     return jsonify({"error": "Invalid credentials"}), 401


@app.route('/logout', methods=['POST'])
def logout():
    # Your logout logic here
    return jsonify({"message": "Logged out successfully"}), 200


@app.route('/admin/check_auth', methods=['GET'])
def check_auth():
    if 'user_id' in session:
        return jsonify({"authenticated": True}), 200
    else:
        return jsonify({"authenticated": False}), 200

# Food endpoints
@app.route('/foods', methods=['GET'])
def get_foods():
    foods = Food.query.all()
    return jsonify([{'id': food.id, 'name': food.name, 'description': food.description, 'image_url': food.image_url} for food in foods])

@app.route('/foods', methods=['POST'])
def add_food():
    data = request.json
    new_food = Food(name=data['name'], description=data['description'], image_url=data['image_url'])
    db.session.add(new_food)
    db.session.commit()
    return jsonify({'message': 'Food added successfully'}), 201

@app.route('/foods/<int:id>', methods=['GET'])
def get_food(id):
    food = Food.query.get(id)
    if food is None:
        return jsonify({'message': 'Food not found'}), 404
    return jsonify({
        'id': food.id,
        'name': food.name,
        'description': food.description,
        'image_url': food.image_url
    })

@app.route('/foods/<int:id>', methods=['PUT'])
def update_food(id):
    data = request.json
    food = Food.query.get(id)
    if food is None:
        return jsonify({'message': 'Food not found'}), 404
    food.name = data['name']
    food.description = data['description']
    food.image_url = data['image_url']
    db.session.commit()
    return jsonify({'message': 'Food updated successfully'})

@app.route('/foods/<int:id>', methods=['DELETE'])
def delete_food(id):
    food = Food.query.get(id)
    if food is None:
        return jsonify({'message': 'Food not found'}), 404
    db.session.delete(food)
    db.session.commit()
    return jsonify({'message': 'Food deleted successfully'})

# Comment endpoints
@app.route('/foods/<int:food_id>/comments', methods=['GET'])
def get_comments(food_id):
    comments = Comment.query.filter_by(food_id=food_id).all()
    return jsonify([{
        'id': comment.id,
        'name': comment.name,
        'email': comment.email,
        'text': comment.text,
        'timestamp': comment.timestamp
    } for comment in comments])

@app.route('/foods/<int:food_id>/comments', methods=['POST'])
def add_comment(food_id):
    data = request.json
    new_comment = Comment(
        name=data['name'],
        email=data['email'],
        text=data['text'],
        food_id=food_id
    )
    db.session.add(new_comment)
    db.session.commit()
    return jsonify({'message': 'Comment added successfully'}), 201

@app.route('/foods/<int:food_id>/comments/<int:comment_id>', methods=['PUT'])
def update_comment(food_id, comment_id):
    data = request.json
    comment = Comment.query.filter_by(id=comment_id, food_id=food_id).first()
    if comment is None:
        return jsonify({'message': 'Comment not found'}), 404
    comment.name = data['name']
    comment.email = data['email']
    comment.text = data['text']
    db.session.commit()
    return jsonify({'message': 'Comment updated successfully'})

@app.route('/foods/<int:food_id>/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment(food_id, comment_id):
    comment = Comment.query.filter_by(id=comment_id, food_id=food_id).first()
    if comment is None:
        return jsonify({'message': 'Comment not found'}), 404
    db.session.delete(comment)
    db.session.commit()
    return jsonify({'message': 'Comment deleted successfully'})

if __name__ == '__main__':
    app.run(debug=True)