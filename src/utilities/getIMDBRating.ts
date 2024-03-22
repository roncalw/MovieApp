import { movieIMDBRatingType} from '../screens/Home'
import * as cheerio from 'cheerio';
import fetch from 'node-fetch'; // Import fetch from node-fetch

const getIMDBRating = async (id: string | undefined): Promise<movieIMDBRatingType> => {
  const url = `https://www.imdb.com/title/${id}/ratings/`;

    // Define custom headers
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36', // Add any other headers as needed
    };
  
  try {
    const response = await fetch(url, { headers });
    const htmlString = await response.text();
    const $ = cheerio.load(htmlString);
    const imdbRating = $('[data-testid="rating-button__aggregate-rating__score"] > span:first-child').text();
    //This gets all of the spands inside the rating button, so not just the rating # but the "/10" as well
    //const imdbRating = $('[data-testid="rating-button__aggregate-rating__score"] > span').text();
    const imdbVotes = $('[data-testid="rating-button__aggregate-rating__score"]').next().text();
    return { imdbRating, imdbVotes };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { imdbRating: '', imdbVotes: '' };
  }
};

export default getIMDBRating;
