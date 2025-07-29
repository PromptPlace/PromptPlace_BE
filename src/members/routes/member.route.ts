import { Router } from "express";
import { MemberController } from "../controllers/member.controller";
import { authenticateJwt } from "../../config/passport";
import { upload } from "../../middlewares/upload";

const router = Router();
const memberController = new MemberController();

router.get(
  "/followers/:memberId",
  authenticateJwt,
  memberController.getFollowers.bind(memberController)
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

// 회원 정보 수정 API
router.patch(
  "/",
  authenticateJwt,
  memberController.updateMember.bind(memberController)
);

// 회원 한줄 소개 작성/수정 API
router.post(
  "/intros",
  authenticateJwt,
  memberController.createOrUpdateIntro.bind(memberController)
);

// 회원 한줄 소개 수정 API
router.patch(
  "/intros",
  authenticateJwt,
  memberController.updateIntro.bind(memberController)
);

// 회원 이력 작성 API
router.post(
  "/histories",
  authenticateJwt,
  memberController.createHistory.bind(memberController)
);

// 회원 이력 수정 API
router.patch(
  "/histories/:historyId",
  authenticateJwt,
  memberController.updateHistory.bind(memberController)
);

// 회원 이력 삭제 API
router.delete(
  "/histories/:historyId",
  authenticateJwt,
  memberController.deleteHistory.bind(memberController)
);

// 회원 이력 조회 API
router.get(
  "/:memberId/histories",
  authenticateJwt,
  memberController.getHistories.bind(memberController)
);

// 회원 SNS 작성 API
router.post(
  "/sns",
  authenticateJwt,
  memberController.createSns.bind(memberController)
);

// 회원 SNS 수정 API
router.patch(
  "/sns/:snsId",
  authenticateJwt,
  memberController.updateSns.bind(memberController)
);

// 회원 SNS 삭제 API
router.delete(
  "/sns/:snsId",
  authenticateJwt,
  memberController.deleteSns.bind(memberController)
);

// 회원 SNS 목록 조회 API
router.get(
  "/:memberId/sns",
  authenticateJwt,
  memberController.getSnsList.bind(memberController)
);

// 회원 프로필 이미지 등록 API
router.post(
  "/images",
  authenticateJwt,
  upload.single("profile_image"),
  memberController.uploadProfileImage.bind(memberController)
);

// 회원 팔로우 API
router.post(
  "/follows/:memberId",
  authenticateJwt,
  memberController.followMember.bind(memberController)
);

// 회원 언팔로우 API
router.delete(
  "/follows/:memberId",
  authenticateJwt,
  memberController.unfollowMember.bind(memberController)
);

// 회원 탈퇴 API
router.delete(
  "/withdrawl",
  authenticateJwt,
  memberController.withdrawMember.bind(memberController)
);

export default router;
