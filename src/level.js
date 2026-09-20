// level.js — the map, drawn with letters! Each letter is one square (a "tile").
// Change a letter, save, and look at the TV.
//
//   =  railway track (solid, you can stand on it)
//   #  brick wall    (solid)
//   B  girder bridge (solid, with a track on top)
//   $  coin
//   ^  spikes (ouch! you go back to the start)
//   F  the finish flag
//   @  where the engine starts
//   (space) empty sky
//
// Every row must be exactly the same length or the map goes wonky.
// Tip: you can run and jump about 4 squares across and 3 squares up.

export const LEVEL_MAP = [
  "#                                                                              #",
  "#                                                                              #",
  "#                                                                              #",
  "#                                                                              #",
  "#                                                                              #",
  "#                                                                              #",
  "#                                                         $$$                  #",
  "#                                                         BBB                  #",
  "#                  $$                                 $$$                      #",
  "#                 BBBB                 $$$            BBB        $$            #",
  "#             $$              $$      =BBB   $$               $$ BB            #",
  "#            BBBB                    =#      BB   BBB         BB               #",
  "#  @    $$$                   ^^    =##                ^^             $$$   F  #",
  "#=====================    ==================    =============      ============#",
  "######################    ##################    #############      #############",
];
