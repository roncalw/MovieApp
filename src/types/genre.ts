/*
  WHAT THIS FILE DOES:
  - Defines the Genre type for app-level genre data

  WHY THIS EXISTS:
  - You asked for a genre type
  - Even though the current selector uses hardcoded items,
    this gives your app a proper reusable type for genres
*/

export type Genre = {
  id: number;
  name: string;
};