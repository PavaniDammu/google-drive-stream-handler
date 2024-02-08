import express from 'express';
import { downloadAndUploadVideo, getVideoStatus } from '../controllers/video.controller';

const router = express.Router();

router.get('/downloadAndUpload/:fileId/:destinationFolderId?', downloadAndUploadVideo);
router.get('/status/:fileId', getVideoStatus);

export default router;