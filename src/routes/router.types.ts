import type { GetAllPagesData, GetAllPagesInput } from "./pages.types.js";
import {
	type GetCardsSetData, type GetCardsSetInput,
	type GetCardByIdData, type GetCardByIdInput, type GetRandomCardInput,
	type GetRandomCardData
} from './tarot.types.js'

export type Router = {
	['get-all-pages']: {
		input: GetAllPagesInput,
		data: GetAllPagesData,
	},
	['get-cards-set']: { input: GetCardsSetInput, data: GetCardsSetData }
	['get-card-by-id']: { input: GetCardByIdInput, data: GetCardByIdData }
	['get-random-card']: { input: GetRandomCardInput, data: GetRandomCardData }
}
