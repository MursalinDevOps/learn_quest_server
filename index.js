require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const stripe = require("stripe")(process.env.STRIPE_SK);
const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(express.json());
app.use(cors());

// todo: add env's to vercel

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lqe7v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    //

    const database = client.db("learnQuestDB");

    const usersCollection = database.collection("users");
    const classesCollection = database.collection("classes");
    const applicationsCollection = database.collection("applications");
    const myEnrollCollection = database.collection("myEnroll");
    const feedbackCollection = database.collection("feedback");

    //! USERS RELATED API's

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

    // Endpoint to create api to find single user by id
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    // Endpoint for patch student to teacher
    app.patch("/user/role/teacher/:email", async (req, res) => {
      const result = await usersCollection.updateOne(
        { email: req.params.email },
        { $set: { role: "teacher" } }
      );
      res.send(result);
    });

    // Endpoint to update an user's role
    app.patch("/users/:id/role", async (req, res) => {
      const { id } = req.params;
      const { role } = req.body;
      // console.log("ID:",id,"STATUS:",status)
      const query = { _id: new ObjectId(id) };
      const updatedRole = {
        $set: { role },
      };
      const result = await usersCollection.updateOne(query, updatedRole);
      res.send(result);
    });

    // Endpoint to search
    app.get("/search-user", async (req, res) => {
      const searchKey = req.query.k;

      const regex = new RegExp(searchKey, "i");

      // Use the regex in the MongoDB query
      const result = await usersCollection
        .find({ name: { $regex: regex } })
        .toArray();
      res.send(result);
    });

    //! CLASS RELATED API's

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

    // Endpoint to update a class's status
    app.patch("/classes/:id/status", async (req, res) => {
      const { id } = req.params;
      const { status } = req.body;
      // console.log("ID:",id,"STATUS:",status)
      const query = { _id: new ObjectId(id) };
      const updatedStatus = {
        $set: { status },
      };
      const result = await classesCollection.updateOne(query, updatedStatus);
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
      const query = { email: email };
      const result = await classesCollection.find(query).toArray();
      res.send(result);
    });

    // Endpoint to delete a class from classes collection
    app.delete("/class/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await classesCollection.deleteOne(query);
      res.send(result);
    });

    // Endpoint to update a class from classes collection

    app.put("/class/:id", async (req, res) => {
      const { id } = req.params;
      const updatedClass = req.body;
      const query = { _id: new ObjectId(id) };
      const updatedItem = {
        $set: updatedClass,
      };
      const result = await classesCollection.updateOne(query, updatedItem);
      res.send(result);
    });

    // Endpoint to update assignment classes doc
    app.patch("/class/assignment/:id", async (req, res) => {
      const { id } = req.params;
      const assignmentData = req.body;

      const newAssignmentData = {
        ...assignmentData,
        _id: new ObjectId(),
      };

      const updateDoc = {
        $push: {
          assignments: newAssignmentData,
        },
      };

      const result = await classesCollection.updateOne(
        { _id: new ObjectId(id) },
        updateDoc
      );
      res.send(result);
    });

    app.get("/popular-classes", async (req, res) => {
      const result = await classesCollection
        .find({})
        .sort({ enrollCount: -1 })
        .limit(4)
        .toArray();
      res.send(result);
    });

    //! APPLICATION RELATED API's

    // Endpoint to create a new job applications
    app.post("/applications", async (req, res) => {
      const newJobApplication = req.body;
      const result = await applicationsCollection.insertOne(newJobApplication);
      res.send(result);
    });

    // Endpoint to create api for all applications
    app.get("/applications", async (req, res) => {
      const result = await applicationsCollection.find().toArray();
      res.send(result);
    });

    // Endpoint to update a user's application status
    app.patch("/applications/:id/status", async (req, res) => {
      const { id } = req.params;
      const { status } = req.body;
      const query = { _id: new ObjectId(id) };
      const updatedStatus = {
        $set: { status },
      };
      const result = await applicationsCollection.updateOne(
        query,
        updatedStatus
      );
      res.send(result);
    });

    // Endpoint get api for single application
    app.get("/application/:email", async (req, res) => {
      const { email } = req.params;
      const application = await applicationsCollection.findOne({
        email: email,
      });
      if (application) {
        res.send({ applied: true, application });
      } else {
        res.send({ applied: false });
      }
    });

    //! Enroll RELATED API's

    app.post("/my-enroll", async (req, res) => {
      const data = req.body;
      const insertResult = await myEnrollCollection.insertOne(data);

      const increaseResult = await classesCollection.updateOne(
        { _id: new ObjectId(data.classId) },
        { $inc: { enrollCount: 1 } }
      );
      res.send({ insertResult, increaseResult });
    });

    // user based enrolled classes
    app.get("/my-enroll/:email", async (req, res) => {
      const { email } = req.params;

      const result = await myEnrollCollection
        .aggregate([
          {
            $match: { user: email },
          },
          {
            $addFields: {
              classId: { $convert: { input: "$classId", to: "objectId" } },
            },
          },
          {
            $lookup: {
              from: "classes",
              localField: "classId",
              foreignField: "_id",
              as: "classData",
            },
          },
          {
            $unwind: "$classData",
          },
        ])
        .toArray();
      res.send(result);
    });

    // Single enroll class
    app.get("/enroll-class/:id", async (req, res) => {
      const { id } = req.params;

      const result = await myEnrollCollection
        .aggregate([
          {
            $match: { _id: new ObjectId(id) }, // Convert to ObjectId here
          },
          {
            $addFields: {
              classId: { $convert: { input: "$classId", to: "objectId" } },
            },
          },
          {
            $lookup: {
              from: "classes",
              localField: "classId",
              foreignField: "_id",
              as: "classData",
            },
          },
          {
            $unwind: "$classData",
          },
        ])
        .toArray();

      res.send(result);
    });

    //! Assignment Submit Related API's

    app.patch("/assignment-count", async (req, res) => {
      const { id, aid } = req.body;

      const result = await classesCollection.updateOne(
        {
          _id: new ObjectId(id),
          "assignments._id": new ObjectId(aid),
        },
        {
          $inc: { "assignments.$.submitCount": 1 },
        }
      );

      res.send(result);
    });

    // ! Feed back API's

    app.post("/feedback", async (req, res) => {
      const data = req.body;
      const result = await feedbackCollection.insertOne(data);
      res.send(result);
    });

    // Feed back get
    app.get("/feedback", async (req, res) => {
      const result = await feedbackCollection.find().toArray();
      res.send(result);
    });

    // ! for state on home 

    app.get('/stats', async (req, res) => {

      const userCount = await usersCollection.estimatedDocumentCount();
      const classCount = await classesCollection.estimatedDocumentCount();
      const totalEnrollCount = await classesCollection.aggregate([
        {$group: {_id: null, totalEnrollCount: {$sum: "$enrollCount"}}}
      ]).toArray();
      res.send({userCount, classCount, enrollCount: totalEnrollCount[0].totalEnrollCount})
    })

    //!  Endpoint For Payment Intent

    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;

      const amount = parseInt(price * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });
  } finally {
    //
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`LearnQuest listening on port ${port}`);
});
