import { Configuration, OpenAIApi } from "openai";
import fs from "fs";
import fetch from "node-fetch";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import FormData from "form-data";

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

  const response2 = await fetch(imageData);
  const buffer2 = await response2.arrayBuffer();
  const imagePath2 = `gen/temp-${uuidv4()}.png`;
  fs.writeFileSync(imagePath2, Buffer.from(buffer2));


  return imagePath2;
}

//function to shift the image and add transparent part to it
//imagePath is the path to the image that is to be extended
//direction is the direction in which the image is to be extended
async function shiftImage(imagePath, direction) {
    let extractParams = { left: 0, top: 0, width: 1024, height: 1024 };
    let extendParams = { top: 0, bottom: 0, left: 0, right: 0, background: { r: 0, g: 0, b: 0, alpha: 0 } };
  
    switch (direction) {
      case "left":
        extractParams = { left: 512, top: 0, width: 512, height: 1024 };
        extendParams = { top: 0, bottom: 0, left: 0, right: 512, background: { r: 0, g: 0, b: 0, alpha: 0 } };
        break;
      case "right":
        extractParams = { left: 0, top: 0, width: 512, height: 1024 };
        extendParams = { top: 0, bottom: 0, left: 512, right: 0, background: { r: 0, g: 0, b: 0, alpha: 0 } };
        break;
      case "up":
        extractParams = { left: 0, top: 512, width: 1024, height: 512 };
        extendParams = { top: 0, bottom: 512, left: 0, right: 0, background: { r: 0, g: 0, b: 0, alpha: 0 } };
        break;
      case "down":
        extractParams = { left: 0, top: 0, width: 1024, height: 512 };
        extendParams = { top: 512, bottom: 0, left: 0, right: 0, background: { r: 0, g: 0, b: 0, alpha: 0 } };
        break;
      default:
        console.error("Invalid direction");
        return;
    }

    const shiftedImage = await sharp(imagePath)
    .extract(extractParams)
    .extend(extendParams)
    .toBuffer();

  const shiftedImagePath = `temp-shifted-${uuidv4()}.png`;
  fs.writeFileSync(shiftedImagePath, shiftedImage);

  return shiftedImagePath;
}



export default async function extendImage(imagePath, prompt, direction) {
  try {
    const shiftedImagePath = await shiftImage(imagePath, direction);
    const extendedImagePath = await callDalleAPI(shiftedImagePath, prompt);

    const shiftedImagePath2 = await shiftImage(extendedImagePath, direction);
    const finalImagePath = await callDalleAPI(shiftedImagePath2, prompt);

    // Delete temporary files after use
    await removeTempFile(shiftedImagePath);
    await removeTempFile(extendedImagePath);
    await removeTempFile(shiftedImagePath2);

    return finalImagePath;
  } catch (error) {
    console.error("Error extending image:", error);
  }
}