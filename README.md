# MONGOOSE

## What is Mongoose?

Mongoose is a library that we use to communicate with MongoDB. It provides us with a lot of useful methods to interact with our database.

## Connection with the database

We need to create a .env file to store the connection string (URI). We can get it from the MongoDB Atlas or by clicking on the "..." in our mongoDB compass and "Copy connection string".

The .env file should look like this:

```
MONGO_URI=mongodb+srv://your_username:your_password@your_cluster_url/DATABASE_NAME
```

⚠️ Don't forget to add the database name at the end of the URI.

To use the .env file we need to install the dotenv package:

```bash
npm install dotenv
```

And then require it in our app.js file:

```javascript
require("dotenv").config();
```

We don't need to create a variable because we just want to load the .env file.

In js we can connect to the database like this:

```javascript
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, () => {
  console.log("Connected to the database");
});
```

## Model vs Schema

A schema is a blueprint of the document that we want to store in the database. There we define the structure of the document.

A model is the way we have to interact with the database. We can create, read, update and delete documents.

### Schema

```javascript
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  age: Number,
});
```

Our schema is ready and we can use it to create the model.

### Model

```javascript
// previous code

const User = mongoose.model("User", userSchema); // now we have a model

// and we export it:
module.exports = User;
```

When the model is done, we can use it in our routes to interact with the database. The database will know where to store and find the documents.

## CRUD operations

### Create

```javascript
const User = require("./models/User");

app.post("/users", async (req, res) => {
  const newUser = {
    name: req.body.name,
    age: req.body.age,
  };

  const response = await User.create(newUser);

  res.json(response);
});
```

### Read

```javascript
app.get("/users", async (req, res) => {
  const users = await User.find();

  res.json(users);
});
```

### Update

```javascript
app.put("/users/:userId", async (req, res) => {
  const { userId } = req.params;
  const updatedUser = {
    name: req.body.name,
    age: req.body.age,
  };

  const response = await User.findByIdAndUpdate(userId, updatedUser, {
    new: true,
  });

  res.json(response);
});
```

### Delete

```javascript
app.delete("/users/:userId", async (req, res) => {
  const { userId } = req.params;

  const response = await User.findByIdAndDelete(userId);

  res.json(response);
});
```

## Relationships

We can create relationships between models. For example, a user can have multiple posts.
We can add to the user schema a field called posts and set it to an array of objects.

```javascript
const userSchema = new Schema({
  name: String,
  age: Number,
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
});
```

Now we can retrieve the info about the user and populate the posts field.

```javascript
app.get("/users/:userId", async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).populate("posts");

  res.json(user);
});
```
