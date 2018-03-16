import * as path from "path";
import { Skaryna } from "./skaryna";

Skaryna.build(path.join(__dirname, "../../example"), path.join("../../docs"));
