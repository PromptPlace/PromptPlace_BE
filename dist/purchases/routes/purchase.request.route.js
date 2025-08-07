"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = require("../../config/passport");
const purchase_request_controller_1 = require("../controller/purchase.request.controller");
const router = (0, express_1.Router)();
router.post('/requests', passport_1.authenticateJwt, purchase_request_controller_1.PurchaseRequestController.createPurchaseRequest);
exports.default = router;
