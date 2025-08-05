"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// config/eventBus.ts
const events_1 = require("events");
const eventBus = new events_1.EventEmitter();
exports.default = eventBus;
