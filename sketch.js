Array.prototype.remove = function(el) {
  for(let i = this.length - 1; i >= 0; i--) {
    if(this[i] == el) {
      this.splice(i, 1);
    }
  }
};

function heuristic(a, b) {
  //                    Euclidean distance              Taxicab distance
  const d = DIAGONAL ? dist(a.x, a.y, b.x, b.y) : abs(a.x - b.x) + abs(a.y - b.y);
  return d;
}

// * MODIFIABLE VALUES
const cols = 50;
const rows = 50;
const wallProbability = 0.35;
const FANCY = true;
const DIAGONAL = true;
const randSeed = undefined;
// cool seeds: undefined, 20, 

const grid = new Array(rows);
const openSet = [];
const closedSet = [];
let path = [];

let start, end;
let w, h;

class Cell {
  constructor(i, j) {
    this.x = j;
    this.y = i;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.neighbors = [];
    this.prev = undefined;
    this.wall = false;

    if(random() < wallProbability) this.wall = true;
  }

  calcNeighbors(grid) {
    const j = this.x;
    const i = this.y;
    // Down
    if(i < rows - 1)
      this.neighbors.push(grid[i + 1][j]);
    // Up
    if(i > 0)
      this.neighbors.push(grid[i - 1][j]);
    // Right
    if(j < cols - 1)
      this.neighbors.push(grid[i][j + 1]);
    // Left
    if(j > 0)
      this.neighbors.push(grid[i][j - 1]);
    
      if(DIAGONAL)
    {
      // Top left
      if(i > 0 && j > 0)
        this.neighbors.push(grid[i - 1][j - 1]);
      // Top right
      if(i > 0 && j < rows - 1)
        this.neighbors.push(grid[i - 1][j + 1]);
      // Bottom left
      if(i < rows - 1 && j > 0)
        this.neighbors.push(grid[i + 1][j - 1]);
      // Bottom right
      if(i < rows - 1 && j < rows - 1)
        this.neighbors.push(grid[i + 1][j + 1]);
    }
  }

  show(col = 255) {
    fill(col);
    noStroke();
    if(FANCY) {
      if(this.wall) {
        fill(112, 50, 126);
        ellipse(this.x * w + w / 2, this.y * h + h / 2, w / 2, h / 2);
      } else {
        rect(this.x * w, this.y * h, w, h);
      }
    }
    else {
      if(this.wall) fill(0);
      rect(this.x * w, this.y * h, w - 1, h - 1);
    }
  }
};

function setup() {
  createCanvas(800, 800);
  randomSeed(randSeed);

  w = width / cols;
  h = height / rows;

  for(let i = 0; i < cols; i++){
    grid[i] = new Array(cols);
  }

  // Create a cell for each spot in the grid
  for(let i = 0; i < cols; i++){
    for(let j = 0; j < rows; j++){
      grid[i][j] = new Cell(i, j);
    }
  }
  // Calculate each cell's neighbours
  for(let i = 0; i < cols; i++){
    for(let j = 0; j < rows; j++){
      grid[i][j].calcNeighbors(grid);
    }
  }

  // grid[y][x]
  start = grid[0][0];
  end = grid[rows - 1][cols - 1];
  start.wall = false;
  end.wall = false;

  openSet.push(start);

  if(FANCY) background(45, 197, 244);
  else background(255);
}

function draw() {
  
  if(openSet.length > 0){
    // Keep going
    
    // Find index of cell with lowest f
    let lowestFIndex = 0;
    for(let i = 0; i < openSet.length; i++) {
      if(openSet[i].f < openSet[lowestFIndex].f)
      lowestFIndex = i;
    }
    let current = openSet[lowestFIndex];
    
    if(current === end) { 
      noLoop();
      console.log("DONE!");
    }
    
    // Find the path
    path = [];
    let temp = current;
    path.push(temp);
    while(temp.prev) {
      path.push(temp.prev);
      temp = temp.prev;
    } 
    
    openSet.remove(current);
    closedSet.push(current);
    
    current.neighbors.forEach(neighbor => {
      
      if(!closedSet.includes(neighbor) && !neighbor.wall) {
        let tempG = current.g + heuristic(current, neighbor);
        
        let newPath = false;
        if(openSet.includes(neighbor)) {
          if(tempG < neighbor.g) {
            newPath = true;
            neighbor.g = tempG;
          }
        } else {
          neighbor.g = tempG;
          newPath = true;
          openSet.push(neighbor);
        }
        
        if(newPath) {
          neighbor.h = heuristic(neighbor, end);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.prev = current;
        }
      }
    });
  } else {
    // No solution
    noLoop();
    console.log("NO SOLUTION");
    return;
  }

  if(FANCY)
  {
    background(45, 197, 244, 1);
    
    for(let i = 0; i < cols; i++) {
      for(let j = 0; j < rows; j++) {
        if(grid[i][j].wall) grid[i][j].show();
      }
    }
    
    for(let i = 0; i < openSet.length; i++) {
      openSet[i].show(color(0, 255, 0, 3));
    }
    for(let i = 0; i < closedSet.length; i++) {
      closedSet[i].show(color(255, 0, 0, 3));
    } 

    noFill();
    stroke(252, 238, 33);
    strokeWeight(w / 2);
    beginShape();
    for(let i = 0; i < path.length; i++) {
      const xCoord = path[i].x * w + w / 2;
      const yCoord = path[i].y * h + h / 2;
      vertex(xCoord, yCoord);
    }
    endShape();
  }
  else
  {
    background(0);
    
    for(let i = 0; i < cols; i++) {
      for(let j = 0; j < rows; j++) {
        grid[i][j].show();
      }
    }
    
    for(let i = 0; i < openSet.length; i++) {
      openSet[i].show(color(0, 255, 0));
    }
    for(let i = 0; i < closedSet.length; i++) {
      closedSet[i].show(color(255, 0, 0));
    } 

    // Draw path
    for(let i = 0; i < path.length; i++) {
      path[i].show(color(0, 0, 255));
    }
  }
}
