from bson.objectid import ObjectId
from app.index import mongo

class SalesModel:
    @staticmethod
    def obtener_todos():
        sales_cursor = mongo.db.sales.find()
        sales = []
        for sale in sales_cursor:
            sale["_id"] = str(sale["_id"])
            sales.append(sale)
        return sales

    @staticmethod
    def obtener_por_id(id):
        try:
            sale = mongo.db.sales.find_one({"_id": ObjectId(id)})
            if sale:
                sale["_id"] = str(sale["_id"])
            return sale
        except:
            return None

    @staticmethod
    def crear(data):
        try:
            result = mongo.db.sales.insert_one(data)
            return str(result.inserted_id)
        except:
            return None

    @staticmethod
    def actualizar(id, data):
        try:
            result = mongo.db.sales.update_one({"_id": ObjectId(id)}, {"$set": data})
            return result.modified_count
        except:
            return -1

    @staticmethod
    def eliminar(id):
        try:
            result = mongo.db.sales.delete_one({"_id": ObjectId(id)})
            return result.deleted_count
        except:
            return -1
