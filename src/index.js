// src/index.js

document.addEventListener('DOMContentLoaded', () => {
    const quoteList = document.getElementById('quote-list');
    const newQuoteForm = document.getElementById('new-quote-form');
    let isSorted = false;

    // Fetch and render quotes on page load
    fetchQuotes();

    // Handle new quote submission
    newQuoteForm.addEventListener('submit', handleNewQuote);

    function fetchQuotes(sort = false) {
        const url = sort 
            ? 'http://localhost:3000/quotes?_sort=author&_embed=likes'
            : 'http://localhost:3000/quotes?_embed=likes';
        
        fetch(url)
            .then(response => response.json())
            .then(quotes => renderQuotes(quotes))
            .catch(error => console.error('Error fetching quotes:', error));
    }

    function renderQuotes(quotes) {
        quoteList.innerHTML = '';
        quotes.forEach(quote => {
            const li = document.createElement('li');
            li.className = 'quote-card';
            li.innerHTML = `
                <blockquote class="blockquote">
                    <p class="mb-0">${quote.quote}</p>
                    <footer class="blockquote-footer">${quote.author}</footer>
                    <br>
                    <button class='btn-success' data-id="${quote.id}">
                        Likes: <span>${quote.likes.length}</span>
                    </button>
                    <button class='btn-danger' data-id="${quote.id}">Delete</button>
                    <button class='btn-info' data-id="${quote.id}">Edit</button>
                </blockquote>
                <form class="edit-form" style="display: none;" data-id="${quote.id}">
                    <input type="text" name="quote" value="${quote.quote}">
                    <input type="text" name="author" value="${quote.author}">
                    <button type="submit">Save</button>
                </form>
            `;
            quoteList.appendChild(li);
        });

        // Add event listeners
        document.querySelectorAll('.btn-success').forEach(btn => 
            btn.addEventListener('click', handleLike));
        document.querySelectorAll('.btn-danger').forEach(btn => 
            btn.addEventListener('click', handleDelete));
        document.querySelectorAll('.btn-info').forEach(btn => 
            btn.addEventListener('click', handleEdit));
        document.querySelectorAll('.edit-form').forEach(form => 
            form.addEventListener('submit', handleEditSubmit));
    }

    function handleNewQuote(e) {
        e.preventDefault();
        const quote = e.target.quote.value;
        const author = e.target.author.value;

        fetch('http://localhost:3000/quotes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quote, author })
        })
        .then(response => response.json())
        .then(newQuote => {
            fetchQuotes(isSorted); // Refresh list with new quote
            e.target.reset();
        })
        .catch(error => console.error('Error creating quote:', error));
    }

    function handleLike(e) {
        const quoteId = parseInt(e.target.dataset.id);
        fetch('http://localhost:3000/likes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                quoteId,
                createdAt: Math.floor(Date.now() / 1000) // Bonus: UNIX timestamp
            })
        })
        .then(() => fetchQuotes(isSorted)) // Refresh list with updated likes
        .catch(error => console.error('Error liking quote:', error));
    }

    function handleDelete(e) {
        const quoteId = e.target.dataset.id;
        fetch(`http://localhost:3000/quotes/${quoteId}`, {
            method: 'DELETE'
        })
        .then(() => fetchQuotes(isSorted)) // Refresh list
        .catch(error => console.error('Error deleting quote:', error));
    }

    function handleEdit(e) {
        const quoteId = e.target.dataset.id;
        const editForm = document.querySelector(`form[data-id="${quoteId}"]`);
        editForm.style.display = editForm.style.display === 'none' ? 'block' : 'none';
    }

    function handleEditSubmit(e) {
        e.preventDefault();
        const quoteId = e.target.dataset.id;
        const quote = e.target.quote.value;
        const author = e.target.author.value;

        fetch(`http://localhost:3000/quotes/${quoteId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quote, author })
        })
        .then(() => fetchQuotes(isSorted)) // Refresh list
        .catch(error => console.error('Error editing quote:', error));
    }

    // Add sort toggle (Extended Learning)
    const sortButton = document.createElement('button');
    sortButton.textContent = 'Sort by Author';
    sortButton.className = 'btn btn-secondary';
    document.body.insertBefore(sortButton, quoteList);
    sortButton.addEventListener('click', () => {
        isSorted = !isSorted;
        sortButton.textContent = isSorted ? 'Sort by ID' : 'Sort by Author';
        fetchQuotes(isSorted);
    });
});