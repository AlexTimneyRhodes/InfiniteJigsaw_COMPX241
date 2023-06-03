import * as expandJigsaw from './jigsaw_expansion.js';
import * as setup from './setup.js';


//Set up global variables
let IMAGE=null;
let CANVAS=null;
let CONTEXT=null;
let PUZZLE_CONTAINER=null;
let ORIENTATION_SELECT=null;
let EXPAND_BUTTON=null;
let EXPORTPUZZLE_BUTTON=null;
let COMPLETE_MENU_ITEMS=null;
let SCALER=0.6;
export let SIZE={x:0,y:0,width:0,height:0, rows:3, columns:3};
let NODE_PIECES = [];
let ORIGINAL_NODE_PIECES_ORDER = [];
let SELECTED_NODE=null;
let CONNECTED_ARRAY = [];
let OFFSET = [];
let LAST_EXPANSION = [];
let COMPLETED_PUZZLE = false;
let EXPAND_ORIENTATION = "NULL";
let NEXT_PROMPT=null;
let IS_VALID_NEXT_PROMPT = false;
let VALID_NEXT_PROMPT = "";
var EXPANSION_COUNT = 0;
let NEXT_IMAGE_LEFT;
let NEXT_IMAGE_RIGHT;
let NEXT_IMAGE_TOP;
let NEXT_IMAGE_BOTTOM;
let DISPLAY_ROUND = null;
let [seconds,minutes,hours] = [0,0,0];
let DISPLAY_TIME = null;
let timer = null;
let LOADING_SCREEN = null;
/**
 * Stop watch function which mimics a stop watch by counting each second and increasing the minutes after hitting 60 seconds and increasing the hours after 60 minutes
 */

function stopWatch(){
    seconds++;
    if(seconds == 60){
        seconds =0;
        minutes++;
        if(minutes == 60){
            minutes = 0;
            hours++;
        }
    }

    let h = hours < 10 ? "0" + hours : hours;
    let m = minutes < 10 ? "0" + minutes : minutes;
    let s = seconds < 10 ? "0" + seconds : seconds;

    DISPLAY_TIME.innerHTML = h + ":" + m + ":" + s;
}

/**
 * Starts the timer by setting the interval at which the stop watch method should be called
 */

function timeStart(){
    if(timer !== null){
        clearInterval(timer);
    }
    timer = setInterval(stopWatch, 1000);

}

/**
 * Stops the timer by clearing the interval and stopping the stopwatch function
 */

function timeStop(){
    clearInterval(timer);

}


/**
 * Fetches the next image AI generated, expanding from the left edge and stores it in the NEXT_IMAGE_LEFT global variable
 * @param {HTML img Element} img - The previous image of the puzzle
 * @param {String} prompt - The prompt for the next image
 * @param {String} orientation - The direction to expand in (LEFT)
 * @returns from the method
 */

export async function fetchExtendedImageLeft(img,prompt, orientation) {
    let data = {
        imagePath: img.src,
        prompt: prompt,
        direction: orientation
    };

    NEXT_IMAGE_LEFT = null;

    const response = await fetch('/api/extendImage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    data = await response.json();

    const jobId = data.jobId;
    console.log("job created with ID:"+jobId);

    while (true) {
        const statusResponse = await fetch(`/api/checkJobStatus/${jobId}`);
        const statusData = await statusResponse.json();
        console.log("job status: "+statusData.status);
        if (statusData.imagePath) {

            //Set the image returned as the global variable storing the next left image
            NEXT_IMAGE_LEFT = document.createElement('img');
            NEXT_IMAGE_LEFT.src = statusData.imagePath
            console.log("Image loaded and assigned to NEXT_IMAGE_LEFT");

            return; // Return the image path when the job is done
        }
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds before the next check
    }
}

/**
 * Fetches the next image AI generated, expanding from the top edge and stores it in the NEXT_IMAGE_TOP global variable
 * @param {HTML img Element} img - The previous image of the puzzle
 * @param {String} prompt - The prompt for the next image
 * @param {String} orientation - The direction to expand in (TOP)
 * @returns from the method
 */

export async function fetchExtendedImageTop(img,prompt, orientation) {
    let data = {
        imagePath: img.src,
        prompt: prompt,
        direction: orientation
    };

    NEXT_IMAGE_TOP = null;

    const response = await fetch('/api/extendImage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    data = await response.json();

    const jobId = data.jobId;
    console.log("job created with ID:"+jobId);

    while (true) {
        const statusResponse = await fetch(`/api/checkJobStatus/${jobId}`);
        const statusData = await statusResponse.json();
        console.log("job status: "+statusData.status);
        if (statusData.imagePath) {

            //Set the image returned as the global variable storing the next top image
            NEXT_IMAGE_TOP = document.createElement('img');
            NEXT_IMAGE_TOP.src = statusData.imagePath
            console.log("Image loaded and assigned to NEXT_IMAGE_TOP");


            return; // Return the image path when the job is done
        }
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds before the next check
    }
}

/**
 * Fetches the next image AI generated, expanding from the right edge and stores it in the NEXT_IMAGE_RIGHT global variable
 * @param {HTML img Element} img - The previous image of the puzzle
 * @param {String} prompt - The prompt for the next image
 * @param {String} orientation - The direction to expand in (RIGHT)
 * @returns from the method
 */

export async function fetchExtendedImageRight(img,prompt, orientation) {
    let data = {
        imagePath: img.src,
        prompt: prompt,
        direction: orientation
    };

    NEXT_IMAGE_RIGHT = null;

    const response = await fetch('/api/extendImage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    data = await response.json();

    const jobId = data.jobId;
    console.log("job created with ID:"+jobId);

    while (true) {
        const statusResponse = await fetch(`/api/checkJobStatus/${jobId}`);
        const statusData = await statusResponse.json();
        console.log("job status: "+statusData.status);
        if (statusData.imagePath) {

            //Set the image returned as the global variable storing the next right image
            NEXT_IMAGE_RIGHT = document.createElement('img');
            NEXT_IMAGE_RIGHT.src = statusData.imagePath
            console.log("Image loaded and assigned to NEXT_IMAGE_RIGHT");


            return; // Return the image path when the job is done
        }
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds before the next check
    }
}

/**
 * Fetches the next image AI generated, expanding from the bottom edge and stores it in the NEXT_IMAGE_BOTTOM global variable
 * @param {HTML img Element} img - The previous image of the puzzle
 * @param {String} prompt - The prompt for the next image
 * @param {String} orientation - The direction to expand in (BOTTOM)
 * @returns from the method
 */

export async function fetchExtendedImageBottom(img,prompt, orientation) {
    let data = {
        imagePath: img.src,
        prompt: prompt,
        direction: orientation
    };

    NEXT_IMAGE_BOTTOM = null;

    const response = await fetch('/api/extendImage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    data = await response.json();

    const jobId = data.jobId;
    console.log("job created with ID:"+jobId);

    while (true) {
        const statusResponse = await fetch(`/api/checkJobStatus/${jobId}`);
        const statusData = await statusResponse.json();
        console.log("job status: "+statusData.status);
        if (statusData.imagePath) {

            //Set the image returned as the global variable storing the next bottom image
            NEXT_IMAGE_BOTTOM = document.createElement('img');
            NEXT_IMAGE_BOTTOM.src = statusData.imagePath
            console.log("Image loaded and assigned to NEXT_IMAGE_TOP");


            return; // Return from method when the job is done
        }
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds before the next check
    }
}


document.addEventListener("DOMContentLoaded", function(){
    //Displays the timer and gets the completed puzzle dialog element
    COMPLETE_MENU_ITEMS = document.getElementById("finishPuzzleMenuItems");
    LOADING_SCREEN = document.getElementById('overlay');
    document.getElementById('score').style.display = 'block';
    DISPLAY_ROUND = document.getElementById("round");
    DISPLAY_TIME = document.getElementById("timer");


    CANVAS=document.getElementById("myCanvas"); //Gets the canvas element from the HTML document
    PUZZLE_CONTAINER=document.getElementById("puzzleContainer");
    CONTEXT=CANVAS.getContext("2d"); //Gets the context to draw the images
    CONTEXT.lineWidth = 5;
    CONTEXT.strokeStyle = "black";

    CANVAS.width=PUZZLE_CONTAINER.offsetWidth; //Sets the width and height of canvas to fit the screen
    CANVAS.height=PUZZLE_CONTAINER.offsetHeight;

    //Creates the image for the first puzzle
    IMAGE = document.createElement("img");
    //Get the image path
    var imagePath = setup.getCookie("imagePath");
    IMAGE.src = imagePath; //Sources the image

    //Gets the prompt entered by the user in the welcome page
    var prompt = setup.getCookie("firstPrompt");
    //Set the previous prompt as a cookie 
    setup.setCookie("prevPrompt", prompt, 365);
    //Fetches the next images according to the prompt given
    fetchExtendedImageLeft(IMAGE, prompt, "LEFT");
    fetchExtendedImageTop(IMAGE, prompt, "TOP");
    fetchExtendedImageRight(IMAGE, prompt, "RIGHT");
    fetchExtendedImageBottom(IMAGE, prompt, "BOTTOM");

    //Add the event listener for a completed puzzle
    ORIENTATION_SELECT = document.getElementsByClassName("orientation").item(0);
    EXPAND_BUTTON = document.getElementById("expand_button");
    NEXT_PROMPT = document.getElementById("textPrompt");
    EXPORTPUZZLE_BUTTON = document.getElementById("exportPuzzle_Button");
    addMenuEventListeners();

    //Sets up the drag and drop functions
    addEventListeners();
    OFFSET.push(1);

    //Sets the difficulty level of the puzzle
    setDifficultyLevel();

    IMAGE.onload = function(){ //Once the image is loaded, resize the image and update the canvas
        window.addEventListener("resize", handleResize);
        handleResize(SCALER);
        initialisePieces(SIZE.rows, SIZE.columns); //Initialises the pieces of the puzzle to the default value
        randomisePieces(0);
        updateCanvas();
        timeStart();

    }



});


/**
 * Sets the difficulty level depending on what was set in the welcome page
 */
function setDifficultyLevel(){

    var difficultyLevel = setup.getCookie("difficultyLevel");
    switch(difficultyLevel){

        case "EASY":
            SIZE.rows = 3;
            SIZE.columns = 3;
            break;
        case "MEDIUM":
            SIZE.rows = 5;
            SIZE.columns = 5;
            break;
        case "HARD":
            SIZE.rows = 9;
            SIZE.columns = 9;
            break;
        case "INSANE":
            SIZE.rows = 15;
            SIZE.columns = 15;
            break;
        default:
            SIZE.rows = 3;
            SIZE.columns = 3;
            break;

    }
}


/**
 * Adds all the completed puzzle dialog events
 */
function addMenuEventListeners(){
    ORIENTATION_SELECT.addEventListener("change", checkExpansionValidity);
    EXPAND_BUTTON.addEventListener("click", expandCompletedPuzzle);
    EXPORTPUZZLE_BUTTON.addEventListener("click", exportCanvas);
    LOADING_SCREEN.addEventListener("mousedown", removeLoadScreen);

}


/**
 * Adds all the event listeners that deals with the mouse or touch events
 */
function addEventListeners(){
    CANVAS.addEventListener("mousedown", onMouseDown);
    CANVAS.addEventListener("mousemove", onMouseMove);
    CANVAS.addEventListener("mouseup", onMouseUp);
    CANVAS.addEventListener("touchstart", onTouchStart);
    CANVAS.addEventListener("touchmove", onTouchMove);
    CANVAS.addEventListener("touchend", onTouchEnd);

}

function removeLoadScreen(){
    //Checks if the images are there and if they are then remove the overlay
    if(NEXT_IMAGE_LEFT !== null && NEXT_IMAGE_BOTTOM !== null && NEXT_IMAGE_RIGHT !== null && NEXT_IMAGE_TOP !== null){
        LOADING_SCREEN.style.display = 'none';
     }
}

/**
 * Returns the x and y locations of the touch event
 * @param {object} evt - The touch event that triggered the start touch
 */

function onTouchStart(evt){
    let loc = {x: evt.touches[0].clientX, y:evt.touches[0].clientY};
    onMouseDown(loc, true, evt);
}

/**
 * Returns the x and y locations of the touch event
 * @param {object} evt - The touch event that triggered the touch move
 */
function onTouchMove(evt){
    let loc = {x: evt.touches[0].clientX, y:evt.touches[0].clientY};
    onMouseMove(loc, true, evt);
}

/**
 * Touch event using the mouse up event
 */
function onTouchEnd(){
    onMouseUp();
}

/**
 * Removes the event listeners to prevent any movement of the puzzle when completing the dialog
 */
function removeEventListeners(){
    CANVAS.removeEventListener("mousedown", onMouseDown);
    CANVAS.removeEventListener("mousemove", onMouseMove);
    CANVAS.removeEventListener("mouseup", onMouseUp);
    CANVAS.removeEventListener("touchstart", onTouchStart);
    CANVAS.removeEventListener("touchmove", onTouchMove);
    CANVAS.removeEventListener("touchend", onTouchEnd);

}


/**
 * Calculates the proper mouse position in respect to the scroll of the window and the size of the puzzle container
 * @param {object} evt - The mouse or touch event
 * @returns the actual x and y locations of the cursors
 */
function calculateMousePosition(evt, touch){

    var mouseX, mouseY;
    var rect = PUZZLE_CONTAINER.getBoundingClientRect();
    var scrollLeft = PUZZLE_CONTAINER.scrollLeft || window.pageXOffset || document.documentElement.scrollLeft;
    var scrollTop = PUZZLE_CONTAINER.scrollTop || window.pageYOffset || document.documentElement.scrollTop;

    if(touch == true){

        mouseX = evt.x - rect.x + scrollLeft;
        mouseY = evt.y - rect.y + scrollTop;
    }
    else{

        mouseX = evt.clientX - rect.x + scrollLeft;
        mouseY = evt.clientY - rect.y + scrollTop;
    }

    return {
        mouseX, mouseY
    };

}


/**
 *
 * @param {object} evt - the mouse or touch event (if touch event, only returns the x and y values )
 * @param {boolean} touch - whether the event is a touch event or a mouse event
 * @param {object} touchEvent - The actual touch event object (to prevent default action)
 */
function onMouseDown(evt, touch, touchEvent){

    var mouseX = calculateMousePosition(evt, touch).mouseX;
    var mouseY = calculateMousePosition(evt, touch).mouseY;


    SELECTED_NODE = getPressedPiece(mouseX, mouseY);
    if(SELECTED_NODE != null){
        if(touch == true){
            touchEvent.preventDefault();
        }
        PUZZLE_CONTAINER.style.cursor = 'grabbing';
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

/**
 * If a piece is selected, the piece is moved to where the cursor is
 * @param {object} evt - the touch or mouse event that triggered the mouse move event
 * @param {boolean} touch - whether the event was touch (true) or a mouse event (false/undefined)
 */

function onMouseMove(evt, touch){


    var mouseX = calculateMousePosition(evt, touch).mouseX;
    var mouseY = calculateMousePosition(evt, touch).mouseY;

    if(getPressedPiece(mouseX,mouseY) != null){
        PUZZLE_CONTAINER.style.cursor = 'grab';
    }
    else{
        PUZZLE_CONTAINER.style.cursor = 'default';
    }

    if(SELECTED_NODE != null){
        PUZZLE_CONTAINER.style.cursor = 'grabbing';
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
 */

function onMouseUp(){

    // var mouseX = calculateMousePosition(evt).mouseX;
    // var mouseY = calculateMousePosition(evt).mouseY;

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
        else if(SELECTED_NODE.isCloseToBottomEdge() != null && SELECTED_NODE.bottomConnected == false){

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
        else if(SELECTED_NODE.isCloseToLeftEdge() != null && SELECTED_NODE.leftConnected == false){

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
        else if(SELECTED_NODE.isCloseToRightEdge() != null && SELECTED_NODE.rightConnected == false){

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
            timeStop();

            //Sets the completed puzzle to true and displays the completed puzzle dialog
            COMPLETED_PUZZLE = true;
            COMPLETE_MENU_ITEMS.style.display = "block";

            //Resets the edge/orientations comboBox's first option to the 'select edge'
            ORIENTATION_SELECT.selectedIndex = 0;
            removeEventListeners();

            //Attempting to save highscore
            updateHighScores();
            //Resetting clock
            [seconds, minutes, hours] = [0, 0, 0];

            //Checks if the images are available yet
            checkLeftImage();
            checkTopImage();
            checkRightImage();
            checkBottomImage();

            //Change the inner HTML Of the previous prompt message 
            var prevPrompt = setup.getCookie("prevPrompt"); 
            var prevPromptMessage = "You have chosen the subject of your NEXT puzzle to be: <b> " + prevPrompt.toUpperCase() + "</b>";
            var divPromptElement = document.getElementById("prevPromptDescript"); 
            divPromptElement.innerHTML = prevPromptMessage; 
            var color = "red";
            var backgroundColor = "rgba(255, 255, 255, 0.5)";
            var padding = "5px";

            var innerHTML = divPromptElement.innerHTML;
            var modifiedHTML = innerHTML.replace(new RegExp(prevPrompt.toUpperCase(), "g"), '<span style="color: ' + color + '; background-color: ' + backgroundColor + '; padding: ' + padding + ';">$&</span>');
            divPromptElement.innerHTML = modifiedHTML; 

        }

    }
    //Unselect the node and update canvas to reflect change
    SELECTED_NODE = null;

    updateCanvas();

}

/**
 * Gets the piece that has been selected by the mouse
 * @param {event} loc - The location of the mouse cursor
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
            x: Math.random() * (PUZZLE_CONTAINER.offsetWidth - (NODE_PIECES[i].piece.width + NODE_PIECES[i].piece.width*1.2)) ,
            y:Math.random() * (PUZZLE_CONTAINER.offsetHeight - (NODE_PIECES[i].piece.height+ NODE_PIECES[i].piece.height*1.5))
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
            window.innerWidth/IMAGE.width,
            window.innerHeight/IMAGE.width
        );
    SIZE.width = resizer*IMAGE.width;
    SIZE.height = resizer*IMAGE.height;
    SIZE.x=window.innerWidth/2-SIZE.width;
    SIZE.y=window.innerHeight/2-SIZE.height;

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
 * @param {integer} rows - The number of rows in the puzzle
 * @param {integer} cols - The number of columns in the puzzle
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

    //Triple check if the image has been processed
    if(NEXT_IMAGE_LEFT === null || NEXT_IMAGE_RIGHT === null || NEXT_IMAGE_TOP === null || NEXT_IMAGE_LEFT === null){
        checkLeftImage();
        checkTopImage();
        checkRightImage();
        checkBottomImage();
    }

    var rows = SIZE.rows;
    var columns = SIZE.columns;
    var leftImage = document.createElement("img");
    leftImage.src = NEXT_IMAGE_LEFT.src;

    var rightImage = document.createElement("img");
    rightImage.src = NEXT_IMAGE_RIGHT.src;

    var bottomImage = document.createElement("img");
    bottomImage.src = NEXT_IMAGE_BOTTOM.src;

    var topImage = document.createElement("img");
    topImage.src = NEXT_IMAGE_TOP.src;

    var expansionCount  = EXPANSION_COUNT;
    return{

        ORIGINAL_NODE_PIECES_ORDER,
        NODE_PIECES,
        rows,
        columns,
        OFFSET,
        SCALER,
        expansionCount,
        LAST_EXPANSION,
        EXPAND_ORIENTATION,
        leftImage,
        rightImage,
        bottomImage,
        topImage
    }

}


/**
 * Piece object/class which defines each piece of the puzzle
 */

export class Piece{

    /**
     * Initialises a piece object, taking in a row index and column index
     * @param {integer} rowIndex - The row index of the piece
     * @param {integer} colIndex - The column index of the piece
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

/**
 * A node class that contains a piece object, holding information on the left edge, right edge, bottom edge and top edge and whether those edges are connected
 */
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
        //NOTE THESE ARE NODE OBJECTS NOT PIECE OBJECTS (need to be refactored)
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
     * @param {object} context - The context used to draw the pieces
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
                if(distance < this.piece.height/6 && distance > -(this.piece.height/6)){
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
                if(distance < this.piece.height/6 && distance > -(this.piece.height/6)){
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
                if(distance < this.piece.width/6 && distance > -(this.piece.width/6)){
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
                if(distance < this.piece.width/6 && distance > -(this.piece.width/6)){
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

/**
 * Checks if the expansion direction is valid
 */

function checkExpansionValidity(){
    //Get the value from the select element
    let orientation = ORIENTATION_SELECT.value;
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

    //Double check if the image has been processed
    if(NEXT_IMAGE_LEFT === null || NEXT_IMAGE_RIGHT === null || NEXT_IMAGE_TOP === null || NEXT_IMAGE_LEFT === null){
        checkLeftImage();
        checkTopImage();
        checkRightImage();
        checkBottomImage();
    }


    getNextPrompt();
    if(COMPLETED_PUZZLE == false){
        alert("Puzzle must be completed before expansion");
    }
    else if(IS_VALID_NEXT_PROMPT == false){
        alert("You must enter a valid prompt");
    }
    else{

        //Get the value of the expansion orientation
        if(EXPAND_ORIENTATION != "NULL"){

            alert("Completed Puzzle - puzzle will expand from the " + EXPAND_ORIENTATION + " edge");

            if(EXPAND_ORIENTATION == "TOP"){

                CANVAS.height *= 1.5;

                for(let i = 0; i < NODE_PIECES.length; i++){
                    //Increase the y position of each piece by 2
                    NODE_PIECES[i].piece.y += 300;
                    NODE_PIECES[i].updateEdgeValues();

                }


            }
            else if(EXPAND_ORIENTATION == "RIGHT"){

                CANVAS.width *= 1.5;

                for(let i = 0; i < NODE_PIECES.length; i++){
                    //Increase the y position of each piece by 2
                    NODE_PIECES[i].piece.x -= 300;
                    NODE_PIECES[i].updateEdgeValues();

                }

            }else if(EXPAND_ORIENTATION == "LEFT"){

                CANVAS.width *= 1.5;

                for(let i = 0; i < NODE_PIECES.length; i++){
                    //Increase the y position of each piece by 2
                    NODE_PIECES[i].piece.x += 300;
                    NODE_PIECES[i].updateEdgeValues();

                }

            }

            //Store the orientation/direction of expansion
            var orientation = EXPAND_ORIENTATION;

            //Expand the jigsaw in the correct direction
            expandJigsaw.expandPuzzle(orientation);

            //Resets the expansion direction, increases the expansion count and removes the completed puzzle dialog
            LAST_EXPANSION.length = 0;
            LAST_EXPANSION.push(orientation);
            EXPAND_ORIENTATION = "NULL";
            EXPANSION_COUNT++;
            COMPLETE_MENU_ITEMS.style.display = "none";

            //Gets the image of the previous image for the AI image generation
            var lastPieceIndex = ORIGINAL_NODE_PIECES_ORDER.length - 1;
            var prev_image = document.createElement("img");
            prev_image.src = ORIGINAL_NODE_PIECES_ORDER[lastPieceIndex].image.src;


            //Fetches the next images depending on the prompt (in all four directions)
            fetchExtendedImageLeft(prev_image, VALID_NEXT_PROMPT, "LEFT");
            fetchExtendedImageTop(prev_image, VALID_NEXT_PROMPT, "TOP");
            fetchExtendedImageRight(prev_image, VALID_NEXT_PROMPT, "RIGHT");
            fetchExtendedImageBottom(prev_image, VALID_NEXT_PROMPT, "BOTTOM");
            
            setup.setCookie("prevPrompt", VALID_NEXT_PROMPT, 365);



        }else{
            //Alert the user to choose a valid expansion orienation
            alert("A valid edge has not been selected. Please select a valid edge");
            return;
        }

        //Set the completed puzzle to false, adds the event listeners again, updates canvas
        COMPLETED_PUZZLE = false;
        addEventListeners()
        updateCanvas();

        //Increase round number and start timer
        DISPLAY_ROUND.innerHTML = EXPANSION_COUNT + 1;
        timeStart();

    }

}

/**
 * Gets the next prompt after a puzzle has been completed
 */

function getNextPrompt(){
    var textPrompt = NEXT_PROMPT.value;
    var placeholder = NEXT_PROMPT.placeholder;

    if(textPrompt == placeholder || textPrompt == ""){ //If the prompt is not an empty string or the placeholder
        IS_VALID_NEXT_PROMPT = false;
    }else{
        VALID_NEXT_PROMPT = textPrompt; //Set the next prompt as the valid prompt to use
        IS_VALID_NEXT_PROMPT = true;
    }

}

/**
 * Periodically checks if the next left image being generated is not null (and can be used)
 * @returns True if the next left image is no longer null
 */

async function waitForLeftImage(){

    while(true){
        if(NEXT_IMAGE_BOTTOM !== null){
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 10 seconds before the next check
    }
}

/**
 * Periodically checks if the next right image being generated is not null (and can be used)
 * @returns True if the next right image is no longer null
 */


async function waitForRightImage(){

    while(true){
        if(NEXT_IMAGE_BOTTOM !== null){
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 10 seconds before the next check
    }

}

/**
 * Periodically checks if the next top image being generated is not null (and can be used)
 * @returns True if the next top image is no longer null
 */

async function waitForTopImage(){

    while(true){
        if(NEXT_IMAGE_TOP !== null){
            return true;
        }
       await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 10 seconds before the next check
    }

}

/**
 * Periodically checks if the next bottom image being generated is not null (and can be used)
 * @returns True if the next bottom image is no longer null
 */


async function waitForBottomImage(){

   while(true){
    if(NEXT_IMAGE_BOTTOM !== null){
        return true;
    }
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 10 seconds before the next check
   }

}


/**
 * Checks the 'wait for left image' promise and waits for it to be resolved -> then removes the overlay if the other three AI generated images are no longer null
 * @returns True if the left image is no longer null
 */


function checkLeftImage(){
    LOADING_SCREEN.style.display = 'block'; //Displays the overlay
    return waitForLeftImage().then((notNull) => {
        console.log("LEFT IMAGE IS AVAILABLE : " + notNull);
        if(NEXT_IMAGE_TOP !== null && NEXT_IMAGE_BOTTOM !== null && NEXT_IMAGE_RIGHT !== null){
            LOADING_SCREEN.style.display = 'none';
        }
        return notNull;
    });
}

/**
 * Checks the 'wait for right image' promise and waits for it to be resolved -> then removes the overlay if the other three AI generated images are no longer null
 * @returns True if the right image is no longer null
 */


function checkRightImage(){
    LOADING_SCREEN.style.display = 'block'; //Displays the overlay
    return waitForRightImage().then((notNull) => {
        console.log("RIGHT IMAGE IS AVAILABLE : " + notNull);
        if(NEXT_IMAGE_TOP !== null && NEXT_IMAGE_BOTTOM !== null && NEXT_IMAGE_LEFT !== null){
            LOADING_SCREEN.style.display = 'none';
        }
        return notNull;
    });
}


/**
 * Checks the 'wait for bottom image' promise and waits for it to be resolved -> then removes the overlay if the other three AI generated images are no longer null
 * @returns True if the bottom image is no longer null
 */

function checkBottomImage(){
    LOADING_SCREEN.style.display = 'block'; //Displays the overlay
    return waitForBottomImage().then((notNull) => {
        console.log("BOTTOM IMAGE IS AVAILABLE : " + notNull);
        if(NEXT_IMAGE_TOP !== null && NEXT_IMAGE_RIGHT !== null && NEXT_IMAGE_LEFT !== null){
            LOADING_SCREEN.style.display = 'none';
        }
        return notNull;
    });
}

/**
 * Checks the 'wait for top image' promise and waits for it to be resolved -> then removes the overlay if the other three AI generated images are no longer null
 * @returns True if the top image is no longer null
 */

function checkTopImage(){
    LOADING_SCREEN.style.display = 'block'; //Displays the overlay
    return waitForTopImage().then((notNull) => {
        console.log("TOP IMAGE IS AVAILABLE : " + notNull);
        if(NEXT_IMAGE_BOTTOM !== null && NEXT_IMAGE_RIGHT !== null && NEXT_IMAGE_LEFT !== null){
            LOADING_SCREEN.style.display = 'none';
        }
        return notNull;
    });
}

// Function to export the canvas and save it as an image
function exportCanvas() {
    // Get the canvas element
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext('2d');

    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height),
        l = imageData.width, t = imageData.height, r = 0, b = 0,
        data = imageData.data;

    for (var i = 0; i < data.length; i += 4) {
        if (data[i+3] !== 0) {
            var x = (i / 4) % imageData.width,
                y = Math.floor((i / 4) / imageData.width);

            if (x < l) l = x;
            if (x > r) r = x;
            if (y < t) t = y;
            if (y > b) b = y;
        }
    }

    var cropped = ctx.getImageData(l, t, r-l+1, b-t+1);

    // Create a new canvas and draw the cropped image on it
    var newCanvas = document.createElement('canvas');
    newCanvas.width = cropped.width;
    newCanvas.height = cropped.height;

    newCanvas.getContext('2d').putImageData(cropped, 0, 0);

    // Create an image
    var image = newCanvas.toDataURL("image/png", 1.0);

    // Create a link element
    var link = document.createElement("a");

    // Set the href attribute of the link element to the image
    link.href = image;

    // Set the download attribute of the link element to the image
    link.download = "jigsaw.png";

    // Append the link to the body (this is required for Firefox)
    document.body.appendChild(link);

    // Click the link element
    link.click();

    // Cleanup the DOM
    document.body.removeChild(link);
}

/*
* Updates the highscore(s) based on current round, time and initial prompt
*/
function updateHighScores(){
    // IMAGE_SELECT <- Stores initial image
    // [Seconds, minutes, hours] <- Stores the time
    // EXPANSION_COUNT <- Number of rounds
    // DIFICULTY_SELECT <- Difficulty
    // Sending post request to update
    var difficultyLevel = setup.getCookie("difficultyLevel");
    var imageName = setup.getCookie("imageName");
    let obj = {
        image: imageName,
        seconds: seconds,
        minutes: minutes,
        hours: hours,
        rounds: Number(EXPANSION_COUNT) + 1,
        difficulty: difficultyLevel};
    // Turning object into url-Encoded key/value pairs
    let urlEncodedData = "";
    for (var key in obj) {
        urlEncodedData += key + '=' + obj[key] + "&";
    }
    urlEncodedData.slice(0, -1);
    // Sending post request with data attatched
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/puzzle', true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onload = function () {
        // do something to response
        console.log(this.responseText);
    };
    xhr.send(urlEncodedData);
}



