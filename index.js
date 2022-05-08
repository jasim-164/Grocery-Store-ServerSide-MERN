const express = require('express')
const app = express()
const cors = require("cors");
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
let port = 4000 || process.env.PORT;

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://jasim-1703164:vNEHaHWsdF8B5pCn@cluster0.r19pq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { 
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1 });


async function run() {
  try {
    await client.connect();
    const database = client.db('grocerystock');
    const productCollection = database.collection('products');
        // get api to read all products
    //http://localhost:4000/products
    app.get("/products", async (req, res) => {
      const q = req.query;
      console.log(q);
      const cursor = productCollection.find( q);

      const result = await cursor.toArray();

      res.send(result);
    });
    app.post("/product",async (req, res) => {
      const data=req.body;
      console.log(data);
      const result= await productCollection.insertOne(data);
      res.send(result);
    })


    app.delete("/product/:id",async (req, res) => {
      const id=req.params.id;
      const query = {_id: ObjectId(id)};
      const result= await productCollection.deleteOne(query);
      res.send(result);
    })


    app.put("/product/:id",async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      console.log(data.quantity);
      console.log("from update api", data);
      const filter = { _id: id };
      console.log(filter);


      const options = { upsert: true };

      const updateDoc = {
        $set: {
          quantity: data.quantity,
        },
    }
    const result = await productCollection.updateOne(
      filter,
      updateDoc,
      options
    );
    // console.log('from put method',id)
    res.send(result);
     } )








    console.log("connected to db");

    // Query for a movie that has the title 'Back to the Future'
   // const query = { title: 'Back to the Future' };
   // const movie = await movies.findOne(query);

    //console.log(movie);
  } 
  finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})