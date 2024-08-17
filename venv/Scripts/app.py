from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configure the SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///foods.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define the Food model
class Food(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    description = db.Column(db.String(200), nullable=False)
    image_url = db.Column(db.String(200), nullable=False)
    comments = db.relationship('Comment', backref='food', cascade="all, delete-orphan", lazy=True)

# Define the Comment model
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



# ---------------------coment section -----------------------------------

app = Flask(__name__, static_folder='static')
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///comments.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    text = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

# Admin-only routes
@app.route('/admin/comments', methods=['GET'])
def get_comments():
    comments = Comment.query.order_by(Comment.timestamp.desc()).all()
    return jsonify([
        {
            'id': comment.id,
            'name': comment.name,
            'email': comment.email,
            'text': comment.text,
            'timestamp': comment.timestamp.isoformat()
        } for comment in comments
    ])

@app.route('/comments', methods=['POST'])
def add_comment():
    data = request.json
    new_comment = Comment(
        name=data['name'],
        email=data['email'],
        text=data['text']
    )
    db.session.add(new_comment)
    db.session.commit()
    return jsonify({
        'id': new_comment.id,
        'name': new_comment.name,
        'email': new_comment.email,
        'text': new_comment.text,
        'timestamp': new_comment.timestamp.isoformat()
    }), 201

@app.route('/admin/comments/<int:comment_id>', methods=['PUT'])
def update_comment(comment_id):
    comment = Comment.query.get_or_404(comment_id)
    data = request.json
    comment.name = data['name']
    comment.email = data['email']
    comment.text = data['text']
    db.session.commit()
    return jsonify({
        'id': comment.id,
        'name': comment.name,
        'email': comment.email,
        'text': comment.text,
        'timestamp': comment.timestamp.isoformat()
    })

@app.route('/admin/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    comment = Comment.query.get_or_404(comment_id)
    db.session.delete(comment)
    db.session.commit()
    return jsonify({'message': 'Comment deleted successfully'}), 200

if __name__ == '__main__':
    app.run(debug=True)