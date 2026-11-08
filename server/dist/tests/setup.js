"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
let mongoServer;
beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_ACCESS_SECRET = 'test_access_secret_1234567890_test';
    process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_1234567890_test';
    mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose_1.default.connect(uri);
}, 60000);
afterEach(async () => {
    if (mongoose_1.default.connection.readyState === 1 && mongoose_1.default.connection.db) {
        const collections = await mongoose_1.default.connection.db.collections();
        for (const collection of collections) {
            await collection.deleteMany({});
        }
    }
});
afterAll(async () => {
    if (mongoose_1.default.connection.readyState !== 0) {
        await mongoose_1.default.disconnect();
    }
    if (mongoServer) {
        await mongoServer.stop({ doCleanup: true, force: true });
    }
}, 30000);
