# InfiniteJigsaw_COMPX241
Welcome to the InfiniteJigsaw_COMPX241 project! This is a collaborative project built by Alex Rhodes, Rafeea Siddika and Mahaki Leach. The project is primarily written in JavaScript, with some EJS and CSS. 

## Check out the [Live Demo!](https://engen241infinitejigsaw.azurewebsites.net)

# About the Project
The ultimate goal of the project was to create an infinitely expanding jigsaw puzzle. using the OpenAI API system we are able to extend an image seamlessly in any direction, combining this with a jigsaw puzzle system we are able to create a jigsaw puzzle that can be expanded infinitely in any direction.
* The project is built using Node.js and Express.js.
* The project uses the OpenAI API to generate extensions to images.
* The project uses the EJS templating engine to render the views.
* The project uses the Azure WebApp service to host the project.
* The project uses GitHub Actions to automatically deploy the project to Azure.


# Project Structure
The project is organized into several directories:

* .github/workflows: Contains the workflow files for GitHub Actions.
* .vscode: Contains settings for the Visual Studio Code editor.
* api: Contains the API-related scripts for the project.
* node_modules: Contains the Node.js modules used in the project.
* public: Contains the public assets for the project.
* views: Contains the view templates for the project.

# Getting Started
To get started with the project, clone the repository and install the necessary dependencies using npm.

  ```sh
git clone https://github.com/AlexTimneyRhodes/InfiniteJigsaw_COMPX241.git
```
  ```sh
cd InfiniteJigsaw_COMPX241
```
  ```sh
npm install
```

# Setting up your API
For local testing, create an env file containing your OpenAI API key. 
* .env
```sh
OPENAI_API_KEY=YOUR_KEY_HERE
```

# GitHub Secrets
These are necessary or deploying to a Microsoft Azure WebApp
1. OPENAI_API_KEY
```sh
OPENAI_API_KEY=YOUR_KEY_HERE
```
2. AZURE_WEBAPP_SERVICE_NAME
```sh
this is the name of the webapp as it appears on its azure webapp page
```
3. AZURE_WEBAPP_PUBLISH_PROFILE
```sh
Download the publish profile using the button on the webapps' page, copy paste its contents here
```

# Running the Project
After installing the dependencies, you can start the project using npm.

```sh
npm run start
```
