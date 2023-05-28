//Set global variables
var DIFFICULTY_SELECT=null; 
var GO=null; 
var DIFFICULTY_LEVEL="NULL"; 
var SET_DIFFICULTY = false; 
var IMAGE_SELECT=null;
var FIRST_PROMPT_INPUT=null;  
var VALID_FIRST_PROMPT;
var IS_VALID_PROMPT = false;  
var SET_IMAGE = false; 
var IMAGE_PATH = "NULL"; 


//Gets the necessary elements from the doucment
GO = document.getElementById("GO"); 
IMAGE_SELECT = document.getElementById("imageSubject"); 
DIFFICULTY_SELECT = document.getElementById("difficulty"); 
FIRST_PROMPT_INPUT = document.getElementById("textFirstPrompt"); 
addEventListeners(); //Adds the event listeners to the document


/**
 * Adds the event listeners if the element exist on the page
 */

function addEventListeners(){

    if(DIFFICULTY_SELECT != null && GO != null && IMAGE_SELECT != null &&  FIRST_PROMPT_INPUT != null){
        DIFFICULTY_SELECT.addEventListener("change", selectDifficulty); 
        GO.addEventListener("click",goToPuzzle); 
        IMAGE_SELECT.addEventListener("change", selectImage);
    }

}

/**
 * Checks if a difficulty level has been selected and sets the cookie to store the difficulty level if it has been selected
 */

function selectDifficulty(){

    SET_DIFFICULTY = false; 
    let difficulty = DIFFICULTY_SELECT.value; 
    switch(difficulty){
        case "EASY":
            DIFFICULTY_LEVEL = "EASY"; 
            SET_DIFFICULTY = true; 
            break; 
        case "MEDIUM":
            DIFFICULTY_LEVEL = "MEDIUM"; 
            SET_DIFFICULTY = true; 
            break; 
        case "HARD":
            DIFFICULTY_LEVEL = "HARD"; 
            SET_DIFFICULTY = true; 
            break; 
        case "INSANE":
            DIFFICULTY_LEVEL = "INSANE"; 
            SET_DIFFICULTY = true; 
            break; 
        default:
            SET_DIFFICULTY = false; 
            break; 
    }

    setCookie("difficultyLevel", DIFFICULTY_LEVEL, 365); 


};

/**
 * Checks if a prompt has been entered and sets the cookie to store the first prompt if it is not an empty string 
 */

function getPrompt(){
    var textPrompt = FIRST_PROMPT_INPUT.value; 
    var placeholder = FIRST_PROMPT_INPUT.placeholder; 

    if(textPrompt == placeholder || textPrompt == ""){
        IS_VALID_PROMPT = false; 
    }else{
        VALID_FIRST_PROMPT = textPrompt; 
        IS_VALID_PROMPT = true; 
        setCookie("firstPrompt", VALID_FIRST_PROMPT, 365); 
    }

}

/**
 * Gets the base image for the first puzzle and stores the image path as a cookie 
 */

function selectImage(){
    SET_IMAGE = false; 
    let imageSubject = IMAGE_SELECT.value; 
    switch(imageSubject){
        case "LANDSCAPE":
            IMAGE_PATH = "./images/starryNight.png"; 
            SET_IMAGE = true; 
            break; 
        case "VANGOGH":
            IMAGE_PATH = "./images/VanGogh.png"; 
            SET_IMAGE = true; 
            break; 
        default:
            SET_IMAGE = false; 
            break; 
    }

    setCookie("imagePath", IMAGE_PATH, 365); 

}; 


/**
 * Navigates to the puzzle page if all input fields have been completed and are valid 
 */
function goToPuzzle(){

    getPrompt(); 
    //Get the difficulty
    if(SET_DIFFICULTY == false){
        alert("You have not chosen a difficulty"); 
    }
    else if( IS_VALID_PROMPT== false){
        alert("You have not entered a valid prompt"); 
    }
    else if(SET_IMAGE == false){
        alert("You have not selected an image subject"); 
    }
    else{
        window.location.href='/puzzle';
    }  


};

/**
 * Creates a cookie to be stored and used in other pages 
 * @param {string} name - The name to identify the cookie
 * @param {string} value - The value stored in the cookie
 * @param {integer} daysToLive - The expiration date of the cookie
 */

function setCookie(name, value, daysToLive){
    const date = new Date(); 
    date.setTime(date.getTime() + (daysToLive * 24 * 60 * 60 * 1000)); 
    let expires = "expires=" + date.toUTCString(); 
    document.cookie = `${name}=${value}; ${expires}; path=/`;
};


/**
 * Gets the value of the cookie given a valid cookie name
 * @param {string} name - the name of the cookie  
 * @returns - the value stored in the cookie
 */
export function getCookie(name){
    const cDecoded = decodeURIComponent(document.cookie); 
    const cArray = cDecoded.split("; "); 
    let result = null; 

    cArray.forEach(element => {
        if(element.indexOf(name) == 0){
            result = element.substring(name.length + 1);
        }
    }); 

    return result; 
    
}