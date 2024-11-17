import type { Context } from "../createContext.js";
import { notFoundResponse } from "../notFoundResponse.js";
import { getAllPages } from "./pages.js";
import {
	getCardsSet,
	getCardById,
	getRandomCard,
} from "./tarot.js";

export const router = (context: Context): Response | Promise<Response> => {
	const url = new URL(context.request.url)
	if (url.pathname.startsWith('/get-all-pages')) {
		return getAllPages(context)
	}
	if (url.pathname.startsWith('/get-cards-set')) {
		return getCardsSet(context)
	}
	if (url.pathname.startsWith('/get-card-by-id')) {
		return getCardById(context)
	}
	if (url.pathname.startsWith('/get-random-card')) {
		return getRandomCard(context)
	}
	return notFoundResponse()
}
