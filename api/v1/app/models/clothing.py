from bson.objectid import ObjectId
from app.index import mongo

class ClothingModel:
    @staticmethod
    def obtener_todos():
        clothes_cursor = mongo.db.clothing.find()
        clothes = []
        for item in clothes_cursor:
            item["_id"] = str(item["_id"])
            clothes.append(item)
        return clothes

    @staticmethod
    def obtener_por_id(id):
        try:
            item = mongo.db.clothing.find_one({"_id": ObjectId(id)})
            if item:
                item["_id"] = str(item["_id"])
            return item
        except:
            return None

    @staticmethod
    def crear(data):
        try:
            result = mongo.db.clothing.insert_one(data)
            return str(result.inserted_id)
        except:
            return None

    @staticmethod
    def actualizar(id, data):
        try:
            result = mongo.db.clothing.update_one({"_id": ObjectId(id)}, {"$set": data})
            return result.modified_count
        except:
            return -1

    @staticmethod
    def eliminar(id):
        try:
            result = mongo.db.clothing.delete_one({"_id": ObjectId(id)})
            return result.deleted_count
        except:
            return -1
