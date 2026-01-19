const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// MongoDB connection
const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qmqsv1k.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    const database = client.db("petservice");
    const servicesCollection = database.collection("services");
    const ordersCollection = database.collection("orders");

    // Add a new service
    app.post("/services", async (req, res) => {
      try {
        const data = req.body;
        data.createdAt = new Date();

        // make sure email is provided
        if (!data.email) {
          return res.status(400).json({ error: "Email is required" });
        }

        const result = await servicesCollection.insertOne(data);
        res.status(201).json(result);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add service" });
      }
    });

    // Get all services (latest 6 or by category)
    app.get("/services", async (req, res) => {
      try {
        const { category } = req.query;
        const query = {};
        if (category) query.category = category;

        const services = await servicesCollection
          .find(query)
          .sort({ createdAt: -1 })
          .limit(6)
          .toArray();

        res.json(services);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch services" });
      }
    });

    // Get all services (for /allservices page)
    app.get("/allservices", async (req, res) => {
      try {
        const { category } = req.query;
        const query = {};
        if (category) query.category = category;

        const services = await servicesCollection
          .find(query)
          .sort({ createdAt: -1 })
          .toArray();

        res.json(services);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch all services" });
      }
    });

    // Get single service by ID
    app.get("/services/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const service = await servicesCollection.findOne({
          _id: new ObjectId(id),
        });
        res.json(service);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch service" });
      }
    });

    // Get  my-services by user email
    app.get("/my-services", async (req, res) => {
      try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: "Email required" });

        const services = await servicesCollection.find({ email }).toArray();
        res.json(services);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch services" });
      }
    });

    // Delete a service
    app.delete("/delete/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await servicesCollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (result.deletedCount === 0)
          return res.status(404).json({ error: "Service not found" });
        res.json({ message: "Service deleted" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete service" });
      }
    });

    // Update a service
    app.put("/update-service/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updateData = req.body;

        const result = await servicesCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.matchedCount === 0)
          return res.status(404).json({ error: "Service not found" });
        res.json({ message: "Service updated" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update service" });
      }
    });

    // myoders post Orders
    app.post("/orders", async (req, res) => {
      const data = req.body;
      const result = await ordersCollection.insertOne(data);
      res.status(201).json(result);
    });

    // my orders get
    app.get("/orders", async (req, res) => {
      try {
        const { email } = req.query;
        const query = email ? { buyerEmail: email } : {}; // ← use buyerEmail from DB
        const orders = await ordersCollection.find(query).toArray();
        res.json(orders);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch orders" });
      }
    });

    // Test route
    app.get("/", (req, res) => {
      res.send("Backend is running!");
    });

    console.log("Connected to MongoDB");
  } finally {
    // Don't close client during dev
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
