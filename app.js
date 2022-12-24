const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const { json } = require("body-parser");
const _ = require("lodash");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todoListDB", {
  useNewUrlParser: true,
});
const itemSchema = {
  name: String,
};
const listSchema = {
  name: String,
  items: [itemSchema],
};
const List = mongoose.model("List", listSchema);
const Item = mongoose.model("Item", itemSchema);
const item1 = new Item({
  name: "Code",
});
const item2 = new Item({
  name: "Read",
});

const item3 = new Item({
  name: "Run",
});

const defaultArray = [item1, item2, item3];

// Item.deleteMany({name:"Read"},function(err){
//   if(err) console.log(err);
// })

app.get("/", function (req, res) {
  Item.find(function (err, items) {
    if (err) console.log(err);
    else if (items.length === 0) {
      Item.insertMany(defaultArray, function (err) {
        if (err) console.log(err);
        else console.log("Succesfully added to the todoListDB");
        res.redirect("/");
      });
    } else {
      res.render("list", { listTitle: "Today", newListItems: items });
    }
  });
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }, function (err, results) {
    if (!err) {
      if (!results) {
        //Create a new List
        const list = new List({
          name: customListName,
          items: defaultArray,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //Show an existing list.
        res.render("list", {
          listTitle: results.name,
          newListItems: results.items,
        });
      }
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});
app.post("/delete", function (req, res) {
  const box = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndRemove(box, function (err) {
      if (err) console.log(err);
      else {
        console.log("Checked item was deleted.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: box } } },
      function(err,foundList){
        if(!err) res.redirect("/"+listName);
      }      
    );
  }
});

// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "Work List", newListItems: workList });
// });

app.post("/work", function (req, res) {
  let workItem = req.body.newItem;
  workList.push(workItem);
  res.redirect("/");
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server is up and running.");
});

// const day = date.getDate();

// let item = req.body.newItem;
//   if (req.body.list === "Work") {
//     workList.push(item);
//     res.redirect("/work");
//   } else {
//     items.push(item);
//     res.redirect("/");
//   }
