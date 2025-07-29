import { Router } from "express";
import { MemberController } from "../controllers/member.controller";
import { authenticateJwt } from "../../config/passport";

const router = Router();
const memberController = new MemberController();

router.get(
  "/followers/:memberId",
  authenticateJwt,
  memberController.getFollowers.bind(memberController)
);
router.post(
  "/follow/:memberId",
  authenticateJwt,
  memberController.followUser.bind(memberController)
);
router.delete(
  "/unfollow/:memberId",
  authenticateJwt,
  memberController.unfollowUser.bind(memberController)
);

router.get(
  "/following/:memberId",
  authenticateJwt,
  memberController.getFollowings.bind(memberController)
);

// 특정 회원의 프롬프트 목록 조회 API
router.get(
  "/:memberId/prompts",
  memberController.getMemberPrompts.bind(memberController)
);

// 특정 회원 정보 조회 API
router.get(
  "/:memberId",
  authenticateJwt,
  memberController.getMemberById.bind(memberController)
);

export default router;
