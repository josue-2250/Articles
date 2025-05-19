const fs = require('fs');
const path = require('path');

const articles = [
  {
    id: '1',
    title: 'Seed Article One',
    content: 'This is a seeded article.',
    author: 'admin',
    comments: [
      {
        id: 'c1',
        author: 'admin',
        content: 'Admin first comment!'
      }
    ]
  }
];

const users = [
  {
    username: 'admin',
    password: 'admin123' // Use hashed passwords in real apps
  },
  {
    username: 'user1',
    password: 'user123'
  }
];

fs.writeFileSync(path.join(__dirname, 'data', 'articles.json'), JSON.stringify(articles, null, 2));
fs.writeFileSync(path.join(__dirname, 'data', 'users.json'), JSON.stringify(users, null, 2));

console.log('✅ Data seeded.');
