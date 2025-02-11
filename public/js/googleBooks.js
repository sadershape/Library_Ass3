document.addEventListener("DOMContentLoaded", function () {
    const searchForm = document.getElementById("googleBooksSearchForm");
    const searchInput = document.getElementById("googleBooksQuery");
    const resultsContainer = document.getElementById("googleBooksResults");

    searchForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const query = searchInput.value.trim();
        if (!query) {
            resultsContainer.innerHTML = "<p>Please enter a search term.</p>";
            return;
        }

        resultsContainer.innerHTML = "<p>Loading books...</p>";

        try {
            // ✅ Fetch directly from Google Books API
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            resultsContainer.innerHTML = ""; // Clear previous results

            if (!data.items || data.items.length === 0) {
                resultsContainer.innerHTML = "<p>No books found.</p>";
                return;
            }

            data.items.forEach(book => {
                const bookInfo = book.volumeInfo;
                const listItem = document.createElement("div");
                listItem.classList.add("col-md-4");

                listItem.innerHTML = `
                    <div class="card mb-4">
                        <img src="${bookInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x190?text=No+Image'}" 
                             alt="${bookInfo.title}" class="card-img-top">
                        <div class="card-body">
                            <h5 class="card-title">${bookInfo.title}</h5>
                            <p class="card-text"><strong>Author:</strong> ${bookInfo.authors ? bookInfo.authors.join(", ") : "Unknown"}</p>
                            <p class="card-text"><strong>Published:</strong> ${bookInfo.publishedDate || "N/A"}</p>
                            <a href="${bookInfo.infoLink}" target="_blank" class="btn btn-primary">More Info</a>
                        </div>
                    </div>
                `;

                resultsContainer.appendChild(listItem);
            });
        } catch (error) {
            console.error("❌ Error fetching books:", error);
            resultsContainer.innerHTML = "<p>❌ Error fetching books. Try again later.</p>";
        }
    });
});
