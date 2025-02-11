document.addEventListener("DOMContentLoaded", function () {
    const searchForm = document.getElementById("googleBooksSearchForm");
    const searchInput = document.getElementById("googleBooksQuery");
    const resultsContainer = document.getElementById("googleBooksResults");

    searchForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const query = searchInput.value.trim();
        if (!query) {
            resultsContainer.innerHTML = "<p class='alert alert-warning'>Please enter a search term.</p>";
            return;
        }

        resultsContainer.innerHTML = "<p class='loading'>🔄 Loading books...</p>";

        try {
            // ✅ Fetch Google Books API Data
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            resultsContainer.innerHTML = ""; // Clear previous results

            if (!data.items || data.items.length === 0) {
                resultsContainer.innerHTML = "<p class='alert alert-danger'>No books found.</p>";
                return;
            }

            // ✅ Display Books in Same Style as Open Library & Gutenberg
            data.items.forEach(book => {
                const bookInfo = book.volumeInfo;
                const bookElement = document.createElement("div");
                bookElement.classList.add("book-card");

                bookElement.innerHTML = `
                    <div class="book-img">
                        <img src="${bookInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x190?text=No+Image'}" 
                             alt="${bookInfo.title}">
                    </div>
                    <div class="book-info">
                        <h3>${bookInfo.title}</h3>
                        <p><strong>Author:</strong> ${bookInfo.authors ? bookInfo.authors.join(", ") : "Unknown"}</p>
                        <p><strong>Published:</strong> ${bookInfo.publishedDate || "N/A"}</p>
                        <a href="${bookInfo.infoLink}" target="_blank" class="btn">📘 More Info</a>
                    </div>
                `;

                resultsContainer.appendChild(bookElement);
            });
        } catch (error) {
            console.error("❌ Error fetching books:", error);
            resultsContainer.innerHTML = "<p class='alert alert-danger'>❌ Error fetching books. Try again later.</p>";
        }
    });
});
