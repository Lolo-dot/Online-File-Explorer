const path = require('path');
const url = require('url');
const fs = require('fs');

//file imports
const buildBreadCrumb = require('./breadcrumb.js');
const buildMainContent = require('./mainContent.js');
const getMimeType = require('./getMimeType.js');

//get the location of the static folder
const staticeBasePath = path.join(__dirname, '..', 'static');

const respond = (request, response) => {

    //get the path name 
    let pathname = url.parse(request.url).pathname;
    
    if(pathname === '/favicon.ico'){
        return false;
    }

    //decode the pathname
    pathname = decodeURIComponent(pathname);

    //get the corresponding path is the static folder
    const fullStaticPath = path.join(staticeBasePath, pathname);

    //check if the path exists
    if(!fs.existsSync(fullStaticPath)){
        console.log(`${fullStaticPath} does not exist`);
        response.write('404: File not found!');
        response.end();
        return false;
    }
    
    //check if path is a directory or file
    let stat;
    try {
        stat = fs.lstatSync(fullStaticPath);
    } catch (error) {
        console.log(`lstatSync error ${error}`); 
    }

    if(stat.isDirectory()){
        //get content from the template index.html
        let data = fs.readFileSync(path.join(staticeBasePath, 'project_files/index.html'), 'utf-8');

        //change page title
        let pathElements = pathname.split('/').reverse();
        pathElements = pathElements.filter(element => element !== '');
        let folderName = pathElements[0];
        if(folderName === undefined){
            folderName = 'Home';
        }
        
        //build breadcrumb
        const breadcrumb = buildBreadCrumb(pathname);
        
        //build table rows with the content in the directory
        const mainContent = buildMainContent(fullStaticPath, pathname);

        data = data.replace('page_title', folderName);
        data = data.replace('pathname', breadcrumb);
        data = data.replace('maincontent', mainContent);


        response.statusCode = 200;
        response.write(data);
        return response.end();

    }

    if(!stat.isFile()){
        response.statusCode = 401;
        response.write('401: Access denied!');
        console.log('not a file!');
        return response.end()
    }

    let fileDetails = {};
    fileDetails.extname = path.extname(fullStaticPath);

    //file size
    let stats;
                
                try {
                stats = fs.statSync(fullStaticPath);
            } catch (error) {
                console.log(`Error: ${error}`);
            }

        fileDetails.size = stats.size;

    getMimeType(fileDetails.extname)
    .then(mime => {
        //store headers
        let head = {};
        let options = {};

        //response status code
        let statusCode = 200;


        //set "Content-Type" for all file types
        head['Content-Type'] = mime;

        //pdf file
        if(fileDetails.extname === '.pdf'){
            head['Content-Disposition'] = 'inline';
            //head['Content-Disposition'] = 'attachment;filename=file.pdf' (making the pdf downloadable)
        }

        //audio/video file
        if(RegExp('audio').test(mime) || RegExp('video').test(mime)){
            //headers
            head['Accept-Ranges'] = 'bytes';
            const range = request.headers.range;
            if(range){

                const start_end = range.replace(/bytes=/, "").split('-');
                const start = parseInt(start_end[0]);
                const end = start_end[1]? parseInt(start_end[1]) : fileDetails.size - 1;
                
            head['Content-Range'] = `bytes ${start}-${end}/${fileDetails.size}`;
            head['Content-Length'] = end - start + 1;
            statusCode = 206;

            options = {start, end};
            }

            

        }
        //reading file using fs.readFile
//        fs.readFile(fullStaticPath, 'utf-8', (error, data) =>{
//            if(error){
//                response.statusCode = 404;
//                response.write('404: File reading error!');
//                return response.end();
//            }
//            else{
//                response.writeHead(statusCode, head);
//                response.write(data);
//                return response.end();
//            }

  //      })

        //streaming method:
        const fileStream = fs.createReadStream(fullStaticPath, options);

        //stream chunks
        response.writeHead(statusCode, head);
        fileStream.pipe(response);

        //events (close and error)
        fileStream.on('close', () =>{
            return response.end();
        })
        fileStream.on('error', error =>{
            console.log(error.code);
            response.statusCode = 404;
            response.write('404: File streaming error!');
            return response.end();
        })
    })
    .catch(err => {
        response.statusCode = 500;
        response.write('500: Internal Server Error!');
        console.log(`Promise error: ${err}`);
        return response.end;
    })
} 

module.exports = respond;