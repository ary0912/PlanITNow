const mongoose = require('mongoose');
const express = require("express");
const app = express(); // create express app
const router = express.Router();

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
});

const Contact = mongoose.model("Contact", contactSchema);

mongoose.connect("mongodb+srv://somaiya3899:dev383838@cluster0.zq6fbtv.mongodb.net/ContactDB?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

router.post("/contact", function (req, res) {
  const contact = new Contact({
    name: req.body.name,
    email: req.body.email,
    message: req.body.message
  });

  contact.save()
    .then(() => {
      console.log('Contact saved successfully!');
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error saving contact');
    });
});

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use("/", router);

module.exports = Contact;