import { google, drive_v3 } from 'googleapis';
import fs from 'fs';
import { logger } from '../../main';
import { Readable, Writable } from 'stream';
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
      .on('error', (err: any) => {
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

    logger.info('File uploaded: %o', res.data.id);
    return res.data.id;
  } catch (err: any) {
    logger.error('Error during upload: %o', err.stack);
    throw err;
  }
}

export async function getStatus(fileId: string): Promise<drive_v3.Schema$File> {
  const response = await drive.files.get({
    fileId,
    fields: 'id,name,size,mimeType,createdTime,modifiedTime',
  });

  return response.data;
}
