<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Library Home</title>
    <!-- Подключаем Bootstrap -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
    <!-- Подключаем ваши стили (они будут загружаться после Bootstrap) -->
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <%- include("navbar", { session: session }) %>

    <!-- About Section -->
    <section class="about-section">
        <div class="row">
            <!-- Фото слева -->
            <div class="col-md-4">
                <img src="/path/to/Libraryphoto.webp" class="img-fluid" alt="About Image">
            </div>
            <!-- Текст справа -->
            <div class="col-md-8">
                <h2>About Us</h2>
                <p>This is some information about the project...</p>
            </div>
        </div>
    </section>

    <hr>

    <!-- Items Section -->
    <section class="items-section">
        <div class="container">
            <div class="row">
                <% items.forEach(item => { %>
                    <div class="col-md-4 mb-4">
                        <div class="card">
                            <div id="carousel<%= item._id %>" class="carousel slide" data-bs-ride="carousel">
                                <div class="carousel-inner">
                                    <div class="carousel-item active">
                                        <img src="<%= item.images[0] %>" class="d-block w-100" alt="Item Image 1">
                                    </div>
                                    <div class="carousel-item">
                                        <img src="<%= item.images[1] %>" class="d-block w-100" alt="Item Image 2">
                                    </div>
                                    <div class="carousel-item">
                                        <img src="<%= item.images[2] %>" class="d-block w-100" alt="Item Image 3">
                                    </div>
                                </div>
                                <button class="carousel-control-prev" type="button" data-bs-target="#carousel<%= item._id %>" data-bs-slide="prev">
                                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                    <span class="visually-hidden">Previous</span>
                                </button>
                                <button class="carousel-control-next" type="button" data-bs-target="#carousel<%= item._id %>" data-bs-slide="next">
                                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                    <span class="visually-hidden">Next</span>
                                </button>
                            </div>
                            <div class="card-body">
                                <h5 class="card-title"><%= item.name_en %> / <%= item.name_other %></h5>
                                <p class="card-text"><%= item.description_en %></p>
                                <p class="card-text"><%= item.description_other %></p>
                                <p class="card-text"><small class="text-muted">Created: <%= new Date(item.createdAt).toLocaleDateString() %></small></p>
                            </div>
                        </div>
                    </div>
                <% }) %>
            </div>
        </div>
    </section>

    <!-- Кнопка Quiz -->
    <button id="quizButton" class="btn btn-warning">Start Quiz</button>

    <%- include("footer") %>

    <script>
        document.getElementById('quizButton').addEventListener('click', function () {
            window.location.href = "/quiz"; // Redirect to the quiz page
        });
    </script>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
