import { Request, Response } from 'express';
import * as path from 'path';
import { downloadVideo, getStatus, uploadVideoInChunks, } from '../services/video.service';
import { logger } from '../../main';
import os from 'os';

export async function downloadAndUploadVideo(req: Request, res: Response): Promise<void> {
  const { fileId, destinationFolderId } = req.params;

  try {
     // Download video
     const desktopPath = path.join(os.homedir(), 'Desktop');
     const downloadDestPath = path.join(desktopPath, 'downloadedVideo.mp4');
 
     const uploadDestFolderId = destinationFolderId || ''; 

    // Initiate download and upload concurrently
    const downloadPromise = downloadVideo(fileId, downloadDestPath);
    const uploadPromise = await uploadVideoInChunks(downloadDestPath, uploadDestFolderId);

    // Wait for both promises to resolve
    await Promise.all([downloadPromise, uploadPromise]);

     // Respond with success
     res.status(200).json({ message: 'Download and upload successful' });
  } catch (error:any) {
    logger.error('Error while downloading and uploading the video:  %o', error.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getVideoStatus(req: Request, res: Response): Promise<void> {
  const { fileId } = req.params;

  try {
    const status = await getStatus(fileId);
    res.status(200).json(status);
  } catch (error: any) {
    logger.error('Error getting video status:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}