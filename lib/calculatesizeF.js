const {execSync} = require('child_process');

const calculateSizeF = stats => {
    const filesizeBytes = stats.size; //size in bytes
   
    const units = "BKMGT";
    let index;

    if(filesizeBytes != 0){
        index = Math.floor(Math.log10(filesizeBytes)/3);
    }
    else{
        index = 0;
    }

    const filesizeHuman =  (filesizeBytes/Math.pow(1024, index)).toFixed(1);

    const unit = units[index];

    filesize = `${filesizeHuman}${unit}`;

    return [filesize, filesizeBytes];

}

module.exports = calculateSizeF;