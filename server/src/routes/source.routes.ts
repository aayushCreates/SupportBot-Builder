import { Router } from 'express';
import multer from 'multer';
import { 
  listSources, 
  addSource, 
  deleteSource 
} from '../controllers/source.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { checkBotOwnership } from '../middlewares/ownership.middleware';

const router = Router({ mergeParams: true }); // Important to access botId from parent router

// Multer config for PDF uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

router.use(requireAuth);
router.use(checkBotOwnership);

router.get('/', listSources as any);
router.post('/', upload.single('file'), addSource as any);
router.delete('/:sourceId', deleteSource as any);

export default router;
