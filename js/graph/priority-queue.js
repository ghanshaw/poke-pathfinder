// Priority Queue constructor
var PriorityQueue = function() {
    
    /*
     * Priority queue is constructed with binary heap. 
     * Consists of array of arrays.
     * Each smaller array stores element in index 0 and priority in index 1
     */
    
    this.arr = [];
    this.size = 0;
};


// Insert elements into priority queue
PriorityQueue.prototype.insert = function(item) {
    
    this.arr.push(item);
    this.size++;
    this.heapifyUp(this.size - 1);
};

// Return priority at given index
PriorityQueue.prototype.priority = function(index) {
    return this.arr[index][1];
};

// Indicate if element at index1 has higher or lower priority
PriorityQueue.prototype.higherPriority = function(index1, index2) {
    
    if (index1 >= this.size || index2 >= this.size) {
        return false;
    }
    
    if (this.arr[index1][1] < this.arr[index2][1]) {
        return true;
    }
    return false;
};

// Heapify up
PriorityQueue.prototype.heapifyUp = function(index) {
    
    var item = this.arr[index];
    var parent_index = Math.floor(index/2);
    
    // Already at front of array
    if (index === 0) {
        return;
    }
    
    // Else if item has a higher priority than its parent
    else if (this.higherPriority(index, parent_index)) {
        // Swap up
        var child = this.arr[index];
        var parent = this.arr[parent_index];
        this.arr[index] = parent;
        this.arr[parent_index] = child;
        
        this.heapifyUp(parent_index); 
        return;
    }
    
    // Heap invariant is maintained
    else { return; }
    
};

// Heapify down
PriorityQueue.prototype.heapifyDown = function(index) {
    
    var item = this.arr[index];
    
    var child1_i = 2*index + 1;
    var child2_i = 2*index + 2;
        
    // You're a leaf, return;
    if (child1_i >= this.size && child2_i >= this.size) {
        return;
    }    
    
    // Else if item has a lower priority than either of its children
    else if (this.higherPriority(child1_i, index) ||
            this.higherPriority(child2_i, index)) {
        
        // If you only have one child, swap into that child
        var swap_i;
        if (child2_i >= this.size) {
            swap_i = child1_i;
        }               
        // Swap down into the larger of the two children
        else if (this.higherPriority(child1_i, child2_i)) {
            swap_i = child1_i;
        } else {
            swap_i = child2_i;
        }
        
        var swap = this.arr[swap_i];
        var item = this.arr[index];
        this.arr[swap_i] = item;
        this.arr[index] = swap;
        
        this.heapifyDown(swap_i);
        
    }
    
    // Heap invariant is maintained
    else { return; }
    
};

// Get size of priority queue
PriorityQueue.prototype.getSize = function() {
    return this.size;
};

// Delete element with lowest priority
PriorityQueue.prototype.deleteMin = function() {
    
    if (this.size === 0) {
        return null;
    }
    
    var min = this.arr[0];    
    var last = this.arr.pop();
    
    this.size--;
    
    if (this.size !== 0) {
        this.arr[0] = last;
        this.heapifyDown(0); 
    }
    
    return min;   
    
};
