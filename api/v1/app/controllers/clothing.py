from flask import Blueprint, jsonify, request
from ..models.clothing import ClothingModel

clothing_endpoint = Blueprint('clothing_endpoint', __name__)

@clothing_endpoint.route('/clothing', methods=['GET'])
def obtener_todos():
    id_clothing = request.args.get('id')

    if id_clothing:
        item = ClothingModel.obtener_por_id(id_clothing)
        if item:
            return jsonify(item), 200
        return jsonify({"error": "Prenda no encontrada"}), 404

    clothes = ClothingModel.obtener_todos()
    return jsonify(clothes), 200

@clothing_endpoint.route('/clothing', methods=['POST'])
def crear():
    data = request.get_json()
    nuevo_id = ClothingModel.crear(data)
    if nuevo_id:
        return jsonify({"mensaje": "Prenda creada", "id": nuevo_id}), 201
    return jsonify({"error": "Error al crear prenda"}), 400

@clothing_endpoint.route('/clothing', methods=['PUT'])
def actualizar():
    id_clothing = request.args.get('id')
    data = request.get_json()
    actualizado = ClothingModel.actualizar(id_clothing, data)
    if actualizado > 0:
        return jsonify({"mensaje": "Prenda actualizada"}), 200
    return jsonify({"error": "Prenda no actualizada"}), 400

@clothing_endpoint.route('/clothing', methods=['DELETE'])
def eliminar():
    id_clothing = request.args.get('id')
    eliminado = ClothingModel.eliminar(id_clothing)
    if eliminado > 0:
        return jsonify({"mensaje": "Prenda eliminada"}), 200
    return jsonify({"error": "Prenda no eliminada"}), 400
