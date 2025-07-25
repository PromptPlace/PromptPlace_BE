import express from 'express';
import { MemberController } from '../controllers/member.controller';
import passport from 'passport';

const router = express.Router();
const memberController = new MemberController();

router.post('/sns', passport.authenticate('jwt', { session: false }), (req, res, next) =>
  memberController.createSns(req, res, next)
);

export default router; 