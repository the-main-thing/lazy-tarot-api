type Card = {
    _id: string;
    title: {
        _key: string;
        value: string;
    }[];
    regular: {
        title: {
            _key: string;
            value: string;
        }[];
        description: {
            fullDescription: {
                _key: string;
                value: {
                    _type: string;
                    _key?: string | undefined;
                    children: {
                        _key: string;
                        _type: string;
                        text: string;
                        marks: string[];
                    }[];
                    markDefs?: {
                        _type: string;
                        _key: string;
                    }[] | undefined;
                    style?: string | undefined;
                    listItem?: string | undefined;
                    level?: number | undefined;
                }[];
            }[];
            shortDescription: {
                _key: string;
                value: string;
            }[];
        };
    };
    upsideDown: {
        title: {
            _key: string;
            value: string;
        }[];
        description: {
            fullDescription: {
                _key: string;
                value: {
                    _type: string;
                    _key?: string | undefined;
                    children: {
                        _key: string;
                        _type: string;
                        text: string;
                        marks: string[];
                    }[];
                    markDefs?: {
                        _type: string;
                        _key: string;
                    }[] | undefined;
                    style?: string | undefined;
                    listItem?: string | undefined;
                    level?: number | undefined;
                }[];
            }[];
            shortDescription: {
                _key: string;
                value: string;
            }[];
        };
    };
    image: {
        asset: {
            _ref: string;
        };
    };
};
/* ==== */
type Image = {
    asset: {
        _ref: string;
    };
};
/* ==== */
type I18n = {
    _key: string;
    value: string;
}[];
/* ==== */
type I18nBlock = {
    _key: string;
    value: {
        _type: string;
        _key?: string | undefined;
        children: {
            _key: string;
            _type: string;
            text: string;
            marks: string[];
        }[];
        markDefs?: {
            _type: string;
            _key: string;
        }[] | undefined;
        style?: string | undefined;
        listItem?: string | undefined;
        level?: number | undefined;
    }[];
}[];