import * as expandJigsaw from './jigsaw_expansion.js';

//Set up global variables 
let IMAGE=null;
let CANVAS=null; 
let CONTEXT=null; 
let PUZZLE_CONTAINER=null; 
let ORIENTATION_SELECT=null; 
let EXPAND_BUTTON=null;
let COMPLETE_MENU_ITEMS=null; 
let SCALER=0.4; 
export let SIZE={x:0,y:0,width:0,height:0, rows:2, columns:2 };
let NODE_PIECES = []; 
let ORIGINAL_NODE_PIECES_ORDER = []; 
let SELECTED_NODE=null;
let CONNECTED_ARRAY = []; 
let OFFSET = []; 
let LAST_EXPANSION = [];
let COMPLETED_PUZZLE = false; 
let EXPAND_ORIENTATION = "NULL"; 
var EXPANSION_COUNT = 0; 




document.addEventListener("DOMContentLoaded", function(){
    COMPLETE_MENU_ITEMS = document.getElementById("finishPuzzleMenuItems");
    // COMPLETE_MENU_ITEMS.style.display = "none";
    
    CANVAS=document.getElementById("myCanvas"); //Gets the canvas element from the HTML document
    PUZZLE_CONTAINER=document.getElementById("puzzleContainer");
    CONTEXT=CANVAS.getContext("2d"); //Gets the context to draw the images
    CONTEXT.lineWidth = 5; 
    CONTEXT.strokeStyle = "black"; 

    CANVAS.width=PUZZLE_CONTAINER.offsetWidth; //Sets the width and height of canvas to fit the screen
    CANVAS.height=PUZZLE_CONTAINER.offsetHeight; 

    IMAGE = document.createElement("img");
    IMAGE.src = "./images/lake.png"; //Sources the image 

    //Add the event listener for a completed puzzle 
    ORIENTATION_SELECT = document.getElementById("orientation");
    EXPAND_BUTTON = document.getElementById("expand_button");
    addMenuEventListeners();
    
    //Sets up the drag and drop functions 
    addEventListeners(); 
    OFFSET.push(1);
    
    IMAGE.onload = function(){ //Once the image is loaded, resize the image and update the canvas 
        window.addEventListener("resize", handleResize);
        handleResize(SCALER); 
        initialisePieces(SIZE.rows, SIZE.columns); //Initialises the pieces of the puzzle to the default value 
        randomisePieces(0); 
        updateCanvas(); 
        
    }

});

function addMenuEventListeners(){
    ORIENTATION_SELECT.addEventListener("change", checkExpansionValidity);
    EXPAND_BUTTON.addEventListener("click", expandCompletedPuzzle);
}

function addEventListeners(){
    CANVAS.addEventListener("mousedown", onMouseDown);
    CANVAS.addEventListener("mousemove", onMouseMove);
    CANVAS.addEventListener("mouseup", onMouseUp);

}

function removeEventListeners(){
    CANVAS.removeEventListener("mousedown", onMouseDown);
    CANVAS.removeEventListener("mousemove", onMouseMove);
    CANVAS.removeEventListener("mouseup", onMouseUp);
}




function onMouseDown(evt){

    var rect = CANVAS.getBoundingClientRect(); 
    var scrollLeft = PUZZLE_CONTAINER.scrollLeft || window.pageXOffset || document.documentElement.scrollLeft;
    var scrollTop = PUZZLE_CONTAINER.scrollTop || window.pageYOffset || document.documentElement.scrollTop;

    var mouseX = evt.clientX + scrollLeft; 
    var mouseY = evt.clientY + scrollTop; 

    SELECTED_NODE = getPressedPiece(mouseX, mouseY); 
    if(SELECTED_NODE != null){
        //Make sure top most piece is always grabbed first
        const index = NODE_PIECES.indexOf(SELECTED_NODE);
        if(index > -1){ //Check the piece is in the array 
            NODE_PIECES.splice(index, 1); 
            NODE_PIECES.push(SELECTED_NODE); //Put it to the  of the array 
        }
    
        SELECTED_NODE.offset={
            x: mouseX-SELECTED_NODE.piece.x,
            y:mouseY-SELECTED_NODE.piece.y
        }

        SELECTED_NODE.updateEdgeValues(); 

    }

    updateCanvas();
}

function onMouseMove(evt){

    var rect = CANVAS.getBoundingClientRect(); 
    var scrollLeft = PUZZLE_CONTAINER.scrollLeft || window.pageXOffset || document.documentElement.scrollLeft;
    var scrollTop = PUZZLE_CONTAINER.scrollTop || window.pageYOffset || document.documentElement.scrollTop;

    var mouseX = evt.clientX + scrollLeft; 
    var mouseY = evt.clientY + scrollTop; 
    
    if(SELECTED_NODE != null){

        //Get the original location 
        let origin_x = SELECTED_NODE.piece.x; 
        let origin_y = SELECTED_NODE.piece.y; 

        SELECTED_NODE.piece.x = mouseX - SELECTED_NODE.offset.x; 
        SELECTED_NODE.piece.y = mouseY - SELECTED_NODE.offset.y; 

        //Calculate the delta x and y 
        const changeX = SELECTED_NODE.piece.x - origin_x; 
        const changeY = SELECTED_NODE.piece.y - origin_y; 

        CONNECTED_ARRAY = []; 
        CONNECTED_ARRAY.length = 0; 

        traverseNodes(SELECTED_NODE); 

        //Move all pieces by delta x and y 
        for(let i = 1; i < CONNECTED_ARRAY.length; i++){
            
            CONNECTED_ARRAY[i].piece.x += changeX; 
            CONNECTED_ARRAY[i].piece.y += changeY; 
        }

        for(let i = 0; i< NODE_PIECES.length; i++){
            NODE_PIECES[i].updateEdgeValues(); 
        }

        
    }
    updateCanvas();

}

//Get array of connected pieces 
function traverseNodes(rootNode){

    //While the rootNode is not null 
    if(rootNode != null){

        if(CONNECTED_ARRAY.includes(rootNode)){
            return; 
        }
        //Process the node 
        CONNECTED_ARRAY.push(rootNode);  
        traverseNodes(rootNode.topPiece);
        traverseNodes(rootNode.bottomPiece); 
        traverseNodes(rootNode.rightPiece);
        traverseNodes(rootNode.leftPiece); 

    }
    else{
        return; 
    }

}

/**
 * Checks whether the node is close to any of its corresponding edge ids, if so then the selected piece will snap to the edge of the other piece 
 * @param {The mouse up event} evt 
 */

function onMouseUp(evt){

    if(SELECTED_NODE != null){

        //Get the pieces connected to the selected piece (if any)            
        CONNECTED_ARRAY = []; 
        CONNECTED_ARRAY.length = 0; 
        traverseNodes(SELECTED_NODE); 

        //Check if the bottom edge of a piece is close to the top edge of the selected node 
        if(SELECTED_NODE.isCloseToTopEdge() != null && SELECTED_NODE.topConnected == false){

            //Get the top piece 
            let topNode = SELECTED_NODE.isCloseToTopEdge(); 

            //Set the top edge connected of the selected node to true and the bottom edge connected to true for he top node 
            SELECTED_NODE.topConnected = true; 
            topNode.bottomConnected = true; 

            //Set the top node reference of the selected node to be the top piece and the bottom node reference (for the top node) as the selected node 
            SELECTED_NODE.topPiece = topNode; 
            topNode.bottomPiece = SELECTED_NODE; 
            //Update the edge locations 
            topNode.updateEdgeValues(); 

            //Get the original location of the selected piece 
            let origin_x = SELECTED_NODE.piece.x; 
            let origin_y = SELECTED_NODE.piece.y; 

            //Snap the selected node to the top piece 
            SELECTED_NODE.piece.x = topNode.leftEdge.value; 
            SELECTED_NODE.piece.y = topNode.bottomEdge.value; 

            //Calculate the delta x and y 
            const changeX = SELECTED_NODE.piece.x - origin_x; 
            const changeY = SELECTED_NODE.piece.y - origin_y; 

            //Move all pieces by delta x and y 
            for(let i = 1; i < CONNECTED_ARRAY.length; i++){

                if(CONNECTED_ARRAY[i] != topNode){
                    CONNECTED_ARRAY[i].piece.x += changeX; 
                    CONNECTED_ARRAY[i].piece.y += changeY; 
                }
            }
            //Update the edge locations of all the nodes 
            for(let i = 0; i< NODE_PIECES.length; i++){
                NODE_PIECES[i].updateEdgeValues(); 
            }

        }

        //Check if the top edge of a piece is close to the bottom edge of the selected node 
        if(SELECTED_NODE.isCloseToBottomEdge() != null && SELECTED_NODE.bottomConnected == false){

            //Get the bottom piece 
            let bottomNode = SELECTED_NODE.isCloseToBottomEdge(); 

            //Set the bottom edge connected of the selected node to true and the top edge connected to true for the bottom node 
            SELECTED_NODE.bottomConnected = true; 
            bottomNode.topConnected = true; 
            //Set the top reference of the selected node to be the top piece 
            SELECTED_NODE.bottomPiece = bottomNode; 
            bottomNode.topPiece = SELECTED_NODE; 
            //Update the edges for the selected node 
            bottomNode.updateEdgeValues(); 

            //Get the original location of the selected piece                
            let origin_x = SELECTED_NODE.piece.x; 
            let origin_y = SELECTED_NODE.piece.y; 

            //Snap the selected node to the top piece            
            SELECTED_NODE.piece.x = bottomNode.leftEdge.value; 
            SELECTED_NODE.piece.y = bottomNode.topEdge.value - SELECTED_NODE.piece.height; 

            //Calculate the delta x and y 
            const changeX = SELECTED_NODE.piece.x - origin_x; 
            const changeY = SELECTED_NODE.piece.y - origin_y; 

            //Move all pieces by delta x and y 
            for(let i = 1; i < CONNECTED_ARRAY.length; i++){
                if(CONNECTED_ARRAY[i] != bottomNode){
                    CONNECTED_ARRAY[i].piece.x += changeX; 
                    CONNECTED_ARRAY[i].piece.y += changeY; 
                }
            }

            for(let i = 0; i< NODE_PIECES.length; i++){
                NODE_PIECES[i].updateEdgeValues(); 
            }


        }

        //Check if the right edge of a piece is close to the left edge of the selected node 
        if(SELECTED_NODE.isCloseToLeftEdge() != null && SELECTED_NODE.leftConnected == false){

            //Get the left node 
            let leftNode = SELECTED_NODE.isCloseToLeftEdge();

            //Set the left edge connected of the selected node to true and the right edge connected to true for the left node 
            SELECTED_NODE.leftConnected = true; 
            leftNode.rightConnected = true; 
            //Set the left node reference of the selected node to be the left piece and the right node reference as the selected node for the left piece
            SELECTED_NODE.leftPiece = leftNode; 
            leftNode.rightPiece = SELECTED_NODE; 
            //Update the edge locations 
            leftNode.updateEdgeValues(); 

            //Get the original location of the selected piece 
            let origin_x = SELECTED_NODE.piece.x; 
            let origin_y = SELECTED_NODE.piece.y; 

            //Snap the selected node to the top piece 
            SELECTED_NODE.piece.x = leftNode.rightEdge.value; 
            SELECTED_NODE.piece.y = leftNode.topEdge.value; 

            //Calculate the delta x and y 
            const changeX = SELECTED_NODE.piece.x - origin_x; 
            const changeY = SELECTED_NODE.piece.y - origin_y; 
    
            //Move all pieces by delta x and y 
            for(let i = 1; i < CONNECTED_ARRAY.length; i++){
                if(CONNECTED_ARRAY[i] != leftNode){
                    CONNECTED_ARRAY[i].piece.x += changeX; 
                    CONNECTED_ARRAY[i].piece.y += changeY; 
                } 
            }

            //Update the edge locations of all the nodes 
            for(let i = 0; i< NODE_PIECES.length; i++){
                NODE_PIECES[i].updateEdgeValues(); 
            }
            
        }

        //Check if the left edge of a piece is close to the right edge of the selected node 
        if(SELECTED_NODE.isCloseToRightEdge() != null && SELECTED_NODE.rightConnected == false){
            
            //Get the right node 
            let rightNode = SELECTED_NODE.isCloseToRightEdge(); 

            //Set the right edge connected of the selected node to true and the left edge connected to true for the right node 
            SELECTED_NODE.rightConnected = true; 
            rightNode.leftConnected = true; 
            //Set the right node reference of the selected node to be the right piece and the left node reference as the selected node for the right piece
            SELECTED_NODE.rightPiece = rightNode; 
            rightNode.leftPiece = SELECTED_NODE; 

            //Update the edge locations 
            rightNode.updateEdgeValues(); 

            //Get the original location of the selected piece 
            let origin_x = SELECTED_NODE.piece.x; 
            let origin_y = SELECTED_NODE.piece.y; 

            //Snap the selected node to the top piece 
            SELECTED_NODE.piece.x = rightNode.leftEdge.value - SELECTED_NODE.piece.width; 
            SELECTED_NODE.piece.y = rightNode.topEdge.value;

            //Calculate the delta x and y 
            const changeX = SELECTED_NODE.piece.x - origin_x; 
            const changeY = SELECTED_NODE.piece.y - origin_y; 

    
            //Move all pieces by delta x and y 
            for(let i = 1; i < CONNECTED_ARRAY.length; i++){
                if(CONNECTED_ARRAY[i] != rightNode){
                    CONNECTED_ARRAY[i].piece.x += changeX; 
                    CONNECTED_ARRAY[i].piece.y += changeY; 
                } 
            }    

            //Update the edge locations of all the nodes 
            for(let i = 0; i< NODE_PIECES.length; i++){
                NODE_PIECES[i].updateEdgeValues(); 
            }
            
        }

        //Expand the array if the connected array of the selected piece is has the total number of nodes in the puzzle 
        if(CONNECTED_ARRAY.length == NODE_PIECES.length /*&& NODE_PIECES.length == (SIZE.columns * SIZE.rows * RIGHT_EXPANSION_COUNT)*/){
            
            COMPLETED_PUZZLE = true; 
            COMPLETE_MENU_ITEMS.style.display = "block";

            
        }

    }
    //Unselect the node and update canvas to reflect change
    SELECTED_NODE = null; 
    updateCanvas(); 
    
}

/**
 * Gets the piece that has been selected by the mouse 
 * @param {The location of the mouse cursor} loc 
 * @returns The node that has been selected or null
 */
function getPressedPiece(mouseX, mouseY){

    for(let i=NODE_PIECES.length - 1; i >= 0; i--){
        NODE_PIECES[i].updateEdgeValues();
        //Check whether the mouse position is within the bounds of the puzzle piece 
        if(mouseX > NODE_PIECES[i].leftEdge.value && mouseX < NODE_PIECES[i].rightEdge.value){

            if(mouseY > NODE_PIECES[i].topEdge.value && mouseY < NODE_PIECES[i].bottomEdge.value){
                return NODE_PIECES[i];
            }
        }
    }

    return null; 
}


/**
 * Randomises the locations of the pieces
 */
export function randomisePieces(startPiece){
   
    for(let i=startPiece; i< NODE_PIECES.length; i++){
        let local = {
            x: Math.random() * (PUZZLE_CONTAINER.offsetWidth - (NODE_PIECES[i].piece.width + NODE_PIECES[i].piece.width*0.1)) , 
            y:Math.random() * (PUZZLE_CONTAINER.offsetHeight - (NODE_PIECES[i].piece.height+ NODE_PIECES[i].piece.height*0.1))
        }; 
        NODE_PIECES[i].piece.x = local.x;
        NODE_PIECES[i].piece.y = local.y; 
        NODE_PIECES[i].updateEdgeValues(); 
    }
}


export function getCentreNodes(){

    var centreNodes = [];
    //Goes through the original node pieces array and then stores all the centre nodes in a new array, returning that array 
    for(let i = 0; i < ORIGINAL_NODE_PIECES_ORDER.length;i++){
        if(ORIGINAL_NODE_PIECES_ORDER[i].isCentreNode){
            centreNodes.push(ORIGINAL_NODE_PIECES_ORDER[i]); 
            ORIGINAL_NODE_PIECES_ORDER[i].isCentreNode = false; 
        }
    }

    return centreNodes; 
}


/**
 * Method updates the canvas and draws the image at the required area 
 */

function updateCanvas(){
    //Draw the pieces by iterating through them 
    CONTEXT.clearRect(0,0,CANVAS.width, CANVAS.height); 
   
    for(let i = 0; i<NODE_PIECES.length; i++){
        NODE_PIECES[i].draw(CONTEXT, SIZE); 
    }
}

/**
 * Method resizes the image to a specific size with margins 
 */

export function handleResize(scaler){
        let resizer=scaler*
        Math.min(
            PUZZLE_CONTAINER.offsetWidth/IMAGE.width,
            PUZZLE_CONTAINER.offsetHeight/IMAGE.width
        );
    SIZE.width = 0.1*IMAGE.width;
    SIZE.height = 0.1*IMAGE.height; 
    SIZE.x=PUZZLE_CONTAINER.offsetWidth/2-SIZE.width/2;
    SIZE.y=PUZZLE_CONTAINER.offsetHeight/2-(SIZE.height/6)*7;

    if(NODE_PIECES.length > 0){
        updateCanvas();
    }
}

/**
 * Method resizes the puzzle pieces, used after the size of the puzzle pieces have changed 
 */
export function resizePuzzlePieces(){
    for(let i = 0; i < NODE_PIECES.length; i++){
        NODE_PIECES[i].piece.height = SIZE.height/SIZE.rows; 
        NODE_PIECES[i].piece.width = SIZE.width/SIZE.rows; 
        NODE_PIECES[i].piece.x = SIZE.x + NODE_PIECES[i].piece.width*NODE_PIECES[i].piece.colIndex; //Gets the top x corner of the piece
        NODE_PIECES[i].piece.y = SIZE.y + NODE_PIECES[i].piece.height*NODE_PIECES[i].piece.rowIndex;
    }
}

/**
 * Initialises the pieces of the puzzle 
 * @param {The number of rows in the puzzle} rows 
 * @param {The number of columns in the puzzle} cols 
 */
function initialisePieces(rows, cols){
    NODE_PIECES=[];
    SIZE.rows = rows; 
    SIZE.columns = cols; 
    var offset = OFFSET[0];
    OFFSET = [];

    var id_T = 0; 
    var id_L = 0; 
    var id_R = 0; 
    var id_B = 0; 
    var index = 0; 

    for(let row=0; row<SIZE.rows; row++){
        for(let col=0; col<SIZE.columns; col++){
            //Create the piece to push into the array 
            var piece = new Piece(row, col); 
            //Calculates the ID of each edge (to match with their corresponding edges)
            if(col == 0 && row == 0){ //If the piece is the top corner, initialise the edge IDs to unique numbers
                id_T = index; 
                id_L = index + 1; 
                id_R = index + 2; 
                id_B = index + 3; 
                    
            }
            else if(col > 0 && row == 0){ //If the piece is in the first row but the second column, the left edge will have the same id as the previous node's right edge
                id_T = index + offset; 
                id_L = NODE_PIECES[index - 1].rightEdge.id;  
                id_R = index + offset + 1; 
                id_B = index + offset + 2; 
                    
            }
            else if(col == 0 & row > 0){ //If the piece is in the first column and not the first row, the top edge will have the same edge ID as the above node's bottom edge ID but unique left edge
                id_T = NODE_PIECES[index - SIZE.columns].bottomEdge.id; 
                id_L = index + offset; 
                id_R = index + offset + 1; 
                id_B = index + offset + 2; 
                    
            }
            else if(col > 0 && row > 0){ //If the piece is not in the first row or column, top edge will have same edge ID as above node's bottom node and left edge will have same edge ID as previous node's right edge
                id_T = NODE_PIECES[index - SIZE.columns].bottomEdge.id; 
                id_L = NODE_PIECES[index - 1].rightEdge.id;  
                id_R = index + offset; 
                id_B = index + offset + 1; 

            }

            //Create the node and add it to the array of nodes 
            var node = new Node(piece, id_T, id_L, id_R, id_B, IMAGE);
            node.isCentreNode = true; 
            NODE_PIECES.push(node); 
            //Increase the index of the piece by 1 and the offset by 2
            index++; 
            offset += 2; 

        }
    }

    OFFSET.push(offset);
    //Store the original order of the nodes in another array 
    for(let i = 0; i < NODE_PIECES.length; i++){
        ORIGINAL_NODE_PIECES_ORDER.push(NODE_PIECES[i]); 
    }
    
}


/**
 * Stores puzzle information essential for expanding a puzzle from the bottom ede
 * @returns Information required to expand the puzzle
 */
export function puzzleExpansionInformation(){

    return{

        ORIGINAL_NODE_PIECES_ORDER, 
        NODE_PIECES,
        SIZE, 
        OFFSET, 
        SCALER, 
        EXPANSION_COUNT,
        LAST_EXPANSION,
        EXPAND_ORIENTATION
    }
    
}



/**
 * Piece object/class which defines each piece of the puzzle 
 */

export class Piece{

    /**
     * Initialises a piece object, taking in a row index and column index 
     * @param {The row index of the piece} rowIndex 
     * @param {The column index of the piece} colIndex 
     */
    constructor(rowIndex, colIndex){
        this.rowIndex=rowIndex;
        this.colIndex=colIndex;
        this.imgColIndex = colIndex; 
        this.imgRowIndex = rowIndex; 
        this.width = SIZE.width/SIZE.columns; 
        this.height = SIZE.height/SIZE.rows; 
        this.x = SIZE.x + this.width*this.colIndex; //Gets the top x corner of the piece
        this.y = SIZE.y + this.height*this.rowIndex; //Gets the top y corner of the piece 

    }

}

export class Node{

    constructor(piece, id_T, id_L, id_R, id_B, image){
        //Need to store the piece 
        this.piece = piece; 

        //Need to store an edge for each side of the piece 
        this.topEdge = new Edge(id_T, this.piece, 'top', this.piece.y); 
        this.leftEdge = new Edge(id_L, this.piece, 'left', this.piece.x); 
        this.rightEdge = new Edge(id_R, this.piece, 'right', this.piece.x + this.piece.width); 
        this.bottomEdge = new Edge(id_B, this.piece, 'bottom', this.piece.y + this.piece.height ); 
        this.topConnected = false;
        this.bottomConnected = false; 
        this.leftConnected = false; 
        this.rightConnected = false; 
        this.image = image; 

        //Need to store the references to the top, right, left, and bottom pieces
        this.topPiece = null; 
        this.bottomPiece = null; 
        this.rightPiece = null; 
        this.leftPiece = null; 

        //Checks if the nodes are the centre nodes 
        this.isCentreNode = false; 
    }    

    /**
     * Resets the edge values of the node
     */
    updateEdgeValues(){

        this.topEdge.value = this.topEdge.edgePiece.y;   
        this.bottomEdge.value = this.bottomEdge.edgePiece.y + this.bottomEdge.edgePiece.height;      
        this.leftEdge.value =  this.leftEdge.edgePiece.x; 
        this.rightEdge.value = this.rightEdge.edgePiece.x + this.rightEdge.edgePiece.width; 
      
    }
    
    /**
     * Draws the single piece using its fixed width, height, and at its x and y positions
     * @param {The context used to draw the pieces} context 
     */
    draw(context, size){
        context.beginPath();

        context.drawImage(this.image,
            this.piece.imgColIndex*this.image.width/size.columns,
            this.piece.imgRowIndex*this.image.height/size.rows,
            this.image.width/size.columns,
            this.image.height/size.rows,
            //Where to draw the image
            this.piece.x, 
            this.piece.y, 
            this.piece.width, 
            this.piece.height);
        //A = top edge, D = left edge, B = right edge, C= bottom edge
        context.rect(this.piece.x, this.piece.y, this.piece.width, this.piece.height);
        context.stroke(); 

    }

    //Will need four methods to check top, right, left and bottom edges
    isCloseToTopEdge(){

        //Go through all the nodes
        for(let i = 0; i < NODE_PIECES.length; i++){

            if(this.topEdge.id == NODE_PIECES[i].bottomEdge.id){
                //Need to also check if the distance between the left edge of the selected piece and the left edge of the top piece is between 1/8 of the width 
                let horDistance = this.piece.x - NODE_PIECES[i].piece.x;
                if(!(horDistance < this.piece.width/8 && horDistance > -this.piece.width/8) ){
                    return null; 
                }
                //Check if the distance between the bottom and top edge is less than an eighth of the piece height
                let distance = this.topEdge.value - NODE_PIECES[i].bottomEdge.value; 
                if(distance < this.piece.height/8 && distance > 0){
                    //Return the bottom piece 
                    return NODE_PIECES[i]; 
                }
            }

        }
    }

    isCloseToBottomEdge(){

        //Go through all the nodes
        for(let i = 0; i < NODE_PIECES.length; i++){
            if(this.bottomEdge.id == NODE_PIECES[i].topEdge.id){
                //Need to also check if the distance between the left edge of the selected piece and the left edge of the top piece is between 1/8 of the width 
                let horDistance = this.piece.x - NODE_PIECES[i].piece.x;
                if(!(horDistance < this.piece.width/8 && horDistance > -this.piece.width/8) ){
                    return null; 
                }
                //Check if the distance between the bottom and top edge is less than an eighth of the piece height
                let distance = NODE_PIECES[i].topEdge.value - this.bottomEdge.value; 
                if(distance < this.piece.height/8 && distance > 0){
                    //Return the bottom piece 
                    return NODE_PIECES[i]; 
                }
            }

        }
    }


    isCloseToLeftEdge(){

        //Go through all the nodes
        for(let i = 0; i < NODE_PIECES.length; i++){

            if(this.leftEdge.id == NODE_PIECES[i].rightEdge.id){
                //Need to also check if the distance between the top edge of the selected piece and the top edge of the top piece is between 1/8 of the height 
                let verDistance = this.piece.y - NODE_PIECES[i].piece.y;
                if(!(verDistance < this.piece.height/5 && verDistance > -this.piece.height/5) ){
                    return null; 
                }
                //Check if the distance between the bottom and top edge is less than an eighth of the piece height
                let distance = this.leftEdge.value - NODE_PIECES[i].rightEdge.value; 
                if(distance < this.piece.width/8 && distance > 0){
                    //Return the bottom piece 
                    return NODE_PIECES[i]; 
                }
            }

        }


    }

    isCloseToRightEdge(){

        //Go through all the nodes
        for(let i = 0; i < NODE_PIECES.length; i++){

            if(this.rightEdge.id == NODE_PIECES[i].leftEdge.id){
                //Need to also check if the distance between the top edge of the selected piece and the top edge of the top piece is between 1/8 of the height 
                let verDistance = this.piece.y - NODE_PIECES[i].piece.y;
                if(!(verDistance < this.piece.height/5 && verDistance > -this.piece.height/5) ){
                    return null; 
                }
                //Check if the distance between the bottom and top edge is less than an eighth of the piece height
                let distance = NODE_PIECES[i].leftEdge.value - this.rightEdge.value; 
                if(distance < this.piece.width/8 && distance > 0){
                    //Return the bottom piece 
                    return NODE_PIECES[i]; 
                }
            }

        }


    }

}

/**
 * Edge class which stores the position, value, the reference to the node and the edge ID
 */
class Edge{

    constructor(id,edgePiece, position, value){
        this.id = id;  
        this.position = position; 
        this.edgePiece = edgePiece; 
        this.value = value;      
    }

}

function checkExpansionValidity(){
    //Get the value from the select element
    let orientation = document.getElementById("orientation").value; 
    switch(orientation){
        case "LEFT":
            if(EXPANSION_COUNT == 0 || LAST_EXPANSION[0] != "RIGHT"){
                //Set the next expansion orientation 
                EXPAND_ORIENTATION = "LEFT"; 
            }else{
                alert("Your last expansion was from the right edge. Puzzle cannot be expanded from the left edge as it is joined to other pieces");
                EXPAND_ORIENTATION = "NULL";
            };
            break; 
        case "RIGHT":
            if(EXPANSION_COUNT == 0 || LAST_EXPANSION[0] != "LEFT"){
                //Set the next expansion orientation 
                EXPAND_ORIENTATION = "RIGHT"; 
            }else{
                alert("Your last expansion was from the left edge. Puzzle cannot be expanded from the right edge as it is joined to other pieces");
                EXPAND_ORIENTATION = "NULL";
            };
            break; 

        case "BOTTOM":
            if(EXPANSION_COUNT == 0 || LAST_EXPANSION[0] != "TOP"){
                //Set the next expansion orientation 
                EXPAND_ORIENTATION = "BOTTOM"; 
            }else{
                alert("Your last expansion was from the top edge. Puzzle cannot be expanded from the bottom edge as it is joined to other pieces");
                EXPAND_ORIENTATION = "NULL";
            };
            break; 

        case "TOP":
            if(EXPANSION_COUNT == 0 || LAST_EXPANSION[0] != "BOTTOM"){
                //Set the next expansion orientation 
                EXPAND_ORIENTATION = "TOP"; 
            }else{
                alert("Your last expansion was from the bottom edge. Puzzle cannot be expanded from the top edge as it is joined to other pieces");
                EXPAND_ORIENTATION = "NULL";
            };
            break; 
    }

}

function expandCompletedPuzzle(){

    if(COMPLETED_PUZZLE == false){
        alert("Puzzle must be completed before expansion"); 
    }else{

        //Get the value of the expansion orientation 
        if(EXPAND_ORIENTATION != "NULL"){

            alert("Completed Puzzle - puzzle will expand from the " + EXPAND_ORIENTATION + " edge");

            if(EXPAND_ORIENTATION == "TOP"){
                CANVAS.height *= 1.5; 
                for(let i = 0; i < NODE_PIECES.length; i++){
                    //Increase the y position of each piece by 2
                    NODE_PIECES[i].piece.y += 400;
                    NODE_PIECES[i].updateEdgeValues(); 
    
                }
            }

            //Store the orientation 
            var orientation = EXPAND_ORIENTATION; 
            var image = document.createElement("img");
            image.src = "./images/sherry-christian-8Myh76_3M2U-unsplash.jpg";
            image.onload = function(){
                expandJigsaw.expandPuzzle(image, orientation); 
            }
            LAST_EXPANSION.length = 0; 
            LAST_EXPANSION.push(orientation); 
            EXPAND_ORIENTATION = "NULL"; 
            EXPANSION_COUNT++; 
            COMPLETE_MENU_ITEMS.style.display = "none";



        }else{
            //Alert the user to choose a valid expansion orienation 
            alert("The orientation has not been selected. Please select a valid orientation"); 
            return; 
        }

        COMPLETED_PUZZLE = false; 
        updateCanvas();


    }



}