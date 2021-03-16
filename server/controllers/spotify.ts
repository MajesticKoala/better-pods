import Base64 from 'js-base64';
import axios from 'axios';
import { response } from 'express';

class Spotify {
    clientId: string;
    clientSecret: string;
    accessToken: string;
    accessTokenExpires: Date;
    accessTokenExpired: boolean;
    subscribedShows: any[];
    subscribersLoaded: boolean;

    constructor(clientId: string, clientSecret: string) {
      this.clientId = clientId;
      this.clientSecret = clientSecret;
      this.accessToken = '';
      this.accessTokenExpires = new Date();
      this.accessTokenExpired = true;
      this.subscribedShows = [];
      this.subscribersLoaded = false;
    }

    async getAccessToken(): Promise<string> {
      let token = this.accessToken
      let expires = this.accessTokenExpires
      let now = new Date();

      if (expires < now) {
        await this.createAccessToken()
        return this.getAccessToken()
      } else {
        if (token === '') {
          await this.createAccessToken()
          return this.getAccessToken();
        }
      }
      console.log('token: ' + token)
      return token
    }

    getTokenHeader() {
      var client_creds = `${this.clientId}:${this.clientSecret}`
      var encoded_creds = Base64.encode(client_creds);

      return { 
        'Content-Type':'application/x-www-form-urlencoded',
        'Authorization': `Basic ${encoded_creds}`, 
      }
    }

    async createUserAccessToken() {
      let data = {
        "grant_type": "authorization_code",
        "code": "AQA1zrHgGDYm4W-JS-8pQjc178pDO3qpa91XwYKUSirb2skS87FkBswSC8O0XTgZAngK3pPppiG-R6tPMs0duf12G4ge2N4lmXcTmIl2UptdWcYbAv2L1PXsSp3bd8zkXQRHHgO8J6YU26yAwc7ZwS8u-IAUnw69yfIaCg0XIqrYF4F5LhQ",
        "redirect_uri": "http://localhost:8080/authcallback"
      };

      let headers = this.getTokenHeader();
      try {
        let response = await axios({
          method: 'post',
          url: 'https://accounts.spotify.com/api/token',
          headers: headers,
          params : data
        });
  
        if(response.status == 200){
          console.log(response)
        }
        return true;
      } catch (error) {
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        }
        return false;
      }
    }

    async createAccessToken() {
      let data = {
        "grant_type": "client_credentials"
      };

      let headers = this.getTokenHeader();
      try {
        let response = await axios({
          method: 'post',
          url: 'https://accounts.spotify.com/api/token',
          headers: headers,
          params : data
        });
  
        if(response.status == 200){
          this.accessToken = response.data.access_token;
          this.accessTokenExpires = new Date();
          this.accessTokenExpires.setSeconds(this.accessTokenExpires.getSeconds() + response.data.expires_in);
        }
        return true;
      } catch (error) {
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        }
        return false;
      }
    }

    async search() {
      let accessToken = await this.getAccessToken()
      let headers = {
        "Authorization": `Bearer ${accessToken}`
      }
      let url = "https://api.spotify.com/v1/search?q=hamish&type=show&market=AU&limit=5"
      try {
        let response = await axios({
          method: 'get',
          url: url,
          headers: headers
        });
  
        if(response.status == 200){
          return response.data
        }
        // return true;
      } catch (error) {
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        }
        return error.response;
      }
    }

    async userAuth() {
      // code AQA1zrHgGDYm4W-JS-8pQjc178pDO3qpa91XwYKUSirb2skS87FkBswSC8O0XTgZAngK3pPppiG-R6tPMs0duf12G4ge2N4lmXcTmIl2UptdWcYbAv2L1PXsSp3bd8zkXQRHHgO8J6YU26yAwc7ZwS8u-IAUnw69yfIaCg0XIqrYF4F5LhQ
      try {
        let response = await axios({
          method: 'get',
          url: 'https://accounts.spotify.com/authorize?client_id=ba806d2fb8304a11b38b55f1b0e608d3&response_type=code&redirect_uri=http%3A%2F%2Flocalhost:8080/authcallback'
        });
  
        if(response.status == 200){
          console.log();
        }
        return true;
      } catch (error) {
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        }
        return false;
      }

    }

    async getSubscribedShows() {
      // To get id's https://api.spotify.com/v1/search?q=philosophize&type=show&market=AU with valid bearer token
      // Hamish and andy 3MY0GQPtstOkhHszg2lHY7
      // Joe rogan 4rOoJ6Egrf8K2IrywzwOMk
      // my millennial money 1XflIryhmXHszEXC3M6Az1
      // my millennial property 6yWxqtrrBmN72XgeBE4Jl7
      // my millennial money express 6G1BOnqKelVzlIukZGvy1z
      // my millennial business 26Mn082qXdSLqFjQ8M1aHk
      // Philosophize this! 2Shpxw7dPoxRJCdfFXTWLE
      // Tim Ferriss Show 5qSUyCrk9KR69lEiXbjwXM

      const shows = [
        "3MY0GQPtstOkhHszg2lHY7",
        "4rOoJ6Egrf8K2IrywzwOMk",
        "1XflIryhmXHszEXC3M6Az1",
        "6yWxqtrrBmN72XgeBE4Jl7",
        "6G1BOnqKelVzlIukZGvy1z",
        "26Mn082qXdSLqFjQ8M1aHk",
        "2Shpxw7dPoxRJCdfFXTWLE",
        "5qSUyCrk9KR69lEiXbjwXM"
      ]

      let showString = shows.join(",");
      let accessToken = await this.getAccessToken();
      let headers = {
        "Authorization": `Bearer ${accessToken}`
      }
      let url = `https://api.spotify.com/v1/shows?ids=${showString}&market=AU`
      try {
        let response = await axios({
          method: 'get',
          url: url,
          headers: headers
        });
  
        if(response.status == 200){
          response.data.shows.forEach((show: any) => {
            this.subscribedShows.push({
              "id": show.id,
              "name": show.name,
              "url": show.images[0].url
            })
          });
          this.subscribersLoaded = true;
          return this.subscribedShows
        }
      } catch (error) {
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        }
        return error.response;
      }
    }

    async episodes(showId: string) {
      let accessToken = await this.getAccessToken();
      let headers = {
        "Authorization": `Bearer ${accessToken}`
      }
      let url = `https://api.spotify.com/v1/shows/${showId}/episodes?market=AU&limit=5`
      try {
        let response = await axios({
          method: 'get',
          url: url,
          headers: headers
        });
  
        if(response.status == 200){
          return response.data
        }
      } catch (error) {
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        }
        return error.response;
      }
    }
}

export default new Spotify(process.env.CLIENT_ID, process.env.CLIENT_SECRET);