
import { movieIMDBRatingType} from '../screens/Home'
import * as cheerio from 'cheerio';

const getIMDBRating = async (id: string | undefined): Promise<movieIMDBRatingType> => {
  const url = `https://www.imdb.com/title/${id}/ratings/`;
  
  try {
    const response = await fetch(url);
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
