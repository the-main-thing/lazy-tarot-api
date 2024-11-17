export type GetCardByIdInput = {
	path: [language: string, id: string]
}
export type GetCardsSetInput = { path: [language: string] }

export type GetCardsSetData = [{
	id: string;
	regular: {
		title: string;
		shortDescription: string;
		fullDescription: Record<PropertyKey, any>;
	};
	upsideDown: {
		title: string;
		shortDescription: string;
		fullDescription: Record<PropertyKey, any>;
	};
	image: {
		dimentions: NonNullable<[width: number, height: number] | null>;
		srcSet: {
			placeholder: {
				src: string;
				width: 30;
			};
			'2xs': {
				src: string;
				width: 100;
			};
			xs: {
				src: string;
				width: 300;
			};
			sm: {
				src: string;
				width: 640;
			};
			md: {
				src: string;
				width: 768;
			};
			lg: {
				src: string;
				width: 1024;
			};
			xl: {
				src: string;
				width: 1280;
			};
			'2xl': {
				src: string;
				width: 1536;
			};
		};
	};
}, ...{
	id: string;
	regular: {
		title: string;
		shortDescription: string;
		fullDescription: Record<PropertyKey, any>;
	};
	upsideDown: {
		title: string;
		shortDescription: string;
		fullDescription: Record<PropertyKey, any>;
	};
	image: {
		dimentions: NonNullable<[width: number, height: number] | null>;
		srcSet: {
			placeholder: {
				src: string;
				width: 30;
			};
			'2xs': {
				src: string;
				width: 100;
			};
			xs: {
				src: string;
				width: 300;
			};
			sm: {
				src: string;
				width: 640;
			};
			md: {
				src: string;
				width: 768;
			};
			lg: {
				src: string;
				width: 1024;
			};
			xl: {
				src: string;
				width: 1280;
			};
			'2xl': {
				src: string;
				width: 1536;
			};
		};
	};
}[]]

export type GetCardByIdData = {
	id: string;
	regular: {
		title: string;
		shortDescription: string;
		fullDescription: Record<PropertyKey, any>;
	};
	upsideDown: {
		title: string;
		shortDescription: string;
		fullDescription: Record<PropertyKey, any>;
	};
	image: {
		dimentions: NonNullable<[width: number, height: number] | null>;
		srcSet: {
			placeholder: {
				src: string;
				width: 30;
			};
			'2xs': {
				src: string;
				width: 100;
			};
			xs: {
				src: string;
				width: 300;
			};
			sm: {
				src: string;
				width: 640;
			};
			md: {
				src: string;
				width: 768;
			};
			lg: {
				src: string;
				width: 1024;
			};
			xl: {
				src: string;
				width: 1280;
			};
			'2xl': {
				src: string;
				width: 1536;
			};
		};
	};
}

export type PrevPickedCards = Array<{
	id: string,
	upsideDown: boolean
}>

export type GetRandomCardInput = {
	method: 'POST',
	path: [language: string],
	body: { prevPickedCards: PrevPickedCards }
}

export type GetRandomCardData = {
	id: string;
	regular: {
		title: string;
		shortDescription: string;
		fullDescription: Record<PropertyKey, any>;
	};
	upsideDown: {
		title: string;
		shortDescription: string;
		fullDescription: Record<PropertyKey, any>;
	};
	image: {
		dimentions: NonNullable<[width: number, height: number] | null>;
		srcSet: {
			placeholder: {
				src: string;
				width: 30;
			};
			'2xs': {
				src: string;
				width: 100;
			};
			xs: {
				src: string;
				width: 300;
			};
			sm: {
				src: string;
				width: 640;
			};
			md: {
				src: string;
				width: 768;
			};
			lg: {
				src: string;
				width: 1024;
			};
			xl: {
				src: string;
				width: 1280;
			};
			'2xl': {
				src: string;
				width: 1536;
			};
		};
	};
}
