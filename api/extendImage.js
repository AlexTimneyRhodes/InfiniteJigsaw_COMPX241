const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");
const fetch = require("node-fetch");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const FormData = require("form-data");
const { env } = require("process");

const dotenv = require("dotenv");
const { json } = require("express");

// the baseURL of the server, comment out the one that is not being used
const BASEURL = "https://engen241infinitejigsaw.azurewebsites.net/";
//const BASEURL = "http://localhost:3030/";

dotenv.config();
async function removeTempFile(filePath) {
  try {
    fs.unlinkSync(filePath);
  } catch (err) {
    console.error(`Error deleting file: ${filePath}`, err);
  }
}
// function to call the DALL-E API
//shiftedImagePath is the path to the image that is to be extended, it should contain the image and the mask(transparent part is to be replaced)
//prompt is the prompt to be used for the API
async function callDalleAPI(shiftedImagePath, prompt) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  const formData = new FormData();
  formData.append("image", fs.createReadStream(shiftedImagePath));
  formData.append("mask", fs.createReadStream(shiftedImagePath));
  formData.append("prompt", prompt);
  formData.append("n", 1);
  formData.append("size", "1024x1024");

  const apiResponse = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${configuration.apiKey}`,
    },
    body: formData,
  });

  
  const path = `public/gen/temp-${uuidv4()}`;
  const jsonPath = path + `.json`;
  const jsonResponse = await apiResponse.json();

  //write the json response to a file
  //fs.writeFileSync(jsonPath, JSON.stringify(jsonResponse));

  const imageData = jsonResponse.data[0].url;


  //returns the relative path to the image that is to be extended
  const response2 = await fetch(imageData);
  const buffer2 = await response2.arrayBuffer();
  const imagePath2 = path + `.png`;
  fs.writeFileSync(imagePath2, Buffer.from(buffer2));


  //removing leading "public/" from imagePath2
  const finalImagePath = imagePath2.replace("public/", "");

  //returns the absolute path of the new file
  return BASEURL + finalImagePath;

  
}

//function to shift the image and add transparent part to it
//imagePath is the path to the image that is to be extended
//direction is the direction in which the image is to be extended
async function shiftImage(imagePath, direction) {
  // Fetch the image and convert it to a Buffer
  const response = await fetch(imagePath);
  const imageBuffer = await response.buffer();

    let extractParams = { left: 0, top: 0, width: 1024, height: 1024 };
    let extendParams = { top: 0, bottom: 0, left: 0, right: 0, background: { r: 0, g: 0, b: 0, alpha: 0 } };
  
    switch (direction) {
      case "RIGHT":
        extractParams = { left: 512, top: 0, width: 512, height: 1024 };
        extendParams = { top: 0, bottom: 0, left: 0, right: 512, background: { r: 0, g: 0, b: 0, alpha: 0 } };
        break;
      case "LEFT":
        extractParams = { left: 0, top: 0, width: 512, height: 1024 };
        extendParams = { top: 0, bottom: 0, left: 512, right: 0, background: { r: 0, g: 0, b: 0, alpha: 0 } };
        break;
      case "BOTTOM":
        extractParams = { left: 0, top: 512, width: 1024, height: 512 };
        extendParams = { top: 0, bottom: 512, left: 0, right: 0, background: { r: 0, g: 0, b: 0, alpha: 0 } };
        break;
      case "TOP":
        extractParams = { left: 0, top: 0, width: 1024, height: 512 };
        extendParams = { top: 512, bottom: 0, left: 0, right: 0, background: { r: 0, g: 0, b: 0, alpha: 0 } };
        break;
      default:
        console.error("Invalid direction");
        return;
    }

    const shiftedImage = await sharp(imageBuffer)
    .extract(extractParams)
    .extend(extendParams)
    .toBuffer();

  const shiftedImagePath = `public/gen/temp-shifted-${uuidv4()}.png`;
  fs.writeFileSync(shiftedImagePath, shiftedImage);

  return shiftedImagePath;
}

// function to check the supplied prompt. return true if the prompt is invalid, false otherwise
async function checkPrompt(prompt) {
  const { Configuration, OpenAIApi } = require("openai");
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  const response = await openai.createModeration({
    input: prompt,
  });


  //check the output of the moderation API
  //return the 'flagged' property of the output
  return response.data.results[0].flagged;    

  
}



module.exports = async function extendImage(imagePath, prompt, direction) {
  
    //check if the supplied prompt is valid
    //if it is not valid, pass a default prompt
    if(prompt == null || prompt == undefined || prompt == "" || await checkPrompt(prompt)){
      prompt = "landscape";
  }
prompt = "artistic image of a "+prompt;


  console.log("extendImage called")
  console.log("imagePath: "+ imagePath);
  console.log("prompt: "+ prompt);
  console.log("direction: "+ direction);
  try {
    console.log("shifting image..." + imagePath);
    const shiftedImagePath = await shiftImage(imagePath, direction);
    console.log("extending image..."+ shiftedImagePath);
    const extendedImagePath = await callDalleAPI(shiftedImagePath, prompt);

    console.log("shifting image again..." + extendedImagePath);
    const shiftedImagePath2 = await shiftImage(extendedImagePath, direction);
    console.log("extending image again..."+ shiftedImagePath2);
    const finalImagePath = await callDalleAPI(shiftedImagePath2, prompt);

    // Delete temporary files after use
    await removeTempFile(shiftedImagePath);
    // remove the leading BASEURL and add a "public/" to the beginning of the path of extendedimage, to represent where it is stored on the server
    const delExtendedImagePath = extendedImagePath.replace(BASEURL, "public/");

    await removeTempFile(delExtendedImagePath);
    await removeTempFile(shiftedImagePath2);
console.log("final image path: "+ finalImagePath);
    return finalImagePath;
  } catch (error) {
    console.error("Error extending image:", error);
  }
}
