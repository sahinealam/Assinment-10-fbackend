const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Mongodb setup
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const e = require("cors");
const port = 3000;
const app = express();
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://assingment-10:HalyVFSXXlVxFL9O@cluster0.qmqsv1k.mongodb.net/?appName=Cluster0";

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
    await client.connect();

    const database = client.db("petservice");
    const petservices = database.collection("services");
    // post api service  add data-base
    app.post("/services", async (req, res) => {
      const data = req.body;
      const dat = new Date();
      data.createdAT = dat;
      console.log(data);
      console.log(data);

      const result = await petservices.insertOne(data);
      res.send(result);
    });
    //  get services from Data-Base
    app.get("/services", async (req, res) => {
      const result = await petservices.find().toArray();
      res.send(result);
    });

    // get single service by id

    app.get("/services/:id", async (req, res) => {
      const id = req.params;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await petservices.findOne(query);
      res.send(result);
    });
    // my services by data
    app.get("/my-services", async (req, res) => {
      const { email } = req.query;

      const query = { email: email };
      const result = await petservices.find(query).toArray();
      res.send(result);
      
    });
    // data update api
    app.put("/update/:id", async (req, res) => {
      const data = req.body;
      const id = req.params;
      const query = { _id: new ObjectId(id) };
      const updateServices = {
        $set: data,
      };
      const result = await petservices.updateOne(query, updateServices);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("assingment-10");
});

app.listen(port, () => {
  console.log(`service is running on port ${port}`);
});
