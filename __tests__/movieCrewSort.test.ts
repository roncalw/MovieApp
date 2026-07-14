import type { movieCrewProfile } from '../src/types/movie/MovieTypes';
import { sortMovieDetailCrew } from '../src/movie/sortMovieDetailCrew';

function crewMember(
  name: string,
  job: string,
  profilePath: string | null,
): movieCrewProfile {
  return {
    id: name.length * 100 + job.length,
    adult: 0,
    gender: 0,
    known_for_department: 'Production',
    name,
    original_name: name,
    profile_path: profilePath,
    job,
  };
}

describe('Movie Detail crew sorting', () => {
  test('puts pictured crew first and applies the configured role order inside both picture groups', () => {
    const crew = [
      crewMember('No Picture Casting', 'Casting Associate', null),
      crewMember('Picture Other', 'Art Direction', '/other.jpg'),
      crewMember('No Picture Executive', 'Executive Producer', null),
      crewMember('Picture Casting', 'Casting Director', '/casting.jpg'),
      crewMember('Picture Other Director', 'Second Unit Director', '/unit.jpg'),
      crewMember('No Picture Producer', 'Producer', null),
      crewMember('Picture Director', 'Director', '/director.jpg'),
      crewMember('No Picture Assistant', 'Assistant Producer', null),
      crewMember('No Picture Other', 'Art Direction', null),
      crewMember('Picture Assistant', 'Assistant Producer', '/assistant.jpg'),
      crewMember('Picture Producer', 'Producer', '/producer.jpg'),
      crewMember('No Picture Director', 'Director', null),
      crewMember('No Picture Other Director', 'Second Unit Director', null),
      crewMember('Picture Executive', 'Executive Producer', '/executive.jpg'),
    ];

    expect(sortMovieDetailCrew(crew).map(person => person.name)).toEqual([
      'Picture Executive',
      'Picture Producer',
      'Picture Assistant',
      'Picture Director',
      'Picture Other Director',
      'Picture Casting',
      'Picture Other',
      'No Picture Executive',
      'No Picture Producer',
      'No Picture Assistant',
      'No Picture Director',
      'No Picture Other Director',
      'No Picture Casting',
      'No Picture Other',
    ]);
  });

  test('sorts unconfigured jobs by job title and then by crew member name', () => {
    const crew = [
      crewMember('Zoe Camera', 'Camera Operator', '/zoe.jpg'),
      crewMember('Amy Writer', 'Writer', '/amy.jpg'),
      crewMember('Adam Camera', 'Camera Operator', '/adam.jpg'),
      crewMember('Beth Art', 'Art Direction', '/beth.jpg'),
    ];

    expect(sortMovieDetailCrew(crew).map(person => person.name)).toEqual([
      'Beth Art',
      'Adam Camera',
      'Zoe Camera',
      'Amy Writer',
    ]);
  });

  test('does not mutate the TMDB crew array', () => {
    const crew = [
      crewMember('Producer', 'Producer', '/producer.jpg'),
      crewMember('Executive', 'Executive Producer', '/executive.jpg'),
    ];
    const originalOrder = [...crew];

    sortMovieDetailCrew(crew);

    expect(crew).toEqual(originalOrder);
  });
});
