# api/v1/app/models/reports.py
from app.index import mongo

class ReportsModel:
    """
    Modelo de reportes con pipelines eficientes.
    Métodos:
      - obtener_marcas_con_ventas()
      - obtener_prendas_vendidas_stock()
      - obtener_top5_marcas()
      - obtener_todos_combinado()  -> devuelve { brands_with_sales, items_sold, top5_brands }
    """

    @staticmethod
    def obtener_marcas_con_ventas():
        """
        Retorna lista de { brand: <nombre>, ventas: <cantidad> } para marcas con al menos una venta.
        """
        try:
            pipeline = [
                # Resolver clothing desde sales (coincidir string(ObjectId) o string id)
                {
                    "$lookup": {
                        "from": "clothing",
                        "let": {"cid": "$clothing_id"},
                        "pipeline": [
                            {"$match": {"$expr": {"$eq": [{"$toString": "$_id"}, "$$cid"]}} },
                            {"$project": {"_id": {"$toString": "$_id"}, "brand_id": {"$toString": "$brand_id"}, "name": 1}}
                        ],
                        "as": "clothing_doc"
                    }
                },
                {"$unwind": "$clothing_doc"},
                # Agrupar ventas por brand_id resuelto desde el documento de clothing
                {
                    "$group": {
                        "_id": "$clothing_doc.brand_id",
                        "ventas": {"$sum": {"$ifNull": ["$quantity", {"$ifNull": ["$amount", 0]}]}}
                    }
                },
                # Traer datos de la marca
                {
                    "$lookup": {
                        "from": "brands",
                        "let": {"bid": "$_id"},
                        "pipeline": [
                            {"$match": {"$expr": {"$eq": [{"$toString": "$_id"}, "$$bid"]}} },
                            {"$project": {"_id": {"$toString": "$_id"}, "name": 1, "country": 1}}
                        ],
                        "as": "brand_doc"
                    }
                },
                {"$unwind": "$brand_doc"},
                {"$project": {"brand": "$brand_doc.name", "brand_id": "$brand_doc._id", "ventas": 1}},
                {"$sort": {"ventas": -1}}
            ]

            result = list(mongo.db.sales.aggregate(pipeline))
            # Normalizar la salida: {brand, ventas}
            return [{"brand": r.get("brand"), "ventas": int(r.get("ventas", 0)), "brand_id": r.get("brand_id")} for r in result]
        except Exception as e:
            print("ReportsModel.obtener_marcas_con_ventas error:", e)
            return []

    @staticmethod
    def obtener_prendas_vendidas_stock():
        """
        Retorna lista de prendas con:
          { item_id, name, sold, in_stock, remaining }
        Usa aggregation sobre 'clothing' con lookup a 'sales' para sumar cantidades.
        """
        try:
            pipeline = [
                # Para cada prenda, buscar ventas que coincidan (coincidir por string(_id))
                {
                    "$lookup": {
                        "from": "sales",
                        "let": {"cid": "$_id"},
                        "pipeline": [
                            {"$match": {"$expr": {"$eq": [{"$toString": "$clothing_id"}, {"$toString": "$$cid"}]}} },
                            {"$project": {"quantity": {"$ifNull": ["$quantity", {"$ifNull": ["$amount", 0]}]}, "date": 1}}
                        ],
                        "as": "ventas"
                    }
                },
                # sumar las cantidades vendidas (ventas.quantity es un arreglo)
                {
                    "$addFields": {
                        "sold": {"$ifNull": [{"$sum": "$ventas.quantity"}, 0]},
                        # normalizar campo de stock (in_stock o stock)
                        "in_stock": {"$ifNull": ["$in_stock", "$stock"]}
                    }
                },
                {
                    "$project": {
                        "_id": {"$toString": "$_id"},
                        "item_id": {"$toString": "$_id"},
                        "name": 1,
                        "sold": {"$toInt": {"$ifNull": ["$sold", 0]}},
                        "in_stock": 1,
                        "remaining": {
                            "$cond": [
                                {"$and": [{"$ne": ["$in_stock", None]}, {"$ne": ["$sold", None]}]},
                                {"$subtract": ["$in_stock", {"$ifNull": ["$sold", 0]}]},
                                None
                            ]
                        }
                    }
                },
                {"$sort": {"sold": -1, "name": 1}}
            ]

            result = list(mongo.db.clothing.aggregate(pipeline))
            # Asegurar tipos y nombres consistentes
            out = []
            for r in result:
                in_stock = r.get("in_stock", None)
                sold = int(r.get("sold", 0))
                remaining = None
                try:
                    if in_stock is not None:
                        remaining = int(in_stock) - sold
                except Exception:
                    remaining = None
                out.append({
                    "item_id": r.get("item_id"),
                    "name": r.get("name"),
                    "sold": sold,
                    "in_stock": in_stock if in_stock is not None else None,
                    "remaining": remaining
                })
            return out
        except Exception as e:
            print("ReportsModel.obtener_prendas_vendidas_stock error:", e)
            return []

    @staticmethod
    def obtener_top5_marcas():
        """
        Retorna las 5 marcas con más ventas: { brand, ventas }
        Reusa el pipeline de marcas y limita a 5.
        """
        try:
            pipeline = [
                # lookup clothing from sales
                {
                    "$lookup": {
                        "from": "clothing",
                        "let": {"cid": "$clothing_id"},
                        "pipeline": [
                            {"$match": {"$expr": {"$eq": [{"$toString": "$_id"}, "$$cid"]}} },
                            {"$project": {"brand_id": {"$toString": "$brand_id"}}}
                        ],
                        "as": "clothing_doc"
                    }
                },
                {"$unwind": "$clothing_doc"},
                {"$group": {"_id": "$clothing_doc.brand_id", "ventas": {"$sum": {"$ifNull": ["$quantity", {"$ifNull": ["$amount", 0]}]}}}},
                {"$sort": {"ventas": -1}},
                {"$limit": 5},
                {
                    "$lookup": {
                        "from": "brands",
                        "let": {"bid": "$_id"},
                        "pipeline": [
                            {"$match": {"$expr": {"$eq": [{"$toString": "$_id"}, "$$bid"]}} },
                            {"$project": {"_id": {"$toString": "$_id"}, "name": 1}}
                        ],
                        "as": "brand_doc"
                    }
                },
                {"$unwind": "$brand_doc"},
                {"$project": {"brand": "$brand_doc.name", "ventas": 1}}
            ]

            result = list(mongo.db.sales.aggregate(pipeline))
            return [{"brand": r.get("brand"), "ventas": int(r.get("ventas", 0))} for r in result]
        except Exception as e:
            print("ReportsModel.obtener_top5_marcas error:", e)
            return []

    @staticmethod
    def obtener_todos_combinado():
        """
        Retorna un objeto combinado con:
         {
           "brands_with_sales": [...],
           "items_sold": [...],
           "top5_brands": [...]
         }
        Útil para tener un único endpoint que el front-end puede consumir.
        """
        try:
            marcas = ReportsModel.obtener_marcas_con_ventas()
            prendas = ReportsModel.obtener_prendas_vendidas_stock()
            top5 = ReportsModel.obtener_top5_marcas()
            # Normalizar nombres de campos para el front
            brands_with_sales = [{"name": m.get("brand"), "sales_count": m.get("ventas", 0), "brand_id": m.get("brand_id")} for m in marcas]
            items_sold = [{"item_id": p.get("item_id"), "name": p.get("name"), "sold": p.get("sold", 0), "in_stock": p.get("in_stock"), "remaining": p.get("remaining")} for p in prendas]
            top5_brands = [{"name": t.get("brand"), "sales_count": t.get("ventas", 0)} for t in top5]

            return {
                "brands_with_sales": brands_with_sales,
                "items_sold": items_sold,
                "top5_brands": top5_brands
            }
        except Exception as e:
            print("ReportsModel.obtener_todos_combinado error:", e)
            return {"brands_with_sales": [], "items_sold": [], "top5_brands": []}