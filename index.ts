import express from 'express';
import cors from 'cors'
import { getProfileFromAccountId } from "psn-api";
import {
  exchangeCodeForAccessToken,
  exchangeNpssoForCode,
  getUserTitles,
  makeUniversalSearch,
  getUserTrophyProfileSummary
} from "psn-api";
// Express config
const app = express()
const port = 3000

async function getUser(username: any, pagenum:number) {
    const accessCode = await exchangeNpssoForCode(process.env.KEY!);
    const authorization = await exchangeCodeForAccessToken(accessCode);
  
    const allAccountsSearchResults = await makeUniversalSearch(
      authorization,
      username,
      "SocialAllAccounts"
    );

    const targetAccountId =
    allAccountsSearchResults.domainResponses[0].results[0].socialMetadata.accountId;
    const  { trophyTitles }  = await getUserTitles(authorization, targetAccountId, {
        limit: 10,
        offset: (pagenum-1)*10
    });
    return trophyTitles;
  
    }

async function getUserCount(username: any) {
    const accessCode = await exchangeNpssoForCode(process.env.KEY!);
    const authorization = await exchangeCodeForAccessToken(accessCode);
      
    const allAccountsSearchResults = await makeUniversalSearch(
        authorization,
        username,
        "SocialAllAccounts"
    );
    
    const targetAccountId =
    allAccountsSearchResults.domainResponses[0].results[0].socialMetadata.accountId;
    const   trophyTitles   = await getUserTitles(authorization, targetAccountId);
    return trophyTitles.totalItemCount;
      
    }

async function profile(username: any) {
    const accessCode = await exchangeNpssoForCode(process.env.KEY!);
    const authorization = await exchangeCodeForAccessToken(accessCode);
    const allAccountsSearchResults = await makeUniversalSearch(
        authorization,
        username,
        "SocialAllAccounts"
    );
    const targetAccountId =
    allAccountsSearchResults.domainResponses[0].results[0].socialMetadata
    .accountId;      
        const trophySummary = await getUserTrophyProfileSummary(authorization, targetAccountId)
        const prof = await getProfileFromAccountId(authorization, targetAccountId);
        let returnObject = {
            trophyLevel: trophySummary.trophyLevel,
            earnedTrophies: trophySummary.earnedTrophies,
            avatar: prof.avatars[2].url,
            tier: trophySummary.tier
        }
    return returnObject;
      }
    


app.get('/user/trophies/:id/:page', (req, res) => {
    if(req.params.page==="0"){
        getUserCount(req.params.id).then((trophyTitles) => {
            res.send({count: trophyTitles})
        }) 
    } else {
        getUser(req.params.id, parseInt(req.params.page)).then((trophyTitles) => {
            res.send(trophyTitles)
        })
    }
    
 })

app.get('/user/profile/:id', (req, res) => { 
    profile(req.params.id).then((userProfile) => {
        res.send(userProfile)
    })
 })


app.use(cors());


app.listen(process.env.PORT || 8080, 
	() => console.log("Server is running..."));

