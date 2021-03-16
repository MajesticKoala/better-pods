import { Request, Response, Router } from 'express';
import Spotify from '../controllers/spotify';

const router = Router();
let response: any[] = [];

router.get('/', async (req: Request, res: Response) => {
  response = [];
  try {
    if (!Spotify.subscribersLoaded) {
      await getSubscribedShows();
    }
    const shows = Spotify.subscribedShows;

    // Get most recent episodes from each show
    getEpisodeData(shows).then(() => {
      response.sort(function(a, b) {
        return +new Date(b.release_date) - +new Date(a.release_date);
      });
      res.send(response);
    })
  } catch (error) {
    res.render('home', {
      response: {
        errorCode: 500,
        message: 'Server error'
      }
    });
  }
});

router.get('/shows', async (req: Request, res: Response) => {
  response = [];
  try {
    getSubscribedShows();
  } catch (error) {
    res.render('home', {
      response: {
        errorCode: 500,
        message: 'Server error'
      }
    });
  }
});

const getEpisodeData = async (shows: any) => {
  return Promise.all(shows.map(async (show: any) => {
    const episodes = await Spotify.episodes(show.id);
    episodes.items.forEach((item: any) => {
      response.push({
        "id": show.id,
        "name": show.name,
        "url": show.url,
        "episode_name": item.name,
        "release_date": item.release_date,
        "release_date_precision": item.release_date_precision
      });
    });
  }));
}

const getSubscribedShows = async () => {
  const shows = await Spotify.getSubscribedShows();
  return shows;
}

export = router;