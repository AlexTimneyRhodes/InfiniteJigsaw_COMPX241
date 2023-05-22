/*
import { Configuration, OpenAIApi } from "openai";
import fs from "fs";
import fetch from "node-fetch";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import FormData from "form-data";
*/
const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");
const fetch = require("node-fetch");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const FormData = require("form-data");
const BASEURL = "http://localhost:3030/";

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
    apiKey: "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",
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

  
  const jsonResponse = await apiResponse.json();

  const imageData = jsonResponse.data[0].url;


  //write the json response to a file

  const path = `public/gen/temp-${uuidv4()}`;
  //const jsonPath = path + `.json`;
  //fs.writeFileSync(jsonPath, JSON.stringify(jsonResponse));

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
      case "LEFT":
        extractParams = { left: 512, top: 0, width: 512, height: 1024 };
        extendParams = { top: 0, bottom: 0, left: 0, right: 512, background: { r: 0, g: 0, b: 0, alpha: 0 } };
        break;
      case "RIGHT":
        extractParams = { left: 0, top: 0, width: 512, height: 1024 };
        extendParams = { top: 0, bottom: 0, left: 512, right: 0, background: { r: 0, g: 0, b: 0, alpha: 0 } };
        break;
      case "TOP":
        extractParams = { left: 0, top: 512, width: 1024, height: 512 };
        extendParams = { top: 0, bottom: 512, left: 0, right: 0, background: { r: 0, g: 0, b: 0, alpha: 0 } };
        break;
      case "BOTTOM":
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

  const shiftedImagePath = `temp-shifted-${uuidv4()}.png`;
  fs.writeFileSync(shiftedImagePath, shiftedImage);

  return shiftedImagePath;
}


module.exports = async function extendImage(imagePath, prompt, direction) {
//export default async function extendImage(imagePath, prompt, direction) {
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
    // remove the leading "http://localhost:3030/" and add a "public/" to the beginning of the path of extendedimage
    const delExtendedImagePath = extendedImagePath.replace(BASEURL, "public/");

    await removeTempFile(delExtendedImagePath);
    await removeTempFile(shiftedImagePath2);
console.log("final image path: "+ finalImagePath);
    return finalImagePath;
  } catch (error) {
    console.error("Error extending image:", error);
  }
}
