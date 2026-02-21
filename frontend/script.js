const API_URL = "http://localhost:3000/books";

let books = [];
let currentCategory = "All";


// 🎬 Intro Animation
window.onload = async () => {
  const intro = document.getElementById("introBook");

  setTimeout(() => intro.classList.add("open"), 300);
  setTimeout(() => {
    intro.style.display = "none";
    document.querySelector(".book-container").classList.remove("hidden");
  }, 2000);

  await loadBooks();
};


// ===== LOAD BOOKS FROM DATABASE =====
async function loadBooks() {
  const res = await fetch(API_URL);
  books = await res.json();
  renderBooks();
}


// ===== ADD BOOK =====
async function addBook() {
  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value;
  const price = document.getElementById("price").value;
  const category = document.getElementById("category").value;
  const imageInput = document.getElementById("image");

  if (!title) {
    alert("Book Name is required!");
    return;
  }

  let imageData = "";

  if (imageInput.files[0]) {
    const reader = new FileReader();

    reader.onload = async function () {
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
          read: false
        })
      });

      loadBooks();
    };

    reader.readAsDataURL(imageInput.files[0]);
  } else {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        author,
        price,
        category,
        read: false
      })
    });

    loadBooks();
  }

  document.getElementById("title").value = "";
  document.getElementById("author").value = "";
  document.getElementById("price").value = "";
  imageInput.value = "";
}


// ===== RENDER =====
function renderBooks() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const bookList = document.getElementById("bookList");
  bookList.innerHTML = "";

  let readCount = 0;
  let unreadCount = 0;

  books
    .filter(book =>
      (currentCategory === "All" || book.category === currentCategory) &&
      book.title.toLowerCase().includes(search)
    )
    .forEach(book => {

      if (book.read) readCount++;
      else unreadCount++;

      const card = document.createElement("div");
      card.className = "book-card";

      card.innerHTML = `
        ${book.image ? `<img src="${book.image}">` : ""}
        <h3>${book.title}</h3>
        ${book.author ? `<p><strong>Author:</strong> ${book.author}</p>` : ""}
        ${book.price ? `<p><strong>Price:</strong> ₹${book.price}</p>` : ""}
        <p><strong>Category:</strong> ${book.category}</p>

        <button class="read-btn ${book.read ? 'active' : ''}" onclick="toggleRead('${book._id}')">
          ${book.read ? '✔ Read' : 'Mark as Read'}
        </button>

        <button class="remove-btn" onclick="removeBook('${book._id}')">
          Remove
        </button>
      `;

      bookList.appendChild(card);
    });

  document.getElementById("readCount").innerText = readCount;
  document.getElementById("unreadCount").innerText = unreadCount;
}


// ===== TOGGLE READ =====
async function toggleRead(id) {
  const book = books.find(b => b._id === id);

  await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ read: !book.read })
  });

  loadBooks();
}


// ===== DELETE =====
async function removeBook(id) {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  });

  loadBooks();
}


// ===== FILTER =====
function filterBooks(category) {
  currentCategory = category;
  renderBooks();
}


function toggleTheme() {
  document.body.classList.toggle("dark");
}