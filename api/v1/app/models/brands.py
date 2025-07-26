from bson.objectid import ObjectId
from app.index import mongo

class BrandsModel:
    @staticmethod
    def obtener_todos():
        brands_cursor = mongo.db.brands.find()
        brands = []
        for brand in brands_cursor:
            brand["_id"] = str(brand["_id"])
            brands.append(brand)
        return brands

    @staticmethod
    def obtener_por_id(id):
        try:
            brand = mongo.db.brands.find_one({"_id": ObjectId(id)})
            if brand:
                brand["_id"] = str(brand["_id"])
            return brand
        except:
            return None

    @staticmethod
    def crear(data):
        try:
            result = mongo.db.brands.insert_one(data)
            return str(result.inserted_id)
        except:
            return None

    @staticmethod
    def actualizar(id, data):
        try:
            result = mongo.db.brands.update_one({"_id": ObjectId(id)}, {"$set": data})
            return result.modified_count
        except:
            return -1

    @staticmethod
    def eliminar(id):
        try:
            result = mongo.db.brands.delete_one({"_id": ObjectId(id)})
            return result.deleted_count
        except:
            return -1
