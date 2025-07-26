# 🛍️ Sistema Online de Ropa

Este proyecto consiste en el desarrollo de una API utilizando **Node.js**, **MongoDB** y **Git**, para la gestión de una tienda de ropa. La API permite realizar operaciones **CRUD** (Crear, Leer, Actualizar y Eliminar) sobre varias colecciones: `usuarios`, `marcas` y `prendas`.

## ⚙️ Funcionalidades principales

* Inserción y consulta de **usuarios**.
* Registro y eliminación de **marcas** de ropa.
* Gestión de **prendas** (nombre, talla, precio, stock, colección, marca).
* Control de **ventas** y análisis de ventas por fechas y marcas.
* Consultas específicas mediante **MongoDB Aggregation Framework**.

## 🧾 Colecciones de la base de datos (`tienda_ropa`)

### 👤 Usuarios

```json
{
  "nombre": "Luis Morales",
  "email": "luis@example.com",
  "direccion": "Cartago, Costa Rica"
}
```

### 🏷️ Marcas

```json
[
  { "nombre": "Zara" },
  { "nombre": "Adidas" },
  { "nombre": "Levi's" }
]
```

### 👕 Prendas

```json
{
  "nombre": "Camiseta Negra",
  "talla": "L",
  "precio": 17000,
  "marca": "Zara",
  "coleccion": "Verano 2025",
  "stock": 20
}
```

## 🔍 Consultas destacadas

1. 📆 **Ventas por fecha específica**
   Muestra la cantidad total vendida en una fecha concreta.

2. 🏷️ **Marcas con al menos una venta**
   Lista las marcas que han registrado ventas.

3. 📦 **Prendas vendidas con su stock actual**
   Combina datos de `ventas` y `prendas` para mostrar el stock restante por prenda.

4. ⭐ **Top 5 marcas más vendidas**
   Ranking de marcas basado en la cantidad de prendas vendidas.

---

## 👥 Integrantes del proyecto

* Julian Hernandez
* Gabriel Mata

# Endpoints API - Colección de Postman

Esta colección de Postman contiene los endpoints principales para probar la API de administración de **brands**.

## 🌐 Base URL
```
http://127.0.0.1:5000/api/v1/admin/brands
```

## 📦 Endpoints disponibles

### 1. Obtener todos
- **Método:** `GET`
- **URL:** `/brands`
- **Descripción:** Obtiene todos los registros de marcas.
- **Ejemplo:**  
  ```bash
  GET http://127.0.0.1:5000/api/v1/admin/brands
  ```

### 2. Obtener por ID
- **Método:** `GET`
- **URL:** `/brands?id=<id>`
- **Descripción:** Retorna una marca específica por su ID.

### 3. Crear marca
- **Método:** `POST`
- **URL:** `/brands`
- **Body (JSON):**
  ```json
  {
    "name": "Jerusalem",
    "country": "Israel",
    "founded": 1948
  }
  ```

### 4. Actualizar marca
- **Método:** `PUT`
- **URL:** `/brands?id=<id>`
- **Body (JSON):**
  ```json
  {
    "name": "PuebloDios",
    "country": "Belen",
    "founded": 2000
  }
  ```

### 5. Eliminar marca
- **Método:** `DELETE`
- **URL:** `/brands?id=<id>`
- **Descripción:** Elimina una marca existente por ID.

---

## 📁 Importar en Postman

Puedes importar el archivo `Endpoints API.postman_collection.json` directamente en Postman para comenzar a probar los endpoints.

1. Abre Postman
2. Clic en **Import**
3. Selecciona el archivo `.json` de esta colección

---

## ✍️ Autor
Generado automáticamente para pruebas de API con Flask y MongoDB.