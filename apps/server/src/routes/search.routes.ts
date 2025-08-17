import { Router, Request, Response } from 'express';
import { searchPostsAndUsers } from '../controllers/search.controller';

const router : Router = Router();

router.get('/', searchPostsAndUsers);

export default router;