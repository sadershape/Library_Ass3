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

        resultsContainer.innerHTML = "<div class='spinner-border text-primary' role='status'></div>";

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

            // ✅ Display Books in Cards
            data.items.forEach(book => {
                const bookInfo = book.volumeInfo;
                const bookCard = document.createElement("div");
                bookCard.classList.add("col");

                bookCard.innerHTML = `
                    <div class="card h-100 shadow-sm">
                        <img src="${bookInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x190?text=No+Image'}" 
                             alt="${bookInfo.title}" class="card-img-top">
                        <div class="card-body">
                            <h5 class="card-title">${bookInfo.title}</h5>
                            <p class="card-text"><strong>Author:</strong> ${bookInfo.authors ? bookInfo.authors.join(", ") : "Unknown"}</p>
                            <p class="card-text"><strong>Published:</strong> ${bookInfo.publishedDate || "N/A"}</p>
                        </div>
                        <div class="card-footer">
                            <a href="${bookInfo.infoLink}" target="_blank" class="btn btn-primary w-100">📘 More Info</a>
                        </div>
                    </div>
                `;

                resultsContainer.appendChild(bookCard);
            });
        } catch (error) {
            console.error("❌ Error fetching books:", error);
            resultsContainer.innerHTML = "<p class='alert alert-danger'>❌ Error fetching books. Try again later.</p>";
        }
    });
});
