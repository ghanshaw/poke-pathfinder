# Poke-Pathfinder

Poke-Pathfinder is a demonstration of pathfinding algorithms that allows users to navigate a Pokémon cave. It was built with _**JavaScript**_, _**AngularJS 1.6**_, and _**Sass 3**_. The game is a replication of the Cerulean Cave, a well-known dungeon found in many Pokémon games. This version is the one found in Pokémon Fire Red and Leaf Green.

The player can directly control the hero on the screen, and try to find the legendary Pokémon, Mewtwo. They can also make use of algorithms to automatically navigate the cave.

## Overview

This game is inspired by Pokémon and based on the principles of pathfinding algorithms. In particular,
the game allows users to run four algorithms:

1. Breadth-first Search
2. Depth-first Search
3. Dijkstra's
4. A*

Those unfamiliar with pathfinding can learn more about it [here][1]. However, the principles are simple.
The algorithms rely on a graph to explore nodes and their neighbors until a target is found. The order in which the neighbors are explored, and the total number of nodes considered, depends on the algorithm used.

**Breadth-First search** uses a queue to explore all neighbors of a given distance at the same time. It is guaranteed to find the shortest distance path between two points.

**Depth-first search** will explore a specific direction as far as possible, and then repeatedly backtrack until
the target is found.

Dijkstra's and A* are different, in that they are used to find the shortest path in a weighted graph.

**Dijkstra's** uses a priority queue to explore nodes in order of total weight from the source.

**A*** is very similar—it also uses a priority queue to explore nodes in order of weight. However, it uses a heuristic to estimate which nodes are more likely to lead to a destination faster; this heuristic is combined with the total weight from the source, thereby skewing the order in which nodes are considered.

## Gameplay

Playing Poke-Pathfinder is fun. You can control the hero with the directional buttons on your keyboard. You can also move the hero by clicking or touching the d-pad in Game Boy view. This allows you to play the game through a virtual Game Boy comfortably on mobile.

Increase the speed by holding the 'B' key on your keyboard, or the 'B' button on the Game Boy.

Toggle the gender by pressing the 'A' key on your keyboard, or the 'A' button on the Game Boy.

Users can elect to explore the cave themselves, or they can use the Pathfinder, located in the side-panel, to move through the cave quickly.

There are four algorithms available to you. You can manipulate the edge weights of different tiles if you use Dijkstra's or A*.

In Cave view, which is available on tablet and desktop devices, users can move source and target markers. Toggle the checkboxes to reveal them. You can drag them around, or click the **Move Source Tile** and **Move Target Tile** buttons to place the markers anywhere on the map. 

The Pathfinder has two main functions: **finding paths** and **generating frontiers**. The first option will construct a visible turquoise path between any two points. The Pathfinder will then move the player automatically to his/her destination.

The second option will generate a frontier, sometimes known as a flood-fill, that displays the algorithm in action. The arrows serve as parent pointers, indicating all of the potential paths that the algorithms are producing. The gradient arrows are in the closed list. They have been evaluated by the algorithm, but they were not the target. The color of these arrows represents the total cost between the source and that point. This cost is either distance or total weight, depending on the algorithm used. The yellow arrows depict tiles that are still in the open list. This means that they have been added to the queue, but they haven't been considered by the algorithm yet.

Users can toggle the layers produced by the Pathfinder, or erase them with the **Clear** button.

## Technologies
+ AngularJS 1.6
+ JavaScript
+ Twitter Bootstrap 3
+ jQuery 3
+ Sass 3

This game was built with JavaScript and AngularJS. The logic of the game, including the 
game loop, spritesheet, graph, priority queue, player movement, etc., was written in JavaScript.

The interface, including the highly interactive side-panel, was created with AngularJS.

The map was built with a graph (an adjacency list). The game uses the graph to determine which tiles are accessible from where during player movement. The graph is also used by the algorithms to create the paths and frontiers. The graph is not weighted, per sé. However, users have the option of manipulating the weights assigned to certain tile types in order to use the latter two algorithms.

The map is rendered using a combination of canvas objects and bitmap images. Multiple canvases and bitmap images are layered in order achieve depth-of-field. The bitmap images are used to render static portions of the map. The canvas objects are used to render other aspects of the game, such as the player, the paths, the dragging effects, and the source and target markers. The **Graphic** layer depicts the map more closely to the way it is stored in the graph. Tiles are colored based on their type. This is rendered
entirely in canvas. 

The css Game Boy shell was created by [Josh Collinsworth][2].

[1]: https://en.wikipedia.org/wiki/Pathfinding
[2]: https://codepen.io/joshuajcollinsworth/
