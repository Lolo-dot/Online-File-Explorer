const {execSync} = require('child_process');

const calculateSizeD = itemFullStaticPath => {
   //remove spaces, tabs, etc
   const itemFullStaticPathCleaned =itemFullStaticPath.replace(/\s/g, '\ ');
   const commandOutput = execSync(`du -sh "${itemFullStaticPathCleaned}"`).toString();

   //remove spaces, tabs, etc
   let filesize = commandOutput.replace(/\s/g, '');

   //split filesize using the '/' seperator
   filesize = filesize.split('/');

   //get the first element which is the file size
   filesize = filesize[0];

   //unit of file size
   const filesizeUnit = filesize.replace(/\d|\./g, '');

   //size number
   const filesizeNumber = parseFloat(filesize.replace(/[a-z]/i, ''));

   //possible file units
   const units = "BKMGT";

   //B -> 1
   //K -> 1 * 1024
   //M -> 1 * 1024 * 1024
   //G -> 1 * 1024 * 1024 * 1024
   //T -> 1 * 1024 * 1024 * 1024 *  1024

   const filesizeBytes = filesizeNumber * Math.pow(1024, units.indexOf(filesizeUnit));

   return [filesize, filesizeBytes];

}

module.exports = calculateSizeD;