## Requirements

    For development, you will need Node.js, typescript and a node global package, Yarn, installed in your environement.

### Node
- #### Node installation on Windows
    Just go on [official Node.js website](https://nodejs.org/) and download the installer.

---
### typescript

- ### tyepscript installation

	You can install typescript as a global package using npm using below command 
	
	$ npm install -g typescript

    If the installation was successful, you should be able to run the following command.

    $ tsc -v
    Version 4.6.2

-----

## Install Project

    $ git clone REPOSITORY-URL
    $ cd google-drive-task
    $ npm install

## Configure environment variables
    In order for the project to work correctly, you need to set up some environment variables in .env file:
    PORT=3000
    NODE_ENV=development

## Simple build

    $ npm run build
	
## Running the project

    $ npm start

## Logs

    Folder under logs/`NODE_ENV` contains the logs.

## API Documentaion

## Download and upload video file
    http://localhost:3000/videos/downloadAndUpload/:fileId/:destinationFolderId?

## Endpoint to monitor the status of both the download and the chunked upload processes
    http://localhost:3000/videos/status/:fileId


