import os
from flask import Flask
from flask_pymongo import PyMongo
from flask_cors import CORS
from dotenv import load_dotenv

mongo = PyMongo()

def create_app():
    load_dotenv()  # Cargar variables de .env

    app = Flask(__name__)
    app.config["MONGO_URI"] = os.getenv("MONGO_URI")

    mongo.init_app(app)
    CORS(app)

    # Importar los controladores correctos
    from .controllers.brands import brands_endpoint
    from .controllers.clothing import clothing_endpoint
    from .controllers.sales import sales_endpoint
    from .controllers.users import users_endpoint
    from .controllers.reports import reports_endpoint

    # Registrar los blueprints con prefijos adecuados
    app.register_blueprint(brands_endpoint, url_prefix="/api/v1/admin")
    app.register_blueprint(clothing_endpoint, url_prefix="/api/v1/admin")
    app.register_blueprint(sales_endpoint, url_prefix="/api/v1/admin")
    app.register_blueprint(users_endpoint, url_prefix="/api/v1/admin")
    app.register_blueprint(reports_endpoint, url_prefix="/api/v1/admin")
    CORS(app, origins="*")  # Permitir CORS para todos los orígenes

    return app
