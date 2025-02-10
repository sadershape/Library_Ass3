document.getElementById("openLibrarySearchForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const query = document.getElementById("openLibraryQuery").value;
    const resultsContainer = document.getElementById("openLibraryResults");

    resultsContainer.innerHTML = "<p>Loading books...</p>";

    try {
        const response = await fetch(`/api/openlibrary/search?q=${encodeURIComponent(query)}`);
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
                <p><strong>First Published:</strong> ${book.first_publish_year || "N/A"}</p>
                <a href="${book.openLibraryUrl}" target="_blank">More Info</a>
                ${book.cover ? `<img src="${book.cover}" width="100">` : ""}
            `;

            resultsContainer.appendChild(listItem);
        });
    } catch (error) {
        console.error("❌ Error fetching books:", error);
        resultsContainer.innerHTML = "<p>❌ Error fetching books. Try again later.</p>";
    }
});
