const mongoose = require('mongoose')
 
async function dataBaseConnection() {
    try {
        await mongoose.connect(process.env.DB_URI)
        console.log(`Database connected successfully`);
        
    } catch (error) {
        throw new Error(error);
        
    }
}
module.exports = dataBaseConnection