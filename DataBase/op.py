import os
from dotenv import load_dotenv
from pymongo import MongoClient, UpdateOne, errors
from datetime import datetime, timedelta

load_dotenv()

uri = os.getenv("MONGO_URI")
client = MongoClient(uri)

def main():
    print("\n➡️ Conectando a la base de datos...")

    db = client['clothing-store-db']

    brands = db.brands

    clothing = db.clothing

    users = db.users

    sales = db.sales
 
    try:

        print('\n--- UPSERT DE MARCAS ---')

        brands.bulk_write([

            UpdateOne({'_id': 'brand010'}, {'$set': {'name': 'UrbanStyle', 'country': 'USA', 'founded': 2018}}, upsert=True),

            UpdateOne({'_id': 'brand011'}, {'$set': {'name': 'CostaRicaWear', 'country': 'Costa Rica', 'founded': 2022}}, upsert=True),

        ])

        print('✔️ Marcas insertadas o actualizadas.')
 
        print('\n--- ELIMINACIÓN DE MARCAS ---')

        result = brands.delete_one({'_id': 'brand003'})

        print("🗑️ Marca brand003 eliminada." if result.deleted_count else "⚠️ Marca brand003 no encontrada.")
 
        print('\n--- UPSERT DE ROPA ---')

        clothing.bulk_write([

            UpdateOne({'_id': 'cloth010'}, {'$set': {

                'name': 'Urban Jacket',

                'category': 'Outerwear',

                'price': 89.95,

                'size': ['S', 'M', 'L', 'XL'],

                'color': 'Black',

                'brand_id': 'brand010',

                'in_stock': 150

            }}, upsert=True)

        ])

        print("✔️ Nueva prenda agregada o actualizada.")
 
        print('\n--- UPSERT DE USUARIO ---')

        users.bulk_write([

            UpdateOne({'_id': 'user010'}, {'$set': {

                'name': 'Carlos Jiménez',

                'email': 'carlos.jimenez@example.com',

                'password': 'hashedcarlos123',

                'address': {'city': 'San José', 'country': 'Costa Rica'},

                'orders': []

            }}, upsert=True)

        ])

        print("✔️ Usuario insertado o actualizado.")
 
        print('\n--- INSERTAR VENTA ---')

        try:

            sales.insert_one({

                '_id': 'sale010',

                'user_id': 'user010',

                'clothing_id': 'cloth010',

                'quantity': 3,

                'date': datetime.now()

            })

            print("✔️ Venta sale010 registrada.")

        except errors.DuplicateKeyError:

            print("⚠️ La venta sale010 ya existe.")
 
        print('\n--- ACTUALIZAR STOCK ---')

        clothing.update_one({'_id': 'cloth010'}, {'$inc': {'in_stock': -3}})

        print("✔️ Stock de cloth010 reducido en 3 unidades.")
 
        print('\n--- NUEVAS CONSULTAS ---')

        show_recent_sales(sales)

        show_stock_by_category(clothing)

        show_top_clothing(sales, clothing)

        show_top_brands_by_sales(sales, clothing, brands)
 
    except Exception as e:

        print("\n❌ Error en operaciones:", e)

    finally:

        client.close()

        print("\n🔒 Conexión cerrada.")
 
def show_recent_sales(sales):

    print("\n📆 Ventas en los últimos 7 días:")

    today = datetime.now()

    week_ago = today - timedelta(days=7)

    results = sales.aggregate([

        {'$match': {'date': {'$gte': week_ago}}},

        {'$group': {'_id': '$clothing_id', 'total': {'$sum': '$quantity'}}}

    ])

    for r in results:

        print(f"   • Prenda {r['_id']} vendida {r['total']} veces")
 
def show_stock_by_category(clothing):

    print("\n📦 Stock total por categoría:")

    results = clothing.aggregate([

        {'$group': {'_id': '$category', 'stock_total': {'$sum': '$in_stock'}}}

    ])

    for r in results:

        print(f"   • {r['_id']}: {r['stock_total']} unidades en stock")
 
def show_top_clothing(sales, clothing):

    print("\n👕 Top 3 prendas más vendidas:")

    top = sales.aggregate([

        {'$group': {'_id': '$clothing_id', 'totalSold': {'$sum': '$quantity'}}},

        {'$sort': {'totalSold': -1}}, {'$limit': 3},

        {'$lookup': {'from': 'clothing', 'localField': '_id', 'foreignField': '_id', 'as': 'item'}},

        {'$unwind': '$item'},

        {'$project': {'name': '$item.name', 'totalSold': 1}}

    ])

    for i, item in enumerate(top, 1):

        print(f"   {i}. {item['name']}: {item['totalSold']} ventas")
 
def show_top_brands_by_sales(sales, clothing, brands):

    print("\n🏆 Top 3 marcas por ventas:")

    top = sales.aggregate([

        {'$lookup': {'from': 'clothing', 'localField': 'clothing_id', 'foreignField': '_id', 'as': 'c'}},

        {'$unwind': '$c'},

        {'$group': {'_id': '$c.brand_id', 'totalSales': {'$sum': '$quantity'}}},

        {'$sort': {'totalSales': -1}}, {'$limit': 3},

        {'$lookup': {'from': 'brands', 'localField': '_id', 'foreignField': '_id', 'as': 'b'}},

        {'$unwind': '$b'},

        {'$project': {'brand': '$b.name', 'totalSales': 1}}

    ])

    for i, b in enumerate(top, 1):

        print(f"   {i}. {b['brand']}: {b['totalSales']} unidades vendidas")
 
if __name__ == "__main__":

    main()
 