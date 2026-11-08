"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invitationLimiter = exports.authLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("../config/env");
const response_util_1 = require("../utils/response.util");
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: env_1.env.NODE_ENV === 'test' ? 10000 : 30, // 30 requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        return (0, response_util_1.sendError)(res, 429, 'Too many authentication attempts. Please try again after 15 minutes.', 'RATE_LIMITED');
    },
});
exports.invitationLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: env_1.env.NODE_ENV === 'test' ? 10000 : 50,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        return (0, response_util_1.sendError)(res, 429, 'Invitation dispatch rate limit reached. Please try again in an hour.', 'RATE_LIMITED');
    },
});
