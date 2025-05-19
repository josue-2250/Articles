// Check login status
async function checkLogin() {
  const res = await fetch('/api/articles'); // Dummy call to see if session exists
  return res.status !== 401;
}

// Handle logout
document.getElementById('logout-btn')?.addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  window.location.reload();
});

// Load articles to index.html
async function loadArticle(id) {
  const articleRes = await fetch('/api/articles');
  const article = (await articleRes.json()).find(a => a.id == id);
  if (!article) return;

  document.getElementById('article-content').innerHTML = `
    <h2>${article.title}</h2>
    <p>${article.content}</p>
    <p><i>By ${article.author}</i></p>
  `;

  // Get current user (for permission checks)
  let currentUser = null;
  const userRes = await fetch('/api/me');
  if (userRes.ok) {
    currentUser = await userRes.json();
    document.getElementById('comment-form').style.display = 'block';

    document.getElementById('comment-form').onsubmit = async (e) => {
      e.preventDefault();
      const content = e.target.content.value;
      if (!content) return;
      await fetch(`/api/articles/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      location.reload();
    };
  }

  // Load comments
  const res = await fetch(`/api/articles/${id}/comments`);
  const comments = await res.json();
  const commentDiv = document.getElementById('comments');
  commentDiv.innerHTML = '';

  comments.forEach(c => {
    const p = document.createElement('p');
    p.textContent = `${c.author}: ${c.content}`;

    // If comment belongs to logged-in user, add edit/delete buttons
    if (currentUser && c.author === currentUser.username) {
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.onclick = async () => {
        const newContent = prompt('Edit your comment:', c.content);
        if (newContent) {
          await fetch(`/api/articles/${id}/comments/${c.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: newContent })
          });
          location.reload();
        }
      };

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.onclick = async () => {
        if (confirm('Delete this comment?')) {
          await fetch(`/api/articles/${id}/comments/${c.id}`, {
            method: 'DELETE'
          });
          location.reload();
        }
      };

      p.appendChild(editBtn);
      p.appendChild(deleteBtn);
    }

    commentDiv.appendChild(p);
  });
}
// Load a single article + comments
async function loadArticle(id) {
  const articleRes = await fetch('/api/articles');
  const article = (await articleRes.json()).find(a => a.id == id);
  if (!article) return;

  document.getElementById('article-content').innerHTML = `
    <h2>${article.title}</h2>
    <p>${article.content}</p>
    <p><i>By ${article.author}</i></p>
  `;

  // Load comments
  const res = await fetch(`/api/articles/${id}/comments`);
  const comments = await res.json();
  const commentDiv = document.getElementById('comments');
  comments.forEach(c => {
    const p = document.createElement('p');
    p.textContent = `${c.author}: ${c.content}`;
    commentDiv.appendChild(p);
  });

  // Show comment form if logged in
  if (await checkLogin()) {
    document.getElementById('comment-form').style.display = 'block';
    document.getElementById('comment-form').onsubmit = async (e) => {
      e.preventDefault();
      const content = e.target.content.value;
      if (!content) return;
      await fetch(`/api/articles/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      location.reload();
    };
  }
}
