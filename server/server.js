const express = require('express');
const app = express();
const path = require('path');
const parser = require('body-parser');
const faker = require('faker');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.resolve(__dirname, '../db/comments.db')

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(err.message);
  }
});

app.use(parser.json());
app.use('/:projId', express.static(path.join(__dirname, '/../client/dist')))

let port = 3011
app.listen(port, () => {
    console.log(`app is listening on port ${port}`)
})

app.get('/', (req, res) => {
  res.send('No project page specified. Please go to a specific page to view its comments')
})

// retrieve comments
app.get('/:projId/messages', (req, res) => {
  let projId = req.params.projId
  db.all(`SELECT * FROM messages WHERE proj_id = ${projId}`, (err, data) => {
    if (err) {
      console.log(err);
      res.sendStatus(404);
    } else {
      res.send(data);
    }
  })
})

// retrieve most recent comment
app.get('/:projId/newmessage', (req, res) => {
  db.get(`SELECT * FROM messages ORDER BY id DESC LIMIT 1;`, (err, data) => {
    if (err) {
      console.log(err);
      res.sendStatus(404);
    } else {
      res.send(data);
    }
  })
})

//retrieve most recent reply
app.get('/:projId/newreply', (req, res) => {
  db.get(`SELECT * FROM replies ORDER BY id DESC LIMIT 1;`, (err, data) => {
    if (err) {
      console.log(err);
      res.sendStatus(404);
    } else {
      res.send(data);
    }
  })
})

//retrieve replies to comment
app.get('/:projId/:messageId/replies', (req, res) => {
  let messageId = req.params.messageId;
  db.all(`SELECT * FROM replies WHERE reply_to = ${messageId}`, (err, data) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      res.send(data);
    }
  })
})

// post new comment
app.post('/:projId/messages', (req, res) => {
  let projId = req.params.projId
  let name = faker.name.findName();
  let date = new Date().toLocaleString();
  let avatar = faker.internet.avatar();
  let text = req.body.text;
  db.run(`INSERT INTO messages (username, posted_at, avatar_url, body, proj_id)
  VALUES (?, ?, ?, ?, ?)`, [name, date, avatar, text, projId], (err, data) => {
    if (err) {
      res.sendStatus(500)
    } else {
      res.sendStatus(200)
    }
  })
})


//post reply to comment
app.post('/:projId/reply/:messageId', (req, res) => {
  let messageId = req.params.messageId
  let name = faker.name.findName();
  let date = new Date().toLocaleString();
  let avatar = faker.internet.avatar();
  let text = req.body.text;
  
  db.run(`INSERT INTO replies (username, posted_at, avatar_url, body, reply_to)
  VALUES (?, ?, ?, ?, ?)`, [name, date, avatar, text, messageId], (err, data) => {
    if (err) {
      res.sendStatus(500)
    } else {
      res.sendStatus(200)
    }
  })
})