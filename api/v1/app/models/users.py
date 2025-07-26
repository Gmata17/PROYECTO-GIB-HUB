from bson.objectid import ObjectId
from app.index import mongo

class UsersModel:
    @staticmethod
    def obtener_todos():
        users_cursor = mongo.db.users.find()
        users = []
        for user in users_cursor:
            user["_id"] = str(user["_id"])
            users.append(user)
        return users

    @staticmethod
    def obtener_por_id(id):
        try:
            user = mongo.db.users.find_one({"_id": ObjectId(id)})
            if user:
                user["_id"] = str(user["_id"])
            return user
        except:
            return None

    @staticmethod
    def crear(data):
        try:
            result = mongo.db.users.insert_one(data)
            return str(result.inserted_id)
        except:
            return None

    @staticmethod
    def actualizar(id, data):
        try:
            result = mongo.db.users.update_one({"_id": ObjectId(id)}, {"$set": data})
            return result.modified_count
        except:
            return -1

    @staticmethod
    def eliminar(id):
        try:
            result = mongo.db.users.delete_one({"_id": ObjectId(id)})
            return result.deleted_count
        except:
            return -1
