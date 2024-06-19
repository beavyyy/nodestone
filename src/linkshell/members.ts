import { Request } from "express";
import * as members from "../lib/lodestone-css-selectors/linkshell/members.json";
import { CssSelectorRegistry } from "../core/css-selector-registry";
import { PaginatedPageParser } from "../core/paginated-page-parser";

export class LinkshellMembers extends PaginatedPageParser {
  protected getCSSSelectors(): CssSelectorRegistry {
    return members;
  }

  protected getBaseURL(req: Request): string {
    return (
      "https://eu.finalfantasyxiv.com/lodestone/linkshell/" +
      req.params.linkshellid
    );
  }

  async parse(req: Request, columnsPrefix: string = ""): Promise<Object> {
    const fromSuper: any = await super.parse(req, columnsPrefix);
    return fromSuper;
  }
}
