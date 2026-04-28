require('dotenv').config()
const express = require('express')
const cors = require('cors')
const userRoute = require('./Routes/User.Routes');
const dataBaseConnection = require('./Config/mongoDb.Config');
const cookieParser = require("cookie-parser");
const usermiddleware = require('./MiddleWares/User.middelWare');
const productRouter = require('./Routes/product.Routes');
const addtocarRouter = require('./Routes/addToCart.Routes');
 const server =express()
 //======Middel wares======
 server.use(express.json());
 server.use(express.urlencoded({extends:true}));
server.use(cookieParser());
server.use(cors({
    origin: "http://localhost:5173",
    credentials:true
}))
server.use('/uploads', express.static('uploads'));
 //=====User Routes ============
 server.use('/user',userRoute)
 //=====Product Routes ============
server.use('/product',productRouter)
 //=====addTOCart Routes ============
server.use('/addtocart',addtocarRouter)
const port = process.env.PORT
server.listen(port,async()=> {
    try {
          await dataBaseConnection()
        console.log(`server is live on port ${port}`);
    } catch (error) {
        process.exit(1)
    }
})