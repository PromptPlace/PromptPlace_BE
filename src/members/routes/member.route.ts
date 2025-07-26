import { Router } from 'express';
import { MemberController } from '../controllers/member.controller';
import { authenticateJwt } from '../../config/passport';

const router = Router();
const memberController = new MemberController();

router.get(
  '/followers/:memberId',
  authenticateJwt,
  memberController.getFollowers.bind(memberController),
);
router.post(
  '/follow/:memberId',
  authenticateJwt,
  memberController.followUser.bind(memberController),
);
router.delete(
  '/unfollow/:memberId',
  authenticateJwt,
  memberController.unfollowUser.bind(memberController),
);

router.get(
  '/following/:memberId',
  authenticateJwt,
  memberController.getFollowings.bind(memberController),
);

export default router; 