document.addEventListener("DOMContentLoaded", function () {
    const searchForm = document.getElementById("googleBooksSearchForm");
    const searchInput = document.getElementById("googleBooksQuery");
    const resultsContainer = document.getElementById("googleBooksResults");

    searchForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const query = searchInput.value.trim();
        if (!query) return;

        resultsContainer.innerHTML = "<p>Loading books...</p>";

        try {
            // ✅ New API route without key
            const response = await fetch(`/books/googlebooks/search?q=${encodeURIComponent(query)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const books = await response.json();

            resultsContainer.innerHTML = ""; // Clear previous results

            if (!books.length) {
                resultsContainer.innerHTML = "<p>No books found.</p>";
                return;
            }

            books.forEach(book => {
                const listItem = document.createElement("li");

                listItem.innerHTML = `
                    <h3>${book.title}</h3>
                    <p><strong>Author:</strong> ${book.author}</p>
                    <p><strong>Published:</strong> ${book.publishedDate || "N/A"}</p>
                    <a href="${book.googleBooksUrl}" target="_blank">More Info</a>
                    ${book.cover ? `<img src="${book.cover}" width="100">` : ""}
                `;

                resultsContainer.appendChild(listItem);
            });
        } catch (error) {
            console.error("❌ Error fetching books:", error);
            resultsContainer.innerHTML = "<p>❌ Error fetching books. Try again later.</p>";
        }
    });
});
