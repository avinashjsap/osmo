import { useEffect, useState, useRef } from 'react';
import { getInitialImages } from './api'
import { insertionSort } from './utils';

function App() {
  const [imageList, setImageList] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [queue, setQueue] = useState([])
  const webSocket = useRef(null)

  useEffect(() => {
    async function onLoad() {
      const result = await getInitialImages()
      const newImageList = [...result];

      // During race condition where websocket updates are received first before the initial list of images,
      // we store those updates in a queue and perform the operation when the initial list of images is received
      while (queue.length) {
        const message = queue.shift()
        if (message.operation === "added") {
          newImageList.push(message.image)
        }
        else if (message.operation === "removed") { 
          newImageList.splice(newImageList.indexOf(message.image), 1)
        }
      }
      insertionSort(newImageList)
      setImageList(newImageList)
      setIsLoaded(true)
    }
    onLoad()
  }, [])

  useEffect(() => {
    webSocket.current = new WebSocket("ws://localhost:3000/LiveStatus")
    webSocket.current.onopen = () => console.log("Socket initialized");
    webSocket.current.onclose = (event) => {
      if (event.wasClean) {
        alert(`Websocket connection closed cleanly, code: ${event.code} reason: ${event.reason ? event.reason : "None"}`);
      } else {
        alert("connection closed")
      }
    };
    webSocket.current.onerror = function(error) {
      console.error(`[error] ${error.message}`);
    };
    webSocket.current.onmessage = (event) => {
      console.log(event.data)
      const message = JSON.parse(event.data)
      if (isLoaded) {
        if (message.operation === "added") {
          
          setImageList(oldList => {
            const newImageList = [...oldList, message.image];
            insertionSort(newImageList)
            return newImageList
          })
          //console.log(imageList)
        }
        else if (message.operation === "removed") {        
          setImageList(oldList => {
            const newImageList = [...oldList];
            newImageList.splice(newImageList.indexOf(message.image), 1)
            return newImageList
          })
          //console.log(imageList)
        }
      } else {
        // storing it as we didn't receive the initial list of images yet 
        queue.push(message)
      }


    };
    return () => webSocket.current.close()

  }, [isLoaded])
  return (
    <div style={{display: "grid", "gridGap": "50px", "gridTemplateColumns": "1fr 1fr 1fr 1fr"}}>
      {imageList.map(image => {
        return (<div key={image}>
          <img src={`http://localhost:3000/Image/${image}`} alt={image} key={image} width={200} height={100} />
          <div>{image}</div>
        </div>)
      })}
    </div>
  )


}

export default App;
