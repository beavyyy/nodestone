import express from "express";
import logger from "./logger/logger";
import pinoHttp from "pino-http";
import { Character } from "./profile/character";
import { Achievements } from "./profile/achievements";
import { ClassJob } from "./profile/classjob";
import { FreeCompany } from "./freecompany/freecompany";
import { FCMembers } from "./freecompany/members";
import { CharacterSearch } from "./search/character-search";
import { FreeCompanySearch } from "./search/freecompany-search";
import { Linkshell } from "./linkshell/linkshell";
import { LinkshellMembers } from "./linkshell/members";

const app = express();

const httpLogger = pinoHttp({ logger });
app.use(httpLogger);

const characterParser = new Character();
const achievementsParser = new Achievements();
const classJobParser = new ClassJob();
const freeCompanyParser = new FreeCompany();
const freeCompanyMemberParser = new FCMembers();
const characterSearch = new CharacterSearch();
const freecompanySearch = new FreeCompanySearch();
const linkshellParser = new Linkshell();
const linkshellMemberParser = new LinkshellMembers();

app.get("/Character/Search", async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  try {
    const parsed = await characterSearch.parse(req);
    return res.status(200).send(parsed);
  } catch (err: any) {
    return res.status(500).send(err);
  }
});

app.get("/FreeCompany/Search", async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  try {
    const parsed = await freecompanySearch.parse(req);
    return res.status(200).send(parsed);
  } catch (err: any) {
    return res.status(500).send(err);
  }
});

app.get("/Character/:characterId", async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  if ((req.query["columns"] as string)?.indexOf("Bio") > -1) {
    res.set("Cache-Control", "max-age=3600");
  }
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  try {
    const character = await characterParser.parse(req, "Character.");
    const parsed: any = {
      Character: {
        ID: +req.params.characterId,
        ...character,
      },
    };
    const additionalData = Array.isArray(req.query.data)
      ? req.query.data
      : [req.query.data].filter((d) => !!d);
    if (additionalData.includes("AC")) {
      parsed.Achievements = await achievementsParser.parse(
        req,
        "Achievements."
      );
    }
    if (additionalData.includes("CJ")) {
      parsed.ClassJobs = await classJobParser.parse(req, "ClassJobs.");
    }
    return res.status(200).send(parsed);
  } catch (err: any) {
    if (err.message === "404") {
      return res.sendStatus(404);
    }
    return res.status(500).send(err);
  }
});

app.get("/FreeCompany/:fcId", async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  try {
    const freeCompany = await freeCompanyParser.parse(req, "FreeCompany.");
    const parsed: any = {
      FreeCompany: {
        ID: +req.params.fcId,
        ...freeCompany,
      },
    };
    const additionalData = Array.isArray(req.query.data)
      ? req.query.data
      : [req.query.data].filter((d) => !!d);
    if (additionalData.includes("FCM")) {
      parsed.FreeCompanyMembers = await freeCompanyMemberParser.parse(
        req,
        "FreeCompanyMembers."
      );
    }
    return res.status(200).send(parsed);
  } catch (err: any) {
    if (err.message === "404") {
      return res.sendStatus(404);
    }
    return res.status(500).send(err);
  }
});

//Get linkshell name and list of members
app.get("/Linkshell/:linkshellid", async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  try {
    const linkshell = await linkshellParser.parse(req, "LinkShell.");

    const parsed: any = {
      Linkshell: {
        ID: +req.params.linkshellid,
        ...linkshell,
      },
    };

    //Fetch linkshell's members
    parsed.LinkshellMembers = await linkshellMemberParser.parse(
      req,
      "LinkshellMembers."
    );

    //Loop through the remaining pages and fetch the rest of the members
    while (parsed.LinkshellMembers.Pagination.PageNext !== null) {
      req.query.page = parsed.LinkshellMembers.Pagination.PageNext;

      const nextParseRes: any = await linkshellMemberParser.parse(
        req,
        "LinkshellMembers."
      );

      //Update member list with new results
      parsed.LinkshellMembers.List = [
        ...parsed.LinkshellMembers.List,
        ...nextParseRes.List,
      ];

      //Update pagination
      parsed.LinkshellMembers.Pagination = nextParseRes.Pagination;
    }

    return res.status(200).send(parsed);
  } catch (err: any) {
    if (err.message === "404") {
      return res.sendStatus(404);
    }
    console.error(err);
    return res.status(500).send(err);
  }
});

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  logger.info(`Listening at http://localhost:${port}`);
});
server.on("error", console.error);
