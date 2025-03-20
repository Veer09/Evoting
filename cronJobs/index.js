const cron = require('node-cron');

cron.schedule('0 0 * * *', async() =>  {
    
    try{
        const response = await fetch('http://localhost:3000/checkStatus');
    }
    catch(e){
        console.log("Error in fetching data");
    }

});


