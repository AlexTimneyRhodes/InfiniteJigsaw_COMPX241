import extendImage from "./extendImage.js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import fetch from "node-fetch";


const testImageURL = "https://i.ibb.co/TR3jv50/wp4471362.png";

(async () => {
  try {
    // Store testimageURL on the local machine
    const response = await fetch(testImageURL);
    const buffer = await response.arrayBuffer();
    const imagePath = `Original-${uuidv4()}.png`;
    fs.writeFileSync(imagePath, Buffer.from(buffer));

    const directions = ["left", "right", "up", "down"];

    for (const direction of directions) {
      const extendedImageURL = await extendImage(imagePath, "apocalypse", direction);
      const extendedImageName = `Extended-${direction}-${uuidv4()}.png`;
      fs.renameSync(extendedImageURL, extendedImageName);
      console.log(`Extended image URL (${direction}):`, extendedImageName);
    }
  } catch (error) {
    console.error("Error extending image:", error);
  }
})();
