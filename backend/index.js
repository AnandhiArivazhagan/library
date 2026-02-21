// ===== IMPORTS =====
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Book = require("./model/book");   // ✅ correct model

const app = express();

app.use(express.json());
app.use(cors());

// ===== DATABASE CONNECTION =====
mongoose.connect("mongodb+srv://Anandhi:anandhi_2005@cluster0.favzmu6.mongodb.net/libraryDB?appName=Cluster0")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.log(err));


// ===== GET ALL BOOKS =====
app.get("/books", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ===== ADD BOOK =====
app.post("/books", async (req, res) => {
  try {
    const newBook = new Book(req.body);
    await newBook.save();
    res.json(newBook);
  } catch (err) {
    console.log("POST ERROR:", err.message);
    res.status(400).json({ error: err.message });
  }
});


// ===== UPDATE BOOK =====
app.put("/books/:id", async (req, res) => {
  try {
    const updated = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// ===== DELETE BOOK =====
app.delete("/books/:id", async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Book deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Server running on port", PORT));