
const SERVER = "http://localhost:3000"

export const getInitialImages = async () => {
    const response = await fetch(`${SERVER}/Images`)
    const data = await response.json()
    return data.resourceId
}

