let { Upload } = require("@aws-sdk/lib-storage");
let { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const AWS = require('aws-sdk')
const multer = require('multer')
const s3Config = {
    region: process.env.AWSREGION,
    credentials: {
        accessKeyId: process.env.ACCESSKEY,
        secretAccessKey: process.env.SECRETACCESSKEY,
    }
};
// update code
AWS.config.update({
    accessKeyId: process.env.ACCESSKEY,
    secretAccessKey: process.env.SECRETACCESSKEY,
    region: process.env.AWSREGION,
});
// Create an S3 client
const s3 = new AWS.S3();
// ==============
const s3Client = new S3Client(s3Config);
//multer config
//multer middleware
let upload = multer({
    limits: 1024 * 1024 * 5, //how much mb limits
    fileFilter: (req, file, done) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
            done(null, true)
        } else {
            done("Multer error - File type is not supported", false)
        }
    }
})
// AMS LOGO UPLOAD FUNCTIONS
const addLogo = async (fileData, folderName) => {
    // console.log("fileData,", fileData);
    // let  folderStructure = `logoimages/${fileData.originalname}`;
    let folderStructure;
    if (folderName === 'COMPANY') {
        folderStructure = `companylogo/${fileData.originalname}`;
    } else if (folderName === 'USER') {
        folderStructure = `userpic/${fileData.originalname}`;
    } else if (folderName === 'MACHINE') {
        folderStructure = `machinepic/${fileData.originalname}`;
    } else if (folderName === 'QRCODE') {
        folderStructure = `qrCode/${fileData.originalname}`;
    }
    // console.log("folder",folderStructure);
    try {
        let bucketParams = {
            Bucket: process.env.BUCKETNAME,
            Key: `${folderStructure}`,
            Body: fileData.buffer, // Using fileData.buffer instead of fs.readFile
        };
        // console.log("bucketParams==>>>", bucketParams);
        const parallelUploads3 = new Upload({
            client: s3Client,
            queueSize: 1,
            leavePartsOnError: false,
            params: bucketParams,
        });
        parallelUploads3.on("httpUploadProgress", (progress) => {
            console.log(progress);
        });
        const response = await parallelUploads3.done();
        let datafile = {
            url: response.Location,
            Key: fileData.originalname,
        };
        // console.log("bucketParams", datafile);
        return datafile;
    } catch (error) {
        console.log("Error", error)
    }
};
//View the image
const awsLogoAcces = async (img_link, folderName) => {
    let keyPath;
    // console.log("keyPath", img_link)
    if (folderName === 'COMPANY') {
        keyPath = `https://docs.myleads.in/companylogo/${img_link}`;
    } else if (folderName === 'USER') {
        keyPath = `https://docs.myleads.in/userpic/${img_link}`;
    } else if (folderName === 'MACHINE') {
        keyPath = `https://docs.myleads.in/machinepic/${img_link}`;
    } else if (folderName === 'QRCODE') {
        keyPath = `https://docs.myleads.in/qrCode/${img_link}`;
    }
    // const bucketParams = {
    //     Bucket: process.env.BUCKETNAME,
    //     Key: keyPath
    // };
    // const command = new GetObjectCommand(bucketParams);
    // const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    // const newUrl = new URL(url); //It will splite the url 
    // // console.log("newUrl=>", newUrl)
    // const basePath = newUrl.pathname;  //Folder name and filename  where the files are stored
    // // console.log("basePath=>", basePath)
    // // console.log("burl.origin=>", newUrl.origin); //Path of s3 bucket
    // const fixedUrl = "https://docs.myleads.in"
    // const baseUrl = `${fixedUrl}${basePath}`; // Removed unnecessary data from the getSingedUrl() created "url"
    // console.log("baseUrl", baseUrl)
    return keyPath
}
//update the file
const updateLogo = async (old_link, new_link, folderName) => {
    // console.log("file deleting data --> ", old_link, new_link);
    // let  deleteExistingImage = `logoimages/${old_link}`;
    //     let  folderStructure = `logoimages/${new_link.originalname}`;
    let deleteExistingfile;
    let folderStructure;
    if (folderName === 'COMPANY') {
        deleteExistingfile = `companylogo/${old_link}`;
        folderStructure = `companylogo/${new_link.originalname}`;
    } else if (folderName === 'USER') {
        deleteExistingfile = `userpic/${old_link}`;
        folderStructure = `userpic/${new_link.originalname}`;
    } else if (folderName === 'MACHINE') {
        deleteExistingfile = `machinepic/${old_link}`;
        folderStructure = `machinepic/${new_link.originalname}`;
    } else if (folderName === 'QRCODE') {
        deleteExistingfile = `qrCode/${old_link}`;
        folderStructure = `qrCode/${new_link.originalname}`;
    }
    // console.log("deleteExistingImage", deleteExistingfile);
    // console.log("folderStructure", folderStructure);
    try {
        // Step 1: Delete the existing image
        await s3.deleteObject({
            Bucket: process.env.BUCKETNAME,
            Key: deleteExistingfile,
        }).promise();
        // Step 2: Upload the new image
        // const data = await fs.promises.readFile(fileData.path);
        // console.log(data);
        const bucketParams = {
            Bucket: process.env.BUCKETNAME,
            Key: folderStructure,
            Body: new_link.buffer,
        };
        // console.log("bucketParams==>>>", bucketParams);
        const response = await s3.upload(bucketParams).promise();
        let datafile = {
            url: response.Location,
            Key: new_link.originalname,
        };
        // console.log("bucketParams", datafile);
        return datafile;
    } catch (error) {
        console.error("Error in updateAwsBanners:", error);
        throw error; // Rethrow the error to be caught by the calling function
    }
};

const generateQRCode = async (data) => {
    try {
        // Convert the data object to a JSON string 
        const qrData = await JSON.stringify(data); // Define the file path where the QR code image will be saved
        const uploadPath = path.join(__dirname, "..", "uploads", `${data.id}`);
        if (!fs.existsSync(uploadPath)) { fs.mkdirSync(uploadPath, { recursive: true }); }
        const filePath = await path.join(uploadPath, `qr_id_${data.id}.png`); // Generate the QR code and save it as an image
        await QRCode.toFile(filePath, qrData, { errorCorrectionLevel: 'H', type: 'png' });
        // AWS WORK NEEDED 
        // Read the file as buffer and upload to S3
        const fileData = await fs.promises.readFile(filePath); // Use promises to read the file
        const s3UploadResponse = await addLogo({ buffer: fileData, originalname: `qr_id_${data.id}.png` }, 'QRCODE');

        console.log('QR Code uploaded to S3 at:', s3UploadResponse.url);

        // Delete the local file after uploading
        await fs.promises.unlink(filePath);
        console.log('Local QR Code file deleted.');
        // console.log('s3UploadResponse',s3UploadResponse.Key);

        // Optional: Return the S3 URL of the uploaded QR Code
        return s3UploadResponse.url;
    } catch (err) { console.error('Error generating QR Code:', err); }
};

module.exports = {
    addLogo,
    awsLogoAcces,
    updateLogo,
    generateQRCode
}