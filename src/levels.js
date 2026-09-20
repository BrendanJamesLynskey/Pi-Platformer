// levels.js — all the levels, drawn with letters! Each letter is one square (a "tile").
// Change a letter, save, and look at the TV. Add a whole new level by adding
// another { name, map } to the LEVELS list below.
//
//   =  railway track (solid, you can stand on it)
//   #  brick wall    (solid)
//   B  girder bridge (solid, with a track on top)
//   $  coin
//   ^  spikes (ouch! you go back to the last signal, or the start)
//   S  signal: drive past it and it turns green. It's a checkpoint!
//   F  the finish flag
//   @  where the engine starts
//   (space) empty sky
//
// Rules for a map:
//   - Every row must be exactly the same length or the map goes wonky.
//   - Every map must be exactly 15 rows tall.
//   - Every map needs one @ and one F.
// Tip: you can run and jump about 4 squares across and 3 squares up.
// The levels get harder as you go down the list.

export const LEVELS = [
  {
    name: "First Steps",
    map: [
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
    ],
  },
  {
    name: "Branch Line",
    map: [
      "#                                                                                                  #",
      "#                                                                                                  #",
      "#                                                                                                  #",
      "#                                                                                                  #",
      "#                                                                                                  #",
      "#                                                                                                  #",
      "#                                                                                                  #",
      "#                                                                                                  #",
      "#                $$$                                                                               #",
      "#                BBB                                      $$                                       #",
      "#            $$$         $$         $$       $$          =BB $$         $$                         #",
      "#            BBB                             BB         =#   BB                                    #",
      "#  @    $$$              ^^  S      ^^              ^  =##          S   ^^          $$$       F    #",
      "#=================    =========   ==========     ===========     ===========    ===================#",
      "##################    #########   ##########     ###########     ###########    ####################",
    ],
  },
  {
    name: "The Viaduct",
    map: [
      "#                                                                                                            #",
      "#                                                                                                            #",
      "#                                                                                                            #",
      "#                                                                                                            #",
      "#                                                                                                            #",
      "#                                                                                                            #",
      "#                                       $$                                                                   #",
      "#                                       BB     $          S  $                                               #",
      "#                                  $$          ^          BBBBB                                              #",
      "#                   $$            BBB         BBB    $$                                                      #",
      "#             $$$   BB    S ^                        BB                     $$                               #",
      "#             BBB         BBBBB                                                      $$                      #",
      "#  @   $$$                                                            $$$   ^^                 ^^       F    #",
      "#===========                                                       =================    =====================#",
      "############                                                       #################    ######################",
    ],
  },
  {
    name: "Mountain Pass",
    map: [
      "#                                                                                                  #",
      "#                                                 $$                                               #",
      "#                                            $$ ^    ^^   ^                                        #",
      "#                                          BBBBBBBBBBBBBBBBBB                                      #",
      "#                                    S $                        $$                                 #",
      "#                                    BBB                        BB                                 #",
      "#                               ^                                    $$                            #",
      "#                              BBB                                   BB                            #",
      "#                        $$$                                                                       #",
      "#                        BBB                                                                       #",
      "#                  $$$                                                        $$                   #",
      "#                  BBB                                                                             #",
      "#  @    $$$   ^^                                                           S  ^^      ^  $$$  F    #",
      "#=====================================                                   ==========================#",
      "######################################                                   ###########################",
    ],
  },
  {
    name: "Grand Central",
    map: [
      "#                                                                                                                                          #",
      "#                                                                                                                                          #",
      "#                                                                                                                                          #",
      "#                                                                                                                                          #",
      "#                                                                                                                                          #",
      "#                                                                                                                                          #",
      "#                                                                                                                                          #",
      "#                                                                               $$                                                         #",
      "#                                 ###############                 $             BB       $$                                                #",
      "#                                 ###############                 B        S         $   BB                                         $$ F   #",
      "#         $$          $    $$                                 $       $    BB        B          ^       $$        $$     $$       =BBBBBB  #",
      "#                     B                                       B       B                       BBBB                BB             =#        #",
      "#  @  $$  ^^   ^^          ^^ S      ^ $ ^ $ ^    $$$                                                 $$^^  S            ^^  ^  =##        #",
      "#===================     ===================================                                       =============      =====================#",
      "####################     ###################################                                       #############      ######################",
    ],
  },
];
