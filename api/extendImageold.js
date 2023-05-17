import { Configuration, OpenAIApi } from "openai";
import fs from "fs";
import fetch from "node-fetch";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import FormData from "form-data";

//private function to call the DALL-E API
async function callDalleAPI(shiftedImagePath, prompt) {


  // set the API key
  const configuration = new Configuration({
    apiKey: "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",
  });
  const openai = new OpenAIApi(configuration);

  // Create a form data object to send to the API
  const formData = new FormData();
  formData.append("image", fs.createReadStream(shiftedImagePath));
  formData.append("mask", fs.createReadStream(shiftedImagePath));
  formData.append("prompt", prompt);
  formData.append("n", 1);
  formData.append("size", "1024x1024");

  // Call the DALL-E API to extend the image
  const apiResponse = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${configuration.apiKey}`,
    },
    body: formData,
  });

  return apiResponse;
}
export default async function extendImage(imageURL, prompt, direction) {
  // Download the image and save it locally
  const response = await fetch(imageURL);
  const buffer = await response.arrayBuffer();
  const imagePath = `temp-${uuidv4()}.png`;
  fs.writeFileSync(imagePath, Buffer.from(buffer));

  // Define the initial parameters for extracting and extending the image
  let extractParams = { left: 0, top: 0, width: 1024, height: 1024 };
  let extendParams = { top: 0, bottom: 0, left: 0, right: 0, background: { r: 0, g: 0, b: 0, alpha: 0 } };

  // Set the extract and extend parameters based on the direction
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

  // Shift the image based on the direction and add a transparent area
  const shiftedImage = await sharp(imagePath)
    .extract(extractParams)
    .extend(extendParams)
    .toBuffer();

  // Save the shifted image
  const shiftedImagePath = `shifted-${uuidv4()}.png`;
  fs.writeFileSync(shiftedImagePath, shiftedImage);

try {
  
const apiResponse = await callDalleAPI(shiftedImagePath, prompt);


//log the api response to a log file for debugging purposes
fs.writeFile("api/logs/apiResponse.json", JSON.stringify(apiResponse), function (err) {
  if (err) throw err;
  console.log("Saved apiResponse!");
});

// Parse the API response and return the extended image URL
const jsonResponse = await apiResponse.json();
// log the json response to a log file for debugging purposes
fs.writeFile("api/logs/JSONResponse.json", JSON.stringify(jsonResponse), function (err) {
  if (err) throw err;
  console.log("Saved JSONResponse!");
});

// retrieve the image url from the json response
const imageData = jsonResponse.data[0].url;

//download the image from the url and save it locally
const response2 = await fetch(imageData);
const buffer2 = await response2.arrayBuffer();
const imagePath2 = `temp-${uuidv4()}.png`;
fs.writeFileSync(imagePath2, Buffer.from(buffer2));

 //extend the cropped image to the original size, keeping the generated image on the correct edge to extend the image in the correct direction
 // if a image is being extended downward, the generated image should be placed on the top edge of the original image
 // if a image is being extended upward, the generated image should be placed on the bottom edge of the original image


 //preform the same extension as done previously, but with the cropped image instead of the original image
 const nextShiftedImage = await sharp(imagePath2)
 .extract(extractParams)
 .extend(extendParams)
 .toBuffer();

 // Save the shifted image
  const shiftedImagePath2 = `shifted-${uuidv4()}.png`;
  fs.writeFileSync(shiftedImagePath2, nextShiftedImage);



 //call the DALL-E API again to extend the cropped image
 const finalApiResponse = await callDalleAPI(shiftedImagePath2, prompt);

 // Parse the API response and return the extended image URL
 const finalImageData = await finalApiResponse.json();


 //download the image from the url and save it locally
  const response3 = await fetch(finalImageData);
  const buffer3 = await response3.arrayBuffer();
  const finalImagePath = `final-${uuidv4()}.png`;
  fs.writeFileSync(finalImagePath, Buffer.from(buffer3));

//return the final image
return finalImagePath;


}
catch (error) {
  console.error("Error extending image:", error);
}




}
