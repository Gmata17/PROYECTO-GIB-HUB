require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function main() {
  try {
    await client.connect();
    const db = client.db("tienda_ropa");

    const usuarios = db.collection("usuarios");
    const marcas = db.collection("marcas");
    const prendas = db.collection("prendas");
    const ventas = db.collection("ventas");

    // INSERTAR UN USUARIO
    await usuarios.insertOne({
      nombre: "Luis Morales",
      email: "luis@example.com",
      direccion: "Cartago, Costa Rica"
    });

    // INSERTAR VARIAS MARCAS
    await marcas.insertMany([
      { nombre: "Zara" },
      { nombre: "Adidas" },
      { nombre: "Levi's" }
    ]);

    // INSERTAR UNA PRENDA
    await prendas.insertOne({
      nombre: "Camiseta Negra",
      talla: "L",
      precio: 17000,
      marca: "Zara",
      coleccion: "Verano 2025",
      stock: 20
    });

    // INSERTAR VARIAS VENTAS
    await ventas.insertMany([
      {
        prenda: "Camiseta Negra",
        marca: "Zara",
        cantidad: 2,
        fecha: new Date("2025-06-01")
      },
      {
        prenda: "Pantalón Jeans",
        marca: "Levi's",
        cantidad: 3,
        fecha: new Date("2025-06-01")
      },
      {
        prenda: "Camiseta Negra",
        marca: "Zara",
        cantidad: 1,
        fecha: new Date("2025-06-05")
      }
    ]);

    // ACTUALIZAR STOCK DE PRENDA
    await prendas.updateOne(
      { nombre: "Camiseta Negra" },
      { $set: { stock: 18 } }
    );

    // ELIMINAR UNA MARCA
    await marcas.deleteOne({ nombre: "Levi's" });

    // CONSULTAS

    // i. Cantidad vendida por fecha específica
    // Esta consulta agrupa las ventas por fecha y muestra la cantidad total vendida en esa fecha.
    const fechaFiltro = new Date("2025-06-01");
    const ventasPorFecha = await ventas.aggregate([
      { $match: { fecha: fechaFiltro } },
      {
        $group: {
          _id: "$fecha",
          totalVendidas: { $sum: "$cantidad" }
        }
      }
    ]).toArray();
    console.log("Ventas por fecha:", ventasPorFecha);

    // ii. Lista de marcas con al menos una venta
    // Esta consulta muestra todas las marcas que han registrado al menos una venta.
    const marcasVendidas = await ventas.distinct("marca");
    console.log("Marcas con ventas:", marcasVendidas);

    // iii. Prendas vendidas y su cantidad restante en stock
    // Esta consulta muestra cada prenda vendida y el stock actual.
    const prendasVendidas = await ventas.aggregate([
      {
        $group: {
          _id: "$prenda",
          totalVendida: { $sum: "$cantidad" }
        }
      },
      {
        $lookup: {
          from: "prendas",
          localField: "_id",
          foreignField: "nombre",
          as: "detallePrenda"
        }
      },
      { $unwind: "$detallePrenda" },
      {
        $project: {
          prenda: "$_id",
          totalVendida: 1,
          stockRestante: "$detallePrenda.stock"
        }
      }
    ]).toArray();
    console.log("Prendas vendidas y stock:", prendasVendidas);

    // iv. Top 5 marcas más vendidas
    // Esta consulta agrupa por marca, suma las ventas y muestra las 5 con más ventas.
    const topMarcas = await ventas.aggregate([
      {
        $group: {
          _id: "$marca",
          totalVentas: { $sum: "$cantidad" }
        }
      },
      { $sort: { totalVentas: -1 } },
      { $limit: 5 }
    ]).toArray();
    console.log("Top 5 marcas más vendidas:", topMarcas);

  } catch (error) {
    console.error("Error en la operación:", error);
  } finally {
    await client.close();
  }
}

main();