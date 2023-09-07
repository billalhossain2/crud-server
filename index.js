const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 3000;
const cors = require("cors");

//Middlewares
app.use(cors());
app.use(express.json());

//default route
app.get("/", (req, res) => {
  res.send(`Crud app is running on port ${port}`);
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.0ak1okw.mongodb.net/?retryWrites=true&w=majority`;

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
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    const database = client.db("usersDB");
    const users = database.collection("users");

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const result = await users.insertOne(newUser);
      res.send(newUser);
    });

    app.get("/users", async (req, res) => {
      const cursor = users.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      // Query for a user that has id
      const query = { _id: new ObjectId(id) };
      const result = await users.deleteOne(query);

      res.send(result);
    });

    app.put("/users/:id", async (req, res) => {
      const updateId = req.params.id;
      const updatableUser = req.body;
      const filter = { _id: new ObjectId(updateId) };
      // this option instructs the method to create a document if no documents match the filter
      const options = { upsert: false };

      // create a document that sets the plot of the movie
      const updateDoc = {
        $set: updatableUser,
      };

      const result = await users.updateOne(filter, updateDoc, options);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Crud is listening on port ${port}`);
});
