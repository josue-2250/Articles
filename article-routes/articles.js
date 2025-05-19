const requireLogin = require('../middleware/auth');
const ARTICLES_FILE = './data/articles.json';
const COMMENTS_FILE = './data/comments.json';

function loadArticles() {
  return JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf8') || '[]');
}
function saveArticles(data) {
  fs.writeFileSync(ARTICLES_FILE, JSON.stringify(data, null, 2));
}

function loadComments() {
  return JSON.parse(fs.readFileSync(COMMENTS_FILE, 'utf8') || '[]');
}
function saveComments(data) {
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify(data, null, 2));
}

// Get all articles
app.get('/api/articles', (req, res) => {
  res.json(loadArticles());
});

// Post new article
app.post('/api/articles', requireLogin, (req, res) => {
  const articles = loadArticles();
  const newArticle = {
    id: Date.now(),
    title: req.body.title,
    content: req.body.content,
    author: req.session.user.username
  };
  articles.push(newArticle);
  saveArticles(articles);
  res.sendStatus(200);
});

// Edit article
app.put('/api/articles/:id', requireLogin, (req, res) => {
  let articles = loadArticles();
  const article = articles.find(a => a.id == req.params.id);
  if (!article || article.author !== req.session.user.username) return res.sendStatus(403);

  article.title = req.body.title;
  article.content = req.body.content;
  saveArticles(articles);
  res.sendStatus(200);
});

// Comments
app.get('/api/articles/:id/comments', (req, res) => {
  const comments = loadComments().filter(c => c.articleId == req.params.id);
  res.json(comments);
});

app.post('/api/articles/:id/comments', requireLogin, (req, res) => {
  const comments = loadComments();
  const newComment = {
    id: Date.now(),
    articleId: parseInt(req.params.id),
    content: req.body.content,
    author: req.session.user.username
  };
  comments.push(newComment);
  saveComments(comments);
  res.sendStatus(200);
});
// PUT /api/articles/:id
router.put('/:id', requireLogin, (req, res) => {
  const id = req.params.id;
  const { title, content } = req.body;
  const article = articles.find(a => a.id == id);
  if (!article) return res.status(404).json({ error: 'Not found' });
  if (article.author !== req.session.user.username)
    return res.status(403).json({ error: 'Forbidden' });

  article.title = title;
  article.content = content;
  saveArticles();
  res.json({ message: 'Updated' });
});

// DELETE /api/articles/:id
router.delete('/:id', requireLogin, (req, res) => {
  const id = req.params.id;
  const index = articles.findIndex(a => a.id == id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  if (articles[index].author !== req.session.user.username)
    return res.status(403).json({ error: 'Forbidden' });

  articles.splice(index, 1);
  saveArticles();
  res.json({ message: 'Deleted' });
});
router.put('/:id/comments/:commentId', requireLogin, (req, res) => {
  const article = articles.find(a => a.id == req.params.id);
  if (!article) return res.status(404).json({ error: 'Article not found' });

  const comment = article.comments.find(c => c.id == req.params.commentId);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });

  if (comment.author !== req.session.user.username)
    return res.status(403).json({ error: 'Forbidden' });

  comment.content = req.body.content;
  saveArticles();
  res.json({ message: 'Comment updated' });
});
router.delete('/:id/comments/:commentId', requireLogin, (req, res) => {
  const article = articles.find(a => a.id == req.params.id);
  if (!article) return res.status(404).json({ error: 'Article not found' });

  const index = article.comments.findIndex(c => c.id == req.params.commentId);
  if (index === -1) return res.status(404).json({ error: 'Comment not found' });

  if (article.comments[index].author !== req.session.user.username)
    return res.status(403).json({ error: 'Forbidden' });

  article.comments.splice(index, 1);
  saveArticles();
  res.json({ message: 'Comment deleted' });
});
