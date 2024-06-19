import { PaginatedPageParser } from "../core/paginated-page-parser";
import { CssSelectorRegistry } from "../core/css-selector-registry";
import * as linkshellSearch from "../lib/lodestone-css-selectors/search/linkshell.json";
import { Request } from "express";
import logger from "../logger/logger";

export class LinkshellSearch extends PaginatedPageParser {
  protected getBaseURL(req: Request): string {
    logger.info(req.query);
    let query = `?q=${req.query.name}&order=3`;
    if (req.query.server) {
      query += `&worldname=${req.query.server}`;
    }
    return `https://na.finalfantasyxiv.com/lodestone/linkshell/${query}`;
  }

  protected getCSSSelectors(): CssSelectorRegistry {
    return linkshellSearch;
  }
}
