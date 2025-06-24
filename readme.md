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

## 🔐 Variables de entorno

---

## 👥 Integrantes del proyecto

* Julian Hernandez
* Gabriel Mata
