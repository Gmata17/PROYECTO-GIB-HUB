const { MongoClient } = require("mongodb");

require("dotenv").config();

const uri = process.env.MONGODB_URI;

const dbName = "Tienda_de_Ropa";

const client = new MongoClient(uri); // Eliminé las opciones obsoletas

async function main() {
  try {
    // Conecta al cliente

    await client.connect();

    console.log("Conectado correctamente a MongoDB Atlas");

    // Obtiene la referencia a la base de datos

    const db = client.db(dbName);

    // Obtiene referencias a las colecciones

    const usuarios = db.collection("Usuarios");

    const marcas = db.collection("Marcas");

    const prendas = db.collection("Prendas");

    const ventas = db.collection("Ventas");

    // INSERTAR UN USUARIO

    const usuarioInsertado = await usuarios.insertOne({
      nombre: "Luis Morales",

      email: "luis@example.com",

      direccion: "Cartago, Costa Rica",
    });

    console.log(`Usuario insertado con ID: ${usuarioInsertado.insertedId}`);

    // INSERTAR VARIAS MARCAS

    const marcasInsertadas = await marcas.insertMany([
      { nombre: "Zara" },

      { nombre: "Adidas" },

      { nombre: "Levi's" },
    ]);

    console.log(`${marcasInsertadas.insertedCount} marcas insertadas`);

    // INSERTAR UNA PRENDA

    const prendaInsertada = await prendas.insertOne({
      nombre: "Camiseta Negra",

      talla: "L",

      precio: 17000,

      marca: "Zara",

      coleccion: "Verano 2025",

      stock: 20,
    });

    console.log(`Prenda insertada con ID: ${prendaInsertada.insertedId}`);

    // INSERTAR VARIAS VENTAS

    const ventasInsertadas = await ventas.insertMany([
      {
        prenda: "Camiseta Negra",

        marca: "Zara",

        cantidad: 2,

        fecha: new Date("2025-06-01"),
      },

      {
        prenda: "Pantalón Jeans",

        marca: "Levi's",

        cantidad: 3,

        fecha: new Date("2025-06-01"),
      },

      {
        prenda: "Camiseta Negra",

        marca: "Zara",

        cantidad: 1,

        fecha: new Date("2025-06-05"),
      },
    ]);

    console.log(`${ventasInsertadas.insertedCount} ventas insertadas`);

    // ACTUALIZAR STOCK DE PRENDA

    const actualizacion = await prendas.updateOne(
      { nombre: "Camiseta Negra" },

      { $inc: { stock: -3 } } // Usé $inc para restar las 3 unidades vendidas
    );

    console.log(`${actualizacion.modifiedCount} documento actualizado`);

    // ELIMINAR UNA MARCA

    const eliminacion = await marcas.deleteOne({ nombre: "Levi's" });

    console.log(`${eliminacion.deletedCount} marca eliminada`);

    // CONSULTAS

    // i. Cantidad vendida por fecha específica

    const fechaFiltro = new Date("2025-06-01");

    const ventasPorFecha = await ventas
      .aggregate([
        { $match: { fecha: fechaFiltro } },

        {
          $group: {
            _id: "$fecha",

            totalVendidas: { $sum: "$cantidad" },
          },
        },
      ])
      .toArray();

    console.log("\nVentas por fecha:", ventasPorFecha);

    // ii. Lista de marcas con al menos una venta

    const marcasVendidas = await ventas.distinct("marca");

    console.log("\nMarcas con ventas:", marcasVendidas);

    // iii. Prendas vendidas y su cantidad restante en stock

    const prendasVendidas = await ventas
      .aggregate([
        {
          $group: {
            _id: "$prenda",

            totalVendida: { $sum: "$cantidad" },
          },
        },

        {
          $lookup: {
            from: "prendas",

            localField: "_id",

            foreignField: "nombre",

            as: "detallePrenda",
          },
        },

        { $unwind: "$detallePrenda" },

        {
          $project: {
            prenda: "$_id",

            totalVendida: 1,

            stockRestante: "$detallePrenda.stock",
          },
        },
      ])
      .toArray();

    console.log("\nPrendas vendidas y stock:", prendasVendidas);

    // iv. Top 5 marcas más vendidas

    const topMarcas = await ventas
      .aggregate([
        {
          $group: {
            _id: "$marca",

            totalVentas: { $sum: "$cantidad" },
          },
        },

        { $sort: { totalVentas: -1 } },

        { $limit: 5 },
      ])
      .toArray();

    console.log("\nTop 5 marcas más vendidas:", topMarcas);
  } catch (error) {
    console.error("\nError en la operación:", error);
  } finally {
    await client.close();

    console.log("\nConexión cerrada");
  }
}

main();
