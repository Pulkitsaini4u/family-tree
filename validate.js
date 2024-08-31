const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

const sourceFolder = 'D:\\New folder'; // replace with your folder path
const filesPerFolder = 8000;
const destinationBase = 'D:\\New1'; // replace with your destination folder path
const maxConcurrentCopies = 100; // Maximum number of concurrent copy operations

// Function to check if a file is a valid image
async function isValidImage(filePath) {
    try {
        await sharp(filePath).metadata();
        return true;
    } catch (err) {
        return false;
    }
}

(async () => {
    try {
        const files = await fs.readdir(sourceFolder);

        // Step 1: Create folders for valid and invalid images
        const validFolderBase = path.join(destinationBase, 'valid');
        const invalidFolderBase = path.join(destinationBase, 'invalid');

        await fs.mkdir(validFolderBase, { recursive: true });
        await fs.mkdir(invalidFolderBase, { recursive: true });

        console.log('Created folders for valid and invalid images.');

        let validFileCount = 0;
        let invalidFileCount = 0;

        let fileCopyPromises = [];
        for (let i = 0; i < files.length; i++) {
            const sourceFile = path.join(sourceFolder, files[i]);
            const isValid = await isValidImage(sourceFile);

            let newFolderPath;
            let folderIndex;
            if (isValid) {
                folderIndex = Math.floor(validFileCount / filesPerFolder);
                newFolderPath = path.join(validFolderBase, `folder_${folderIndex}`);
                validFileCount++;
            } else {
                folderIndex = Math.floor(invalidFileCount / filesPerFolder);
                newFolderPath = path.join(invalidFolderBase, `folder_${folderIndex}`);
                invalidFileCount++;
            }

            await fs.mkdir(newFolderPath, { recursive: true });
            const destFile = path.join(newFolderPath, files[i]);
            fileCopyPromises.push(fs.copyFile(sourceFile, destFile));

            // Execute file copies in chunks of maxConcurrentCopies
            if (fileCopyPromises.length >= maxConcurrentCopies) {
                await Promise.all(fileCopyPromises);
                fileCopyPromises = [];
            }
        }

        // Copy any remaining files
        if (fileCopyPromises.length > 0) {
            await Promise.all(fileCopyPromises);
        }

        console.log('Files have been split into folders successfully.');
    } catch (err) {
        console.error(`Error occurred: ${err}`);
    }
})();
