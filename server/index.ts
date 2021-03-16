// external modules
import { Server } from 'http';
import express from 'express';
import axios from 'axios';
import Base64 from 'js-base64';

// internal modules
import Spotify from './controllers/spotify';

// routes
import pages from './routes/pages';
import spotify from './routes/spotify';

// express setup
const app = express();
app.set('x-powered-by', false);
app.enable('trust proxy');

// setup EJS for views
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// static html folder
app.use(express.static(__dirname + '/public'));

// pages
app.use('/', pages);

// api
app.use('/spotify', spotify);

app.get('/token', async (req, res) => {
  // Get auth token for future requests
  // const client = new Spotify(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
  await Spotify.search();

  res.send(Spotify.accessToken)
});

app.get('/userToken', async (req, res) => {
  // Get auth token for future requests
  // const client = new Spotify(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
  await Spotify.createUserAccessToken();

  res.sendStatus(200)
});

app.get('/userAuth', async (req, res) => {
  // const client = new Spotify(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
  await Spotify.userAuth();

  res.redirect('http://localhost:8080/authcallback')
});

app.get('/authcallback', async (req, res) => {
  console.log('authCallback')
  console.log(req.query)

  res.sendStatus(200)
});

let server: Server;

const port = process.env.PORT || 8081;
server = app.listen(port);
const mode = app.get('env').toUpperCase();
console.log(`API started and listening on port ${port}, PID: ${process.pid}, ${mode} mode`);
