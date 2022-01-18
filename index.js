
const express = require('express')
const expressWs = require('express-ws')
const path = require('path')
const fs = require('fs')
const chokidar = require('chokidar')
//var cors = require('cors')
require('dotenv').config()

const app = express()
//app.use(cors())
expressWs(app)
const port = 3000

app.use(express.static(path.join(__dirname, 'build')));
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })
const IMAGE_PATH = process.env.IMAGE_PATH;
const IMAGE_EXTENSIONS = ["jpeg", "jpg", "png", "svg", "tif", "tiff", "ico", "bmp", "webp"];
const MIME = {
    gif: 'image/gif',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    ico: 'image/vnd.microsoft.icon',
    tif: 'image/tiff',
    tiff: 'image/tiff',
    webp: 'image/webp'

}
const sockets = []
const watcher = chokidar.watch(IMAGE_PATH, {
    persistent: true,
    ignoreInitial: true
});
  
watcher.on('add', (filePath) => onFileChange(filePath, 'added'))
        .on('unlink', (filePath) => onFileChange(filePath, 'removed'));

const onFileChange = (filePath, operation) => {
    console.log(`File ${filePath} has been ${operation}`)
    for (const socket of sockets) {
        socket.send(JSON.stringify({operation, image: path.basename(filePath)}))
    }
}


app.get('/Images', (req, res) => {
    fs.readdir(IMAGE_PATH, (err, files) => {
        if (err) return console.log('Unable to scan directory: ' + err);
        const filteredFiles = files.filter(file => {
            for (let extn of IMAGE_EXTENSIONS) {
                if (file.endsWith(extn)) return true;
            }
            return false;
        });
        filteredFiles.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        console.log(`Images in the directory are: ${filteredFiles}`);
        res.send({
            resourceId: filteredFiles,
            count: filteredFiles.length
        });
    });
})

app.ws("/LiveStatus", socket => {
    sockets.push(socket);
    console.log(`${sockets.length} clients are connected`)
    socket.on('close', () => {
        sockets.splice(sockets.indexOf(socket), 1);
    })
})

app.get("/Image/:imageId", (req, res) => {
    const fileName = req.params.imageId
    const filePath = path.join(IMAGE_PATH, fileName);
    const doesExist = fs.existsSync(filePath)
    if (doesExist) {
        const contentType = MIME[path.extname(filePath).slice(1)];
        var s = fs.createReadStream(filePath);
        s.on('open', function () {
            res.setHeader('Content-Type', contentType);
            s.pipe(res);
        });
        s.on('error', function () {
            res.setHeader('Content-Type', 'text/plain');
            res.statusCode = 404;
            res.end('Not found');
        });
    } else {
        res.status(404).send("Sorry, the requested file does not exist");
    }

})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})