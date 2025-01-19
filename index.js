require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mzx0h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    //
    const database = client.db("learnQuestDB");
    const usersCollection = database.collection("users");
    const classesCollection = database.collection("classes");
    const applicationsCollection = database.collection("applications");

    // USERS RELATED API's

    // Endpoint to create a new user
    app.post("/users", async (req, res) => {
      try {
        const user = req.body;
        const query = { email: user.email };
        const existingUser = await usersCollection.findOne(query);
        if (existingUser) {
          return res.send({
            message: "user already exists on the DB",
            insertedId: null,
          });
        }
        const result = await usersCollection.insertOne(user);
        res.send(result);
      } catch (err) {
        res.send({ error: "Failed to insert user" });
      }
    });

    // Endpoint to create api for all users
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // CLASS RELATED API's

    // Endpoint to create a new class
    app.post("/classes", async (req, res) => {
      const newClass = req.body;
      // console.log(newClass)
      const result = await classesCollection.insertOne(newClass);
      res.send(result);
    });

    // Endpoint to create api for all classes
    app.get("/classes", async (req, res) => {
      const result = await classesCollection.find().toArray();
      res.send(result);
    });
    // Endpoint to create api to find single class by id
    app.get("/class/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await classesCollection.findOne(query);
      res.send(result);
    });
    // Endpoint to create api to find single class by email
    app.get("/my-class/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email};
      const result = await classesCollection.find(query).toArray();
      res.send(result);
    });

    // APPLICATION RELATED API's

    // Endpoint to create a new job applications
    app.post("/applications", async (req, res) => {
      const newJobApplication = req.body;
      const result = await applicationsCollection.insertOne(newJobApplication);
      res.send(result);
    });
    // Endpoint to create api for all applications
    app.get('/applications', async(req, res)=>{
      const result = await applicationsCollection.find().toArray();
      res.send(result);
    });

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`LearnQuest listening on port ${port}`);
});
