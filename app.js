const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require('lodash');
const Contact = require("./contact");
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;
const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);



const homeStartingContent = "Welcome to daily journal!";
const aboutContent = "Write your notes here";
const contactContent = "Feel free to contact us using the form below.";

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://somaiya3899:dev383838@cluster0.zq6fbtv.mongodb.net/DailyJournalDB?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

const postSchema = new Schema({
  title: { type: String, required: [true, 'Please enter a title'] },
  content: { type: String, required: [true, 'Please enter some content'] }
});

const Post = mongoose.model("Post", postSchema);



app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  if (username === "admin" && password === "password") {
    res.redirect("/");
  } else {
    res.render("login", { error: "Invalid username or password" });
  }
});

app.get("/", function (req, res) {
  Post.find({}) // Replace this with your query object
    .exec()
    .then(posts => {
      res.render("home", {
        startingContent: homeStartingContent,
        posts: posts,
      });
    })
    .catch(err => console.log(err));
});

app.get("/about", function (req, res) {
  res.render("about", { theAboutContent: aboutContent });
});

app.get("/contact", function (req, res) {
  res.render("contact", { theContactContent: contactContent });
});

app.get("/compose", function (req, res) {
  res.render("compose");
});

app.post("/compose", function (req, res) {
  const post = new Post({
    title: req.body.postTitle.join(', '),
    content: req.body.postBody
  });

  post.save()
    .then(() => {
      res.redirect("/");
    })
    .catch(err => console.log(err));
});
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await User.create({ username, password });
    res.redirect('/login');
  } catch (error) {
    res.render('signup', { error: error.message });
  }
});
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error('Invalid username or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid username or password');
    }

    res.redirect('/');
  } catch (error) {
    console.log(error);
    res.render('login', { error: error.message });
  }
});

app.get("/posts/:postId", function (req, res) {
  const requestedPostId = req.params.postId;

  Post.findOne({ _id: requestedPostId })
    .exec()
    .then(post => {
      res.render("post", {
        title: post.title,
        content: post.content
      });
    })
    .catch(err => console.log(err));
});
app.get("/todo", function(req, res) {
  res.sendFile(__dirname + "/todolist-v2-completed-app/views");
});
app.get("/signup", function(req, res) {
  res.render("signup", { error: null });
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post("/contact", function (req, res) {
  const contact = new Contact({
    name: req.body.name,
    email: req.body.email,
    message: req.body.message,
  });
  
  contact.save()
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/");
    });
});

app.post("/delete", function (req, res) {
  const postId = req.body.postId;

  Post.findByIdAndRemove(postId)
    .then(() => {
      console.log("Successfully deleted post.");
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/signup", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  // Check if user already exists
  User.findOne({ username: username })
    .exec()
    .then(user => {
      if (user) {
        // User already exists, redirect back to sign-up page with error message
        res.render("signup", { error: "Username already taken" });
      } else {
        // User doesn't exist, create new user and redirect to login page
        const newUser = new User({
          username: username,
          password: password
        });

        newUser.save()
          .then(() => {
            res.redirect("/login");
          })
          .catch(err => console.log(err));
      }
    })
    .catch(err => console.log(err));
});

// rest of the code...
app.post("/update", function(req, res) {
  const postId = req.body.postId;
  const newTitle = req.body.newTitle;
  const newContent = req.body.newContent;

  Post.findByIdAndUpdate(postId, { title: newTitle, content: newContent }, { new: true })
    .then(updatedPost => {
      res.redirect("/");
    })
    .catch(err => {
      console.log(err);
    });
});
app.listen(3000, function () {
console.log("Server started on port 3000");
});