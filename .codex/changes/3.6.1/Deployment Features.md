# MovieApp 3.6.1 Store Features

This document contains customer-facing text for the Apple App Store and Google
Play. It describes what customers can do in MovieApp 3.6.1 without referring to
source code, dependencies, tests, build scripts, or other development work.

As of August 23, 2026, both public store listings show MovieApp 3.5.2. The
customer-facing changes below cover the MovieApp work completed after that
release through commit `d33b8e62088e8fbfa1841b36a483b5351cf65090`, plus the
current Home performance work. Record the Home performance commit here after
that work is checked in.

## Apple App Store

```text
* Discover popular movies available through streaming subscriptions.
  * Browse the new Streaming Now collection on the Home page.
  * See movies available from any subscription service supported by MovieApp in the United States.
  * Select Streaming Now to open Advanced Search with every supported service selected and movies sorted by popularity.

* Find the movie title you meant faster.
  * See exact title matches before movies with longer title variations.
  * Browse a broader set of matching movies in one continuous result list.
  * See the movie name on a Movie Poster Not Available card when poster artwork is missing.

* Recognize movies that have a different United States title.
  * See the United States title followed by the standard movie title on Movie Details when the names differ.
  * See one title when both names are the same.

* Move smoothly between saved movies and Movie Details.
  * Return to a steady Favorites or Movies I Have Seen grid without a delayed jump.
  * See a movie disappear from its saved list after removing its Favorite or Seen selection in Movie Details.
  * Keep already-loaded movie cards in place when the saved list has not changed.

* Open Favorites and Movies I Have Seen faster, including large saved collections.

* Open the Home page faster, with featured and popular movies ready first.
```

## Google Play

The Google Play text is intentionally shorter so it can be pasted into the
console's limited What's New field.

```text
* Browse popular subscription movies in the new Streaming Now collection.
* See exact movie-title matches first and browse a broader result list.
* See United States and standard titles together when their names differ.
* See movie names when poster artwork is unavailable.
* Return smoothly to Favorites and Movies I Have Seen while keeping saved changes current.
* Open Favorites and Movies I Have Seen faster, including large saved collections.
* Open the Home page faster, with featured and popular movies ready first.
* Close the side menu by tapping the open area beside it on Android.
```
