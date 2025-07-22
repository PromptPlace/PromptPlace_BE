import express from "express";
import { getTipList } from "../controllers/tip.controllers";

const router = express.Router({ mergeParams: true });
router.get("/", getTipList);


export default router;
