import { Provider } from "./Provider";
import { Offer } from "./Offer";

export type Invitation {
    offers: Offer[];
    provider: Provider
}