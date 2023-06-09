import * as jigsaw from './jigsaw.js';

/**
 * Expands the puzzle in the given dfirection by creating a new set of nodes that connect to the most recently completed puzzle
 * @param {String} orientation - The direction in which the puzzle should expand
 * @returns true as the puzzle has been completed
 */


export function expandPuzzle(orientation){
    //Get the original puzzle information 
    var originalPuzzle = jigsaw.puzzleExpansionInformation(); 
    var original_node_pieces = originalPuzzle.ORIGINAL_NODE_PIECES_ORDER; 
    var node_pieces = originalPuzzle.NODE_PIECES; 

    //Get the number of rows and columns 
    var numRows = originalPuzzle.rows; 
    var numColumns = originalPuzzle.columns; 

    //Get the index of the next puzzle node 
    var pieceIndex = node_pieces.length;    

    //Get the offset for the puzzle edge IDs
    var offset = originalPuzzle.OFFSET[0];  
    //Reset the offset array 
    originalPuzzle.OFFSET.length = 0; 
    var image;

    //Check the orientation that the use asked for and expand accordingly 
    if(orientation == "LEFT"){
        image = originalPuzzle.leftImage; 
        createLeftPuzzleNodes(original_node_pieces, node_pieces,numRows,numColumns,pieceIndex,offset, image);
    }
    else if(orientation == "RIGHT"){
        image = originalPuzzle.rightImage; 
        createRightPuzzleNodes(original_node_pieces, node_pieces,numRows,numColumns,pieceIndex,offset, image);

    }
    else if(orientation == "TOP"){
        image = originalPuzzle.topImage;
        createTopPuzzleNodes(original_node_pieces, node_pieces,numRows,numColumns,pieceIndex,offset, image);

    }
    else if(orientation == "BOTTOM"){
        image = originalPuzzle.bottomImage; 
        createBottomPuzzleNodes(original_node_pieces, node_pieces,numRows,numColumns,pieceIndex,offset, image);

    }

    jigsaw.randomisePieces(pieceIndex);
    return true;   

    
}




/**
 * Creates a new set of nodes which connect to the original puzzle pieces 
 * @param {Array} original_node_pieces - The array containing the original order of the piece node
 * @param {Array} node_pieces - Stores the reference to the nodes used in the canvas
 * @param {integer} numRows - The number of columns of the next puzzle
 * @param {The total number of columns of the puzzle} numColumns 
 * @param {integer} pieceIndex - The index of the first piece in the new puzzle
 * @param {integer} offset - The offset for the calculation of the EDGE IDs
 * @param {HTML img Object} image - The image of the new puzzle
 */


function createBottomPuzzleNodes(original_node_pieces,node_pieces, numRows, numColumns, pieceIndex, offset, image){

    var id_T = 0; 
    var id_L = 0; 
    var id_R = 0; 
    var id_B = 0; 

    //Get the centre nodes 
    var centreNodes = jigsaw.getCentreNodes(); 
    //Get the index of the last piece 
    var bottomRow = [];

    //Get the bottom row of the centre nodees 
    for(let i =0; i < centreNodes.length; i++){
        if(centreNodes[i].piece.rowIndex == (numRows - 1)){
            bottomRow.push(centreNodes[i]);
        }
    }   

    //Set the IDs of each edge 
    for(let row = 0; row<numRows; row++){
        for(let col=0; col<numColumns; col++){
            //Create the piece to push into the array 
            var piece = new jigsaw.Piece(row, col); 
            
            if(col == 0 && row == 0){
                id_T = bottomRow[col].bottomEdge.id; 
                id_L = pieceIndex + offset; 
                id_R = pieceIndex + offset + 1;
                id_B = pieceIndex + offset + 2; 

            }
            else if(col > 0 && row == 0){
                id_T = bottomRow[col].bottomEdge.id; 
                id_L = original_node_pieces[pieceIndex - 1].rightEdge.id;  
                id_R = pieceIndex + offset + 1; 
                id_B = pieceIndex + offset + 2; 
            }
            else if(col == 0 & row > 0){
                id_T = original_node_pieces[pieceIndex - numColumns].bottomEdge.id; 
                id_L = pieceIndex + offset; 
                id_R = pieceIndex + offset + 1; 
                id_B = pieceIndex + offset + 2; 

            }
            else if(col > 0 && row > 0){
                id_T = original_node_pieces[pieceIndex - numColumns].bottomEdge.id; 
                id_L = original_node_pieces[pieceIndex - 1].rightEdge.id;  
                id_R = pieceIndex + offset; 
                id_B = pieceIndex + offset + 1; 

            }
            //Create the node and add it to the array of nodes 
            var node = new jigsaw.Node(piece, id_T, id_L, id_R, id_B, image);
            node.image = image; //Set the image of the node
            node.isCentreNode = true; 
            original_node_pieces.push(node); 
            node_pieces.push(node);
            //Increase the index of the piece by 1 and the offset by 2
            pieceIndex++; 
            offset += 2; 

        }
    }

    //Change the offset 
    jigsaw.puzzleExpansionInformation().OFFSET.push(offset);

}


/**
 * Creates a new set of nodes which connect to the original puzzle pieces 
 * @param {Array} original_node_pieces - The array containing the original order of the piece node
 * @param {Array} node_pieces - Stores the reference to the nodes used in the canvas
 * @param {integer} numRows - The number of columns of the next puzzle
 * @param {The total number of columns of the puzzle} numColumns 
 * @param {integer} pieceIndex - The index of the first piece in the new puzzle
 * @param {integer} offset - The offset for the calculation of the EDGE IDs
 * @param {HTML img Object} image - The image of the new puzzle
 */

function createRightPuzzleNodes(original_node_pieces,node_pieces, numRows, numColumns, pieceIndex, offset, image){

    var id_T = 0; 
    var id_L = 0; 
    var id_R = 0; 
    var id_B = 0; 

    //Get the centre nodes 
    var centreNodes = jigsaw.getCentreNodes(); 
    //Get the index of the last piece 
    var bottomCorner = centreNodes.length - 1; 
    var leftCol = [];
    //Get all the pieces which are in the bottom row 
    for(let i = 0; i < centreNodes.length; i++){
        if(centreNodes[i].piece.colIndex == centreNodes[bottomCorner].piece.colIndex){
            leftCol.push(centreNodes[i]);
        }
    }

    for(let row = 0; row<numRows; row++){
        for(let col=0; col<numColumns; col++){
            //Create the piece to push into the array 
            var piece = new jigsaw.Piece(row, col); 
            
            if(col == 0 && row == 0){
                id_T = pieceIndex + offset; 
                id_L = leftCol[row].rightEdge.id; 
                id_R = pieceIndex + offset + 1; 
                id_B = pieceIndex + offset + 2; 

            }
            else if(col > 0 && row == 0){
                id_T = pieceIndex + offset; 
                id_L = original_node_pieces[pieceIndex - 1].rightEdge.id;  
                id_R = pieceIndex + offset + 1; 
                id_B = pieceIndex + offset + 2; 
            }
            else if(col == 0 & row > 0){
                id_T = original_node_pieces[pieceIndex - numColumns].bottomEdge.id; 
                id_L = leftCol[row].rightEdge.id; 
                id_R = pieceIndex + offset + 1; 
                id_B = pieceIndex + offset + 2; 

            }
            else if(col > 0 && row > 0){
                id_T = original_node_pieces[pieceIndex - numColumns].bottomEdge.id; 
                id_L = original_node_pieces[pieceIndex - 1].rightEdge.id;  
                id_R = pieceIndex + offset; 
                id_B = pieceIndex + offset + 1; 

            }

            //Create the node and add it to the array of nodes 
            var node = new jigsaw.Node(piece, id_T, id_L, id_R, id_B, image);
            node.isCentreNode = true;
            node.image = image; //Set the image of the node
            original_node_pieces.push(node); 
            node_pieces.push(node);
            //Increase the index of the piece by 1 and the offset by 2
            pieceIndex++; 
            offset += 2; 

        }
    }

    jigsaw.puzzleExpansionInformation().OFFSET.push(offset);

}


/**
 * Creates a new set of nodes which connect to the original puzzle pieces 
 * @param {Array} original_node_pieces - The array containing the original order of the piece node
 * @param {Array} node_pieces - Stores the reference to the nodes used in the canvas
 * @param {integer} numRows - The number of columns of the next puzzle
 * @param {The total number of columns of the puzzle} numColumns 
 * @param {integer} pieceIndex - The index of the first piece in the new puzzle
 * @param {integer} offset - The offset for the calculation of the EDGE IDs
 * @param {HTML img Object} image - The image of the new puzzle
 */


function createLeftPuzzleNodes(original_node_pieces,node_pieces, numRows, numColumns, pieceIndex, offset, image){

    var id_T = 0; 
    var id_L = 0; 
    var id_R = 0; 
    var id_B = 0; 

    //Get the centre nodes 
    var centreNodes = jigsaw.getCentreNodes(); 
    //Get the index of the last piece 
    var rightCol = [];
    //Get all the pieces which are in the bottom row 
    for(let i = 0; i < centreNodes.length; i++){
        if(centreNodes[i].piece.colIndex == 0){
            
            rightCol.push(centreNodes[i]);
            
        }
    }

    //Adds the columns backwards but the rows are in order, can have another array that stores the original backwards order 
    var backwardsCols = []; 
    //Can have a single row which then adds to the original nodes from the end to the first element (so they are in order)
    //Can have an index for the backwardsCol 
    var backwardsColIndex = 0; 


    for(let row = 0; row<numRows; row++){

        var singleRow = [];
        var colCount = 0; 

        for(let col= (numColumns - 1); col >= 0; col--){
            //Create the piece to push into the array 
            var piece = new jigsaw.Piece(row, col); 
            
            if(col == (numColumns - 1) && row == 0){
                id_T = pieceIndex + offset; 
                id_L = pieceIndex + offset + 1; 
                id_R = rightCol[row].leftEdge.id; 
                id_B = pieceIndex + offset + 2; 

            }
            else if(col < (numColumns - 1) && row == 0){
                id_T = pieceIndex + offset; 
                id_L = pieceIndex + offset + 1;  
                id_R = singleRow[colCount - 1].leftEdge.id; 
                id_B = pieceIndex + offset + 2; 
            }
            else if(col == (numColumns - 1) && row > 0){
                id_T = backwardsCols[backwardsColIndex - numColumns].bottomEdge.id; 
                id_L = pieceIndex + offset + 1; 
                id_R = rightCol[row].leftEdge.id; 
                id_B = pieceIndex + offset + 2; 

            }
            else if(col < (numColumns - 1) && row > 0){
                id_T = backwardsCols[backwardsColIndex - numColumns].bottomEdge.id; 
                id_L = pieceIndex + offset;  
                id_R = singleRow[colCount - 1].leftEdge.id; 
                id_B = pieceIndex + offset + 1; 

            }

            //Create the node and add it to the array of nodes 
            var node = new jigsaw.Node(piece, id_T, id_L, id_R, id_B, image);
            node.isCentreNode = true;
            node.image = image; //Set the image of the node
            //original_node_pieces.push(node); 
            singleRow.push(node); 
            colCount++;
            backwardsCols.push(node); 
            //Increase the index of the piece by 1 and the offset by 2
            backwardsColIndex++; 
            pieceIndex++; 
            offset += 2; 

        }

        //Add the pieces of the single row from back to front
        for(let i = singleRow.length - 1; i >= 0; i--){
            node_pieces.push(singleRow[i]);
            original_node_pieces.push(singleRow[i]);
        }

    }

    jigsaw.puzzleExpansionInformation().OFFSET.push(offset);
}


/**
 * Creates a new set of nodes which connect to the original puzzle pieces 
 * @param {Array} original_node_pieces - The array containing the original order of the piece node
 * @param {Array} node_pieces - Stores the reference to the nodes used in the canvas
 * @param {integer} numRows - The number of columns of the next puzzle
 * @param {The total number of columns of the puzzle} numColumns 
 * @param {integer} pieceIndex - The index of the first piece in the new puzzle
 * @param {integer} offset - The offset for the calculation of the EDGE IDs
 * @param {HTML img Object} image - The image of the new puzzle
 */

function createTopPuzzleNodes(original_node_pieces,node_pieces, numRows, numColumns, pieceIndex, offset, image){

    var id_T = 0; 
    var id_L = 0; 
    var id_R = 0; 
    var id_B = 0; 

    //Get the centre nodes 
    var centreNodes = jigsaw.getCentreNodes(); 
    //Get the index of the last piece 
    var topRow = [];

    
    for(let i =0; i < centreNodes.length; i++){
        if(centreNodes[i].piece.rowIndex == 0){
            topRow.push(centreNodes[i]);
        }
    }

    //Adds to the original puzzle nodes from the bottom row to the top but we want the bottom row to be at the end
    //Create an array of arrays 
    var orderOfRows = []; 
    var rowCount = -1; 

    for(let row = (numRows - 1); row >= 0; row--){

        var singleRow = [];

        for(let col=0; col<numColumns; col++){
            //Create the piece to push into the array 
            var piece = new jigsaw.Piece(row, col); 
            
            if(col == 0 && row == (numRows - 1)){
                id_T = pieceIndex + offset; 
                id_L = pieceIndex + offset + 1; 
                id_R = pieceIndex + offset + 2;
                id_B = topRow[col].topEdge.id; 
            }
            else if(col > 0 && row == (numRows - 1)){
                id_T = pieceIndex + offset; 
                id_L = singleRow[col - 1].rightEdge.id;  
                id_R = pieceIndex + offset + 1; 
                id_B = topRow[col].topEdge.id; 
            }
            else if(col == 0 & row < (numRows - 1)){
                id_T = pieceIndex + offset; 
                id_L = pieceIndex + offset + 1; 
                id_R = pieceIndex + offset + 2; 
                id_B = orderOfRows[rowCount][col].topEdge.id;

            }
            else if(col > 0 && row < (numRows - 1)){
                id_T = pieceIndex + offset; 
                id_L = singleRow[col - 1].rightEdge.id;  
                id_R = pieceIndex + offset + 1; 
                id_B = orderOfRows[rowCount][col].topEdge.id; 

            }
            //Create the node and add it to the array of nodes 
            var node = new jigsaw.Node(piece, id_T, id_L, id_R, id_B, image);
            node.image = image; //Set the image of the node
            node.isCentreNode = true; 
            //Add the piece to the row 
            singleRow.push(node); 
            //original_node_pieces.push(node); 
            node_pieces.push(node);
            //Increase the index of the piece by 1 and the offset by 2
            pieceIndex++; 
            offset += 2; 


        }

        //Add it to the array of rows 
        orderOfRows.push(singleRow); 
        rowCount++; 
    }

    jigsaw.puzzleExpansionInformation().OFFSET.push(offset);

    //Add the pieces in correct order 
    for(let i = (orderOfRows.length - 1); i >= 0; i--){
        for(let j = 0; j < orderOfRows[i].length; j++){
            var nodeToAdd = orderOfRows[i][j]; 
            original_node_pieces.push(nodeToAdd); 
        }
    }

}