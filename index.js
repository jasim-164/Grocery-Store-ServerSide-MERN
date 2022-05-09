const express = require('express')
const app = express()
const cors = require("cors");
require('dotenv').config();
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
      return res.status(401).send({ message: 'unauthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
          return res.status(403).send({ message: 'Forbidden access' });
      }
      console.log('decoded', decoded);
      req.decoded = decoded;
      next();
  })
}





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.r19pq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { 
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1 });

//require('crypto').randomBytes(64).toString('hex')
async function run() {

  try {
    await client.connect();
    const database = client.db('grocerystock');
    const productCollection = database.collection('products');
    const orderCollection = database.collection('order');
        
        //FOR AUTH JWT TOKEN
        app.post('/login',async(req,res) => {
          const user =req.body;
          const accessToken=jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{
            expiresIn:'1d'
          });
          console.log({accessToken});
          res.send({accessToken});

        })
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

     
  // Order Collection API

            app.get('/order', verifyJWT, async (req, res) => {
              const decodedEmail = req.decoded.email;
              const email = req.query.email;
              if (email === decodedEmail) {
                  const query = { email: email };
                  const cursor = orderCollection.find(query);
                  const orders = await cursor.toArray();
                  res.send(orders);
              }
              else{
                  res.status(403).send({message: 'forbidden access'})
              }
          })
          app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })








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
  console.log("App is running on port ", {port});
});