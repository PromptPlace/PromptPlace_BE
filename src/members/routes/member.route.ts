import express from 'express';
import { MemberController } from '../controllers/member.controller';
import passport from 'passport';

const router = express.Router();
const memberController = new MemberController();

router.post('/sns', passport.authenticate('jwt', { session: false }), (req, res, next) =>
  memberController.createSns(req, res, next)
);

router.patch('/sns/:snsId', passport.authenticate('jwt', { session: false }), (req, res, next) =>
  memberController.updateSns(req, res, next)
);

router.delete('/sns/:snsId', passport.authenticate('jwt', { session: false }), (req, res, next) =>
  memberController.deleteSns(req, res, next)
);

router.get('/:memberId/sns', passport.authenticate('jwt', { session: false }), (req, res, next) =>
  memberController.getSnsList(req, res, next)
);

router.post('/follows/:memberId', passport.authenticate('jwt', { session: false }), (req, res, next) =>
  memberController.followUser(req, res, next)
);

export default router; 