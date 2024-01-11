const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.033buvy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const itemCollection = client.db("fashionDB").collection("fashion");

    const userCollection = client.db("fashionDB").collection("user");
    // item crud operations
    app.get("/items", async (req, res) => {
      const cursor = itemCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/items/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await itemCollection.findOne(query);
      res.send(result);
    });

    app.post("/items", async (req, res) => {
      const newItem = req.body;
      console.log(newItem);
      const result = await itemCollection.insertOne(newItem);
      res.send(result);
    });

    app.put("/items/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedItem = req.body;
      const item = {
        $set: {
          name: updatedItem.name,
          brand: updatedItem.brand,
          type: updatedItem.type,
          price: updatedItem.price,
          short_description: updatedItem.short_description,
          image: updatedItem.image,
        },
      };
      const result = await itemCollection.updateOne(filter, item, options);
      res.send(result);
    });

    app.delete("/items/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await itemCollection.deleteOne(query);
      res.send(result);
    });

    // user crud operations/related api 
    app.get("/user", async (req, res) => {
      const cursor = userCollection.find();
      const users = await cursor.toArray();
      res.send(users);
    });

    app.post('/user', async(req,res) =>{
      const user =req.body;
      console.log(user)
      const result = await userCollection.insertOne(user);
      res.send(result);

    });
app.patch('/user' , async(req,res) => {
  const user = req.body;
  const filter ={
    email:user.email
  }
  const updateDoc = {
    $set: {
      lastLoggedAt:user.lastLoggedAt
    }
  }
  const result = await userCollection.updateOne(filter,updateDoc,)
  res.send(result);
})

    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Fashion server is running");
});

app.listen(port, () => {
  console.log(`Fashion server is running on port:${port}`);
});
