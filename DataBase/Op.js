// operaciones.js
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://<db_username>:<db_password>@cluster0.y0y1ah1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
 
async function main() {
  await client.connect();
  const db = client.db('tienda_ropa');
  // aquí van las operaciones
}
 
main()
  .catch(console.error)
  .finally(() => client.close());

run()
.catch(console.dir);
