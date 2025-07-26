from flask import Blueprint, jsonify, request
from ..models.brands import BrandsModel

brands_endpoint = Blueprint('brands_endpoint', __name__)

@brands_endpoint.route('/brands', methods=['GET'])
def obtener_todos():
    id_brand = request.args.get('id')

    if id_brand:
        brand = BrandsModel.obtener_por_id(id_brand)
        if brand:
            return jsonify(brand), 200
        return jsonify({"error": "Marca no encontrada"}), 404
    
    brands = BrandsModel.obtener_todos()
    return jsonify(brands), 200

@brands_endpoint.route('/brands', methods=['POST'])
def crear():
    data = request.get_json()
    nuevo_id = BrandsModel.crear(data)
    if nuevo_id:
        return jsonify({"mensaje": "Marca creada", "id": nuevo_id}), 201
    return jsonify({"error": "Error al crear la marca"}), 400

@brands_endpoint.route('/brands', methods=['PUT'])
def actualizar():
    id_brand = request.args.get('id')
    data = request.get_json()
    actualizado = BrandsModel.actualizar(id_brand, data)
    if actualizado > 0:
        return jsonify({"mensaje": "Marca actualizada"}), 200
    return jsonify({"error": "Marca no actualizada"}), 400

@brands_endpoint.route('/brands', methods=['DELETE'])
def eliminar():
    id_brand = request.args.get('id')
    eliminado = BrandsModel.eliminar(id_brand)
    if eliminado > 0:
        return jsonify({"mensaje": "Marca eliminada"}), 200
    return jsonify({"error": "Marca no eliminada"}), 400