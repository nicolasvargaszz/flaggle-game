import countries from "../../countries.js";
import { withDifficulty } from "./countryDifficulty.js";

export default countries.map(withDifficulty);
