"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const psn_api_1 = require("psn-api");
const psn_api_2 = require("psn-api");
// Express config
const app = (0, express_1.default)();
const port = 3000;
function getUser(username, pagenum) {
    return __awaiter(this, void 0, void 0, function* () {
        const accessCode = yield (0, psn_api_2.exchangeNpssoForCode)(process.env.KEY);
        const authorization = yield (0, psn_api_2.exchangeCodeForAccessToken)(accessCode);
        const allAccountsSearchResults = yield (0, psn_api_2.makeUniversalSearch)(authorization, username, "SocialAllAccounts");
        const targetAccountId = allAccountsSearchResults.domainResponses[0].results[0].socialMetadata.accountId;
        const { trophyTitles } = yield (0, psn_api_2.getUserTitles)(authorization, targetAccountId, {
            limit: 10,
            offset: (pagenum - 1) * 10
        });
        return trophyTitles;
    });
}
function getUserCount(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const accessCode = yield (0, psn_api_2.exchangeNpssoForCode)(process.env.KEY);
        const authorization = yield (0, psn_api_2.exchangeCodeForAccessToken)(accessCode);
        const allAccountsSearchResults = yield (0, psn_api_2.makeUniversalSearch)(authorization, username, "SocialAllAccounts");
        const targetAccountId = allAccountsSearchResults.domainResponses[0].results[0].socialMetadata.accountId;
        const trophyTitles = yield (0, psn_api_2.getUserTitles)(authorization, targetAccountId);
        return trophyTitles.totalItemCount;
    });
}
function profile(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const accessCode = yield (0, psn_api_2.exchangeNpssoForCode)(process.env.KEY);
        const authorization = yield (0, psn_api_2.exchangeCodeForAccessToken)(accessCode);
        const allAccountsSearchResults = yield (0, psn_api_2.makeUniversalSearch)(authorization, username, "SocialAllAccounts");
        const targetAccountId = allAccountsSearchResults.domainResponses[0].results[0].socialMetadata
            .accountId;
        const trophySummary = yield (0, psn_api_2.getUserTrophyProfileSummary)(authorization, targetAccountId);
        const prof = yield (0, psn_api_1.getProfileFromAccountId)(authorization, targetAccountId);
        let returnObject = {
            trophyLevel: trophySummary.trophyLevel,
            earnedTrophies: trophySummary.earnedTrophies,
            avatar: prof.avatars[2].url,
            tier: trophySummary.tier
        };
        return returnObject;
    });
}
app.get('/user/trophies/:id/:page', (req, res) => {
    if (req.params.page === "0") {
        getUserCount(req.params.id).then((trophyTitles) => {
            res.send({ count: trophyTitles });
        });
    }
    else {
        getUser(req.params.id, parseInt(req.params.page)).then((trophyTitles) => {
            res.send(trophyTitles);
        });
    }
});
app.get('/user/profile/:id', (req, res) => {
    profile(req.params.id).then((userProfile) => {
        res.send(userProfile);
    });
});
app.use((0, cors_1.default)());
app.listen(process.env.PORT || 8080, () => console.log("Server is running..."));
