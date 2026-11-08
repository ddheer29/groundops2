"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
exports.disconnectDatabase = disconnectDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
let memoryServerInstance = null;
async function connectDatabase() {
    if (mongoose_1.default.connection.readyState === 1) {
        return mongoose_1.default;
    }
    let mongoUri = env_1.env.MONGODB_URI;
    try {
        // Attempt standard connection
        await mongoose_1.default.connect(mongoUri, {
            serverSelectionTimeoutMS: 2000,
        });
        console.log(`[Database] Connected to MongoDB at ${mongoUri}`);
        return mongoose_1.default;
    }
    catch (initialError) {
        // In development or test, fallback to MongoMemoryServer if local mongod is not reachable
        if (env_1.env.NODE_ENV !== 'production') {
            console.warn(`[Database] Local MongoDB unreachable at ${mongoUri}. Initializing embedded MongoDB engine for seamless execution...`);
            try {
                const { MongoMemoryServer } = await Promise.resolve().then(() => __importStar(require('mongodb-memory-server')));
                memoryServerInstance = await MongoMemoryServer.create();
                mongoUri = memoryServerInstance.getUri();
                await mongoose_1.default.connect(mongoUri);
                console.log(`[Database] Connected to in-memory MongoDB at ${mongoUri}`);
                return mongoose_1.default;
            }
            catch (memErr) {
                console.error('[Database] Failed to start in-memory MongoDB:', memErr);
                throw initialError;
            }
        }
        throw initialError;
    }
}
async function disconnectDatabase() {
    if (mongoose_1.default.connection.readyState !== 0) {
        await mongoose_1.default.disconnect();
    }
    if (memoryServerInstance) {
        await memoryServerInstance.stop();
        memoryServerInstance = null;
    }
}
