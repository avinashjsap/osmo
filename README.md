# Live Image Server

Steps to run the Live image server

1. Initialize with `npm install`
2. Set the path to the directory containing images in the `.env` file (The images folder has the set of sample images)
3. From the project root, run the following command `node index.js`

   However, if you want to enable hot reloading on server, type in `npm run devStart`

This should start the server on port 3000

This server has the compiled react code under `build` folder.

The source code for the front end can be seen inside the `frontend` folder.

If you wish to update the frondend code, do run the command `npm run build` and copy the generated `build` folder to the `osmo/build`

Note: If you wish to change the port no on the webserver, react app must be modified accordingly
