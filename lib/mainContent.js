const fs = require("fs");
const path = require('path');

//require files
const calculateSizeD = require('./calculateSizeD.js');
const calculateSizeF = require('./calculateSizeF.js');

const buildMainContent = (fullStaticPath, pathname) => {
    let mainContent = '';
    let items;
    //loop through the elements in a folder
    try {
       items =  fs.readdirSync(fullStaticPath);
    } catch (error) {
        console.log(`readdirSync error: ${error}`);
        return '<div class="alert alert-danger"> Internal Server Error </div>';
    }

    //home directory, remove project_files
    if(pathname === '/'){ 
        items = items.filter(element => element !== 'project_files');
    }

    items.forEach(item => {
        let itemDetails = {}

        //name
        itemDetails.name = item;
        //link
        let link = path.join(pathname, item);

        
        const itemFullStaticPath = path.join(fullStaticPath, item);
        

        try {
            itemDetails.stats = fs.statSync(itemFullStaticPath);
        } catch (error) {
            console.log(`statSync error: ${err}`);
            mainContent = '<div class="alert alert-danger"> Internal Server Error </div>';
            return false;
        }

        if(itemDetails.stats.isDirectory()){
            itemDetails.icon = '<ion-icon name="folder"></ion-icon>';

            //get the size of a directory
           [itemDetails.size, itemDetails.sizeBytes] = calculateSizeD(itemFullStaticPath);
        }
        else if(itemDetails.stats.isFile()){
            itemDetails.icon = '<ion-icon name="document"></ion-icon>';

            //get size of the file
            [itemDetails.size, itemDetails.sizeBytes] = calculateSizeF(itemDetails.stats);
        }

        //When was the time last changed
        itemDetails.timeStamp = parseInt(itemDetails.stats.mtimeMs);

        //convert timestamp to a date
        itemDetails.date = new Date(itemDetails.timeStamp);

        itemDetails.date = itemDetails.date.toLocaleString();


        mainContent += `
    <tr data-name="${itemDetails.name}" data-size="${itemDetails.sizeBytes}" data-time="${itemDetails.timeStamp}">
        <td>${itemDetails.icon}<a href="${link}" target='${itemDetails.stats.isFile() ? "_blank" : ""}'>${item}</a></td>
        <td>${itemDetails.size}</td>
        <td>${itemDetails.date}</td>
    </tr>`;
    })
    

    return mainContent;
}

module.exports = buildMainContent;