# api/v1/app/controllers/reports.py
from flask import Blueprint, jsonify
from ..models.reports import ReportsModel

reports_endpoint = Blueprint('reports_endpoint', __name__)

@reports_endpoint.route('/reports', methods=['GET'])
def reports_combined():
    """
    GET /api/v1/admin/reports
    Devuelve un objeto con las 3 vistas útiles para el front-end:
    {
      "brands_with_sales": [...],
      "items_sold": [...],
      "top5_brands": [...]
    }
    """
    data = ReportsModel.obtener_todos_combinado()
    return jsonify(data), 200

@reports_endpoint.route('/reports/marcas', methods=['GET'])
def marcas_con_ventas():
    """
    GET /api/v1/admin/reports/marcas
    Retorna: [{ "brand": "<nombre>", "ventas": <cantidad>, "brand_id": "<id>" }, ...]
    """
    data = ReportsModel.obtener_marcas_con_ventas()
    return jsonify(data), 200

@reports_endpoint.route('/reports/prendas', methods=['GET'])
def prendas_vendidas_stock():
    """
    GET /api/v1/admin/reports/prendas
    Retorna: [{ "item_id": "<id>", "name": "<nombre>", "sold": n, "in_stock": n, "remaining": n }, ...]
    """
    data = ReportsModel.obtener_prendas_vendidas_stock()
    return jsonify(data), 200

@reports_endpoint.route('/reports/top5', methods=['GET'])
def top5_marcas():
    """
    GET /api/v1/admin/reports/top5
    Retorna: [{ "brand": "<nombre>", "ventas": <cantidad> }, ...] (máx 5)
    """
    data = ReportsModel.obtener_top5_marcas()
    return jsonify(data), 200