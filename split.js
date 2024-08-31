const fs = require('fs').promises;
const path = require('path');

const sourceFolder = 'D:\\New folder'; // replace with your folder path
const filesPerFolder = 200;
const destinationBase = 'D:\\New'; // replace with your destination folder path

(async () => {
    try {
        const files = await fs.readdir(sourceFolder);
        let folderIndex = 0;
        for (let i = 0; i < files.length; i += filesPerFolder) {
            const filesToCopy = files.slice(i, i + filesPerFolder);
            const newFolderPath = path.join(destinationBase, `folder_${folderIndex}`);
            await fs.mkdir(newFolderPath, {
                recursive: true
            });
        
            copy(folderIndex, filesToCopy, newFolderPath);
            folderIndex++;
        }

        console.log('Files have been split into folders successfully.');
    } catch (err) {
        console.error(`Error occurred: ${err}`);
    }
})();

async function copy(folderIndex, filesToCopy, newFolderPath) {
   
    console.log("Number of files in folder_", folderIndex, ":", filesToCopy.length);

    const copyPromises = filesToCopy.map(file => {
        const sourceFile = path.join(sourceFolder, file);
        const destFile = path.join(newFolderPath, file);
        return fs.copyFile(sourceFile, destFile);
    });

    Promise.all(copyPromises);

    console.log(`Folder ${folderIndex} created and files copied.`);
}