require('dotenv').config()
const express = require('express')
 const server =express()
 //======Middel wares======

const port = process.env.PORT
server.listen(port,async()=> {
    try {
        console.log(`server is live on port ${port}`);
        
    } catch (error) {
        process.exit(1)
    }
})