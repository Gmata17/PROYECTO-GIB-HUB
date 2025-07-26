from flask import Blueprint, jsonify, request
from ..models.sales import SalesModel

sales_endpoint = Blueprint('sales_endpoint', __name__)

@sales_endpoint.route('/sales', methods=['GET'])
def obtener_todos():
    id_sale = request.args.get('id')

    if id_sale:
        sale = SalesModel.obtener_por_id(id_sale)
        if sale:
            return jsonify(sale), 200
        return jsonify({"error": "Venta no encontrada"}), 404

    sales = SalesModel.obtener_todos()
    return jsonify(sales), 200

@sales_endpoint.route('/sales', methods=['POST'])
def crear():
    data = request.get_json()
    nuevo_id = SalesModel.crear(data)
    if nuevo_id:
        return jsonify({"mensaje": "Venta creada", "id": nuevo_id}), 201
    return jsonify({"error": "Error al crear venta"}), 400

@sales_endpoint.route('/sales', methods=['PUT'])
def actualizar():
    id_sale = request.args.get('id')
    data = request.get_json()
    actualizado = SalesModel.actualizar(id_sale, data)
    if actualizado > 0:
        return jsonify({"mensaje": "Venta actualizada"}), 200
    return jsonify({"error": "Venta no actualizada"}), 400

@sales_endpoint.route('/sales', methods=['DELETE'])
def eliminar():
    id_sale = request.args.get('id')
    eliminado = SalesModel.eliminar(id_sale)
    if eliminado > 0:
        return jsonify({"mensaje": "Venta eliminada"}), 200
    return jsonify({"error": "Venta no eliminada"}), 400
