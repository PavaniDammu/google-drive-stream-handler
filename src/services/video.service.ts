import { google, drive_v3 } from 'googleapis';
import fs from 'fs';
import { logger } from '../../main';
import { Readable, Writable } from 'stream';
// import { promisify } from 'util';
import path from 'path';

const auth = new google.auth.GoogleAuth({
  keyFile: './dist/service-account-key.json',
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

export async function downloadVideo(fileId: string, destPath: string): Promise<void> {
  const dest = fs.createWriteStream(destPath);
  const response = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });

  return new Promise<void>((resolve, reject) => {
    response.data
      .on('end', () => {
        logger.info('Download complete');
        resolve();
      })
      .on('error', (err) => {
        logger.error('Error during download', err);
        reject(err);
      })
      .pipe(dest);
  });
}

export async function uploadVideoInChunks(filePath: string, destFolderId: string): Promise<string> {
  try {
    const fileBuffer = fs.readFileSync(filePath);

    logger.info('fileBuffer:%o', fileBuffer);
    const CHUNK_SIZE = 10 * 1024 * 1024;

    const fileMetadata: drive_v3.Schema$File = {
      name: 'video.mp4',
      parents: [destFolderId],
      mimeType: 'video/mp4'
    };

    const media: any = {
      body: new Readable({
        read() {
          let offset = 0;
          while (offset < fileBuffer.length) {
            const chunkEnd = Math.min(offset + CHUNK_SIZE, fileBuffer.length);
            const chunk = fileBuffer.slice(offset, chunkEnd);
            this.push(chunk);
            offset += CHUNK_SIZE;
          }
          this.push(null);
        }
      }),
    };
    const res: any = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id',
    });

    let fileId = res.data.id;

    const res1: any = drive.files.update({
      fileId: fileId,
      media: media,
      //range: `bytes ${startByte}-${endByte - 1}/${fileSize}`,
    },{});

    logger.info('File uploaded: %o', res.data.id);
    return res.data.id;
  } catch (err: any) {
    logger.error('Error during upload: %o', err.stack);
    throw err;
  }
}

// export async function uploadVideoChunkByChunk(filePath: string, destFolderId: string): Promise<string> {
//   const fileSize = fs.statSync(filePath).size;
//   const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunk size

//   const fileName = path.basename(filePath);
//   const fileMetadata = {
//     name: fileName,
//     parents: [destFolderId],
//     mimeType: 'video/mp4',
//   };

//   let fileId: string | undefined;

//   for (let i = 0; i < Math.ceil(fileSize / CHUNK_SIZE); i++) {
    // const startByte = i * CHUNK_SIZE;
    // const endByte = Math.min((i + 1) * CHUNK_SIZE, fileSize);

//     const media = {
//       mimeType: 'video/mp4',
//       body: fs.createReadStream(filePath, { start: startByte, end: endByte - 1 }),
//     };

//     try {
//       const res = await drive.files.create({
//         requestBody: fileMetadata,
//         media: media,
//         fields: 'id',
//       });

//       fileId = res.data.id;

//       // Update the existing file with the chunk data
      // await drive.files.update({
      //   fileId: fileId,
      //   media: media,
      //   range: `bytes ${startByte}-${endByte - 1}/${fileSize}`,
      // });

//       logger.info(`Uploaded chunk ${i + 1}/${Math.ceil(fileSize / CHUNK_SIZE)}`);
//     } catch (error) {
//       logger.error('Error uploading chunk:', error);
//       throw error;
//     }
//   }

//   return fileId!;
// }


// const pipeline = promisify(require('stream').pipeline);

// export async function downloadAndUploadInChunks(fileId: string, destPath: string, destFolderId: string): Promise<void> {
//   try {
//     // Initiate download
//     const downloadStream = await downloadVideoStream(fileId, destPath);

//     // Initialize upload
//     const fileMetadata: drive_v3.Schema$File = {
//       name: 'video.mp4',
//       parents: [destFolderId],
//       mimeType: 'video/mp4',
//     };

//     const media: any = {
//       mimeType: 'video/mp4',
//       body: new Writable({
//         async write(chunk, encoding, callback) {
//           try {
//             // Upload each chunk
//             await uploadVideoChunk(fileMetadata, chunk);
//             callback();
//           } catch (err: any) {
//             callback(err);
//           }
//         },
//       }),
//     };

//     // Stream download directly into the upload
//     await pipeline(downloadStream, media.body);

//     // Respond with success
//     logger.info('Download and Upload successful');
//   } catch (error: any) {
//     logger.error('Error while downloading and uploading: %o', error.stack);
//     throw error;
//   }
// }

// export async function downloadVideoStream(fileId: string, destPath: string): Promise<void> {
//   // const response = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
//   // return response.data;
//   const dest = fs.createWriteStream(destPath);
//   const response = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });

//   return new Promise<void>((resolve, reject) => {
//     response.data
//       .on('end', () => {
//         logger.info('Download complete');
//         resolve();
//       })
//       .on('error', (err) => {
//         logger.error('Error during download', err);
//         reject(err);
//       })
//       .pipe(dest);
//   });
// }

// export async function uploadVideoChunk(fileMetadata: drive_v3.Schema$File, chunk: Buffer): Promise<Object> {
//   const media: any = {
//     mimeType: 'video/mp4',
//     body: new Readable({
//       read() {
//         this.push(chunk);
//         this.push(null);
//       },
//     }),
//   };
  
//   const res = await drive.files.create({
//     requestBody: fileMetadata,
//     media: media,
//     fields: 'id',
//   });
//   // logger.info('Uploaded chunk:', res.data.id);
//   return res;
// }

export async function getStatus(fileId: string): Promise<drive_v3.Schema$File> {
  const response = await drive.files.get({
    fileId,
    fields: 'id,name,size,mimeType,createdTime,modifiedTime',
  });

  return response.data;
}
