import { Request } from "express";
import * as ls from "../lib/lodestone-css-selectors/linkshell/ls.json";
import { CssSelectorRegistry } from "../core/css-selector-registry";
import { PageParser } from "../core/page-parser";

export class Linkshell extends PageParser {
  protected getCSSSelectors(): CssSelectorRegistry {
    return { ...ls };
  }

  protected getURL(req: Request): string {
    return (
      "https://eu.finalfantasyxiv.com/lodestone/linkshell/" +
      req.params.linkshellid
    );
  }
}
