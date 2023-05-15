//const jigsaw = require('./jigsaw'); 
import * as jigsaw from './jigsaw.js';

/**
 * Creates a puzzle which connects to the bottom edge of the original puzzle
 * @param {The image for the new puzzle} img 
 */
export function createBottomPuzzle(img){

    //Gets all the information required to create the bottom puzzle
    var originalPuzzle = jigsaw.puzzleExpansionInformation(); 
    var original_node_pieces = originalPuzzle.ORIGINAL_NODE_PIECES_ORDER; 
    var node_pieces = originalPuzzle.NODE_PIECES; 
    var expansionCount = originalPuzzle.BOTTOM_EXPANSION_COUNT; 
    var numRows = originalPuzzle.SIZE.rows * expansionCount; 
    var numColumns = originalPuzzle.SIZE.columns; 
    var rowIndex = originalPuzzle.SIZE.rows * (expansionCount - 1); 
    var colIndex = 0; 
    var scaler = originalPuzzle.SCALER; 
    var pieceIndex = (originalPuzzle.SIZE.rows * originalPuzzle.SIZE.columns * (expansionCount -1));     
    var offset = original_node_pieces[pieceIndex-1].rightEdge.id - (pieceIndex - 1); 
    var image = img; 

    createBottomPuzzleNodes(original_node_pieces, node_pieces,numRows,numColumns,rowIndex,colIndex,pieceIndex,offset, expansionCount, image);


    //First check if the window's inner height is less than the total height of the pieces 
    var totalPuzzleHeight = node_pieces[0].piece.height * numRows; 
    if(totalPuzzleHeight > window.innerHeight){
        //Scale down the puzzle to fit the screen 
        if(expansionCount <= 2){
            jigsaw.handleResize((scaler/(expansionCount))*(expansionCount -1)); 
        }else{
            jigsaw.handleResize((scaler/(expansionCount))*(expansionCount - (expansionCount - 1))); 
        }
        //Resize the puzzle pieces
        jigsaw.resizePuzzlePieces(); 
    }
    //Randomise the locations of only the newly created puzzle pieces
    jigsaw.randomisePieces(pieceIndex);   

}

/**
 * Creates a new set of nodes which connect to the original puzzle pieces 
 * @param {The array containing the original order of the piece nodes} original_node_pieces 
 * @param {Stores the reference to the nodes used in the canvas} node_pieces 
 * @param {The total number of rows of the puzzle} numRows 
 * @param {The total number of columns of the puzzle} numColumns 
 * @param {The index of the new row} rowIndex 
 * @param {The index of the new columns} colIndex 
 * @param {The index of the first piece in the new puzzle} pieceIndex 
 * @param {The offset for the calculation of the EDGE IDs} offset 
 * @param {The number of times the puzzle has been expanded} expansionCount 
 * @param {The image of the new puzzle} image 
 */

function createBottomPuzzleNodes(original_node_pieces,node_pieces, numRows, numColumns, rowIndex, colIndex, pieceIndex, offset, expansionCount, image){

    var id_T = 0; 
    var id_L = 0; 
    var id_R = 0; 
    var id_B = 0; 

    for(let row = rowIndex; row<numRows; row++){
        for(let col=colIndex; col<numColumns; col++){
            //Create the piece to push into the array 
            var piece = new jigsaw.Piece(row, col); 
            piece.imgRowIndex = row - ((numRows - rowIndex) * (expansionCount - 1)); 
            
            if(col == 0 && row == 0){
                id_T = pieceIndex; 
                id_L = pieceIndex + 1; 
                id_R = pieceIndex + 2; 
                id_B = pieceIndex + 3; 

            }
            else if(col > 0 && row == 0){
                id_T = pieceIndex + offset; 
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
            original_node_pieces.push(node); 
            node_pieces.push(node);
            //Increase the index of the piece by 1 and the offset by 2
            pieceIndex++; 
            offset += 2; 

        }
    }
}