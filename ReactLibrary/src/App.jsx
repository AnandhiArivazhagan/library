import { useEffect, useState, useRef } from "react";
import "./App.css";

function App() {
  const API_URL = "https://library-backend-i81i.onrender.com/books";

  const [books, setBooks] = useState([]);
  const [currentCategory, setCurrentCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Fiction");
  const [introOpen, setIntroOpen] = useState(true);
  const imageRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);

  // Load books from backend
  const loadBooks = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setBooks(data);
    } catch (err) {
      console.error("Failed to load books:", err);
    }
  };

  // Intro animation + load books
  useEffect(() => {
    const intro = document.getElementById("introBook");
    const timer1 = setTimeout(() => {
      intro.classList.add("open");
    }, 300);

    const timer2 = setTimeout(() => {
      intro.classList.add("hidden");
      setIntroOpen(false);
    }, 2000);

    loadBooks();

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Add book
  const addBook = async () => {
    if (!title.trim()) return alert("Book Name is required!");

    let imageData = "";

    if (imageFile) {
      const reader = new FileReader();
      reader.onload = async () => {
        imageData = reader.result;

        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            author,
            price,
            category,
            image: imageData,
            read: false,
          }),
        });

        loadBooks();
      };
      reader.readAsDataURL(imageFile);
    } else {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          author,
          price,
          category,
          read: false,
        }),
      });

      loadBooks();
    }

    // Reset form
    setTitle("");
    setAuthor("");
    setPrice("");
    setCategory("Fiction");
    setImageFile(null);
    if (imageRef.current) imageRef.current.value = null;
  };

  // Toggle read
  const toggleRead = async (id) => {
    const book = books.find((b) => b._id === id);
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: !book.read }),
    });
    loadBooks();
  };

  // Remove book
  const removeBook = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    loadBooks();
  };

  // Filter books
  const filterBooks = (cat) => {
    setCurrentCategory(cat);
  };

  // Toggle theme
  const toggleTheme = () => {
    document.body.classList.toggle("dark");
  };

  // Filtered + searched books
  const displayedBooks = books.filter(
    (book) =>
      (currentCategory === "All" || book.category === currentCategory) &&
      book.title.toLowerCase().includes(search.toLowerCase())
  );

  const readCount = displayedBooks.filter((b) => b.read).length;
  const unreadCount = displayedBooks.filter((b) => !b.read).length;

  return (
    <>
      {introOpen && (
        <div className="intro-book" id="introBook">
          <div className="book-wrapper">
            <div className="cover left-cover"></div>
            <div className="cover right-cover"></div>
          </div>
        </div>
      )}

      <div className={`book-container ${introOpen ? "hidden" : ""}`}>
        <div className="top-bar">
          <h1>📚 My Reading Library</h1>
          <button className="theme-toggle" onClick={toggleTheme}>
            🌙
          </button>
        </div>

        <input
          type="text"
          id="searchInput"
          placeholder="🔍 Search books..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="form-section">
          <input
            type="text"
            placeholder="Book Name *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Author (Optional)"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
          <input
            type="number"
            placeholder="Price (Optional)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Fiction">Fiction</option>
            <option value="Non-Fiction">Non-Fiction</option>
            <option value="Others">Others</option>
          </select>
          <input
            type="file"
            ref={imageRef}
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
          <button className="add-btn" onClick={addBook}>
            Add Book
          </button>
        </div>

        <div className="filters">
          {["All", "Fiction", "Non-Fiction", "Others"].map((cat) => (
            <button key={cat} onClick={() => filterBooks(cat)}>
              {cat}
            </button>
          ))}
        </div>

        <div className="stats">
          📖 Read: <span id="readCount">{readCount}</span> | 📕 Unread:{" "}
          <span id="unreadCount">{unreadCount}</span>
        </div>

        <div className="book-list" id="bookList">
          {displayedBooks.map((book) => (
            <div className="book-card" key={book._id}>
              {book.image && <img src={book.image} alt={book.title} />}
              <h3>{book.title}</h3>
              {book.author && (
                <p>
                  <strong>Author:</strong> {book.author}
                </p>
              )}
              {book.price && (
                <p>
                  <strong>Price:</strong> ₹{book.price}
                </p>
              )}
              <p>
                <strong>Category:</strong> {book.category}
              </p>
              <button
                className={`read-btn ${book.read ? "active" : ""}`}
                onClick={() => toggleRead(book._id)}
              >
                {book.read ? "✔ Read" : "Mark as Read"}
              </button>
              <button
                className="remove-btn"
                onClick={() => removeBook(book._id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;