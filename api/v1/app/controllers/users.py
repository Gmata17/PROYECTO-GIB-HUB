from flask import Blueprint, jsonify, request
from ..models.users import UsersModel

users_endpoint = Blueprint('users_endpoint', __name__)

@users_endpoint.route('/users', methods=['GET'])
def obtener_todos():
    id_user = request.args.get('id')

    if id_user:
        user = UsersModel.obtener_por_id(id_user)
        if user:
            return jsonify(user), 200
        return jsonify({"error": "Usuario no encontrado"}), 404

    users = UsersModel.obtener_todos()
    return jsonify(users), 200

@users_endpoint.route('/users', methods=['POST'])
def crear():
    data = request.get_json()
    nuevo_id = UsersModel.crear(data)
    if nuevo_id:
        return jsonify({"mensaje": "Usuario creado", "id": nuevo_id}), 201
    return jsonify({"error": "Error al crear usuario"}), 400

@users_endpoint.route('/users', methods=['PUT'])
def actualizar():
    id_user = request.args.get('id')
    data = request.get_json()
    actualizado = UsersModel.actualizar(id_user, data)
    if actualizado > 0:
        return jsonify({"mensaje": "Usuario actualizado"}), 200
    return jsonify({"error": "Usuario no actualizado"}), 400

@users_endpoint.route('/users', methods=['DELETE'])
def eliminar():
    id_user = request.args.get('id')
    eliminado = UsersModel.eliminar(id_user)
    if eliminado > 0:
        return jsonify({"mensaje": "Usuario eliminado"}), 200
    return jsonify({"error": "Usuario no eliminado"}), 400