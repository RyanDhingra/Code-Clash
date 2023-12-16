from flask import Flask, request
from flask_socketio import SocketIO, join_room, emit
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")

messageList = []

@socketio.on('connect')
def handle_connect():
    print(f'User Connected: {request.sid}')

@socketio.on('join_room')
def handle_join_room(data):
    join_room(data)

@socketio.on('send_message')
def handle_send_message(data):
    if True:
        messageList.append(data['message'])
        print(data)
        emit('receive_message', {'message': str(messageList), 'room': data['room']}, room=data['room'])
    else:
        emit('blank_message', '', room=data['room'])

if __name__ == '__main__':
    socketio.run(app, port=3001)