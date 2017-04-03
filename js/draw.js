var DrawFloor = function(floor, width, height) {
    this.floor = floor;
    this.width = width;
    this.height = height;
}








DrawFloor.prototype.createPath() {
    
    
}



$(document).ready(function() {

// Create Floor object to represent 1st Floor
var _1F = new Floor('1F', 21, 38);
var _1F_tiles = _1F_data();
_1F.updateTiles(_1F_tiles);

// Create Graph object, add 1st Floor
var graph_1F = _1F.createGraph(_1F_tiles);


// Create Floor Canvas Object
_1F_draw = new DrawFloor(_1F, 570, 315)


// Construct path
bfs(graph_1F, source, target);


//ctx.fillRect(0, 0, cellSize['width'], cellSize['height']);
//ctx.fillStyle = 'white';
//ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = 'black';

console.log(cellSize);

ctx.beginPath();





var target = [12, 23]
//var target = [5, 5]
var source = [20,32]



tNode = graph_1F.getNode(target);

//    while (tNode) {
//        
//        ctx.fillStyle = 'pink';
//        let x = tNode.cell.col*cellSize['width'];
//        let y = tNode.cell.row*cellSize['height'];
//        ctx.fillRect(x, y, cellSize['width'], cellSize['height']); 
//        tNode = tNode.parent;
//        
//    }

ctx.fillStyle = '#00bcd4';
ctx.beginPath();
var tNode = graph_1F.getNode(target);

// Extract path
var path = [];
while (tNode) {
    path.unshift(tNode)
    tNode = tNode.parent;
}


// Custom method added to Array prototype



console.log(path);

var sprite = new Path2D();
//sprite.moveTo(10, 10);
sprite.arc(10, 10, 4, 0, Math.PI * 2);
ctx.fill(sprite);

var steps_per_tile = 4;
var step_size = 1/steps_per_tile;

// Convert existing path to new path (with quarter steps)
var visual_path = [];
for (let i = 0; i < path.length - 1; i++)  // Loop over path backwards
{

    let step = {};
    step.cell = {};

    step.cell.col = path[i].cell.col;
    step.cell.row = path[i].cell.row;
    step.type = path[i].type;

    visual_path.push(step);

    // If end of loop not reached, interpolate additional steps
    if (i + 1 < path.length) {

        let delta = getDirection(path[i].cell, path[i+1].cell);
        let step = visual_path.peek();

        for (let j = 1; j < steps_per_tile; j++) {
            let next_step = {};
            next_step.cell = {};

            next_step.cell.col = step.cell.col + delta.x * step_size;
            next_step.cell.row = step.cell.row + delta.y * step_size;
            next_step.type = step.type;
            //next_step.direction = delta;

            visual_path.push(next_step);

            step = next_step;
        }
    }        
}

console.log(visual_path);



function getDirection(start, end) {

    var delta_x = 0;
    var delta_y = 0;

    // Determine direction of movement;
    if (end.row > start.row) {
        // Moving down 
        delta_y = +1;
    } else if (end.row < start.row) {
        // Moving up
        delta_y = -1;
    }

    if (end.col > start.col) {
        // Moving right
        delta_x = +1
    } else if (end.col < start.col) {
        // Moving left
        delta_x = -1
    }

    return {
        x: delta_x,
        y: delta_y
    };
}


//console.log(visual_path);

    console.log(path);
var drawPath = function(path) {
    if (path.length) {

        //ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(background, 0, 0);

        let node = path.pop()
        let x = node.cell.col*cellSize['width'];
        let y = node.cell.row*cellSize['height'];

        x = x + (.5 * cellSize['width']);
        y = y + (.5 * cellSize['height']);

        ctx.moveTo(x, y);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2, true);

        ctx.fill()
        ctx.closePath();
        node = node.parent;
        
    }
}

setInterval(drawPath.bind(this, visual_path), 10);

if (!visual_path.length) {
    clearInterval(drawPath);
}


});


