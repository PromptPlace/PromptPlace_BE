import express from "express";
import { MemberController } from "../controllers/member.controller";
import { authenticateJwt } from "../../config/passport";
import { isAdmin } from "../../middlewares/isAdmin";

const router = express.Router();
const memberController = new MemberController();

router.delete(
  "/histories/:historyId",
  authenticateJwt,
  isAdmin,
  memberController.adminDeleteHistory.bind(memberController)
);

export default router;
