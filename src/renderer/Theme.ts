
type Theme = {
    colors?: {
        colorBackground?: string;
        colorMain?: string;
        colorBtnSecondary?: string;

        statusGreen?: string;
        statusRed?: string;
        statusRedRgb?: string; // "r, g, b"

        popup?: string;
        onPopup?: string;

        sliderBg?: string;
        slider?: string;

        primary50?: string;
        primary50Hover?: string;

        primary500Base?: string;
        primary500BaseRgb?: string; // "r, g, b"
        onPrimary500Base?: string;

        primary800?: string;
        primary800Hover?: string;
        onPrimary800?: string;

        secondary50?: string;
        onSecondary50?: string;

        secondary100?: string;
        onSecondary100?: string;
        secondary300?: string;

        secondary500Base?: string;
        secondary600?: string;

        secondary700?: string;
        secondary700Hover?: string;

        secondary800?: string;
        secondary800Hover?: string;
        onSecondary800?: string;
    };
    fonts?: {
        default?: {
            family?: string;
            size?: string;
            lineHeight?: string;
            style?: string;
            weight?: string;
        };
        sizeMedium?: string;
        sizeSmall?: string;
        faces?: Array<{
            src: string;
            family?: string;
            format?: string;
            weight?: string;
            style?: string;
        }>;
    };
    radius?: {
        default?: string;
        popup?: string;
    };
    assets?: {
        logo?: string;
    };
};


function setVar(name: string, value?: string) {
    if (value != null && value !== "")
        document.documentElement.style.setProperty(name, value);
}

function applyThemeVars(theme: Theme) {
    const c = theme.colors ?? {};
    setVar("--color-background", c.colorBackground);
    setVar("--color-main", c.colorMain);
    setVar("--color-btn-secondary", c.colorBtnSecondary);

    setVar("--color-status-green", c.statusGreen);
    setVar("--color-status-red", c.statusRed);
    setVar("--color-status-red-rgb", c.statusRedRgb);

    setVar("--color-popup", c.popup);
    setVar("--color-on-popup", c.onPopup);

    setVar("--color-slider-bg", c.sliderBg);
    setVar("--color-slider", c.slider);

    setVar("--color-primary-50", c.primary50);
    setVar("--color-primary-50-hover", c.primary50Hover);

    setVar("--color-primary-500-base", c.primary500Base);
    setVar("--color-primary-500-base-rgb", c.primary500BaseRgb);
    setVar("--color-on-primary-500-base", c.onPrimary500Base);

    setVar("--color-primary-800", c.primary800);
    setVar("--color-primary-800-hover", c.primary800Hover);
    setVar("--color-on-primary-800", c.onPrimary800);

    setVar("--color-secondary-50", c.secondary50);
    setVar("--color-on-secondary-50", c.onSecondary50);

    setVar("--color-secondary-100", c.secondary100);
    setVar("--color-on-secondary-100", c.onSecondary100);
    setVar("--color-secondary-300", c.secondary300);

    setVar("--color-secondary-500-base", c.secondary500Base);
    setVar("--color-secondary-600", c.secondary600);

    setVar("--color-secondary-700", c.secondary700);
    setVar("--color-secondary-700-hover", c.secondary700Hover);

    setVar("--color-secondary-800", c.secondary800);
    setVar("--color-secondary-800-hover", c.secondary800Hover);
    setVar("--color-on-secondary-800", c.onSecondary800);

    const f = theme.fonts ?? {};
    setVar("--font-family-default", f.default?.family);
    setVar("--font-size-default", f.default?.size);
    setVar("--line-height-default", f.default?.lineHeight);
    setVar("--font-style-default", f.default?.style);
    setVar("--font-weight-default", f.default?.weight);

    setVar("--font-size-medium", f.sizeMedium);
    setVar("--font-size-small", f.sizeSmall);

    const r = theme.radius ?? {};
    setVar("--radius-default", r.default);
    setVar("--radius-popup", r.popup);

    const a = theme.assets ?? {};
    setVar("--logo-path", a.logo);
}

async function loadFontFaces(fonts?: Theme["fonts"]) {
    if (!fonts?.faces || fonts.faces.length === 0) return;

    // Load each face via FontFace API
    const loads = fonts.faces.map(async (face) => {
        try {
            // Resolve the URL relative to the current document (works with file://)
            const url = new URL(face.src, window.location.href).toString();
            const src = face.format ? `url("${url}") format("${face.format}")` : `url("${url}")`;
            const ff = new FontFace(face.family ?? "ThemedFont", src, {
                weight: face.weight ?? "normal",
                style: face.style ?? "normal"
            });
            const loaded = await ff.load();
            document.fonts.add(loaded);
        } catch (e) {
            // Ignore individual font load failures; baseline CSS remains
            console.warn("Failed to load font face:", face.src, e);
        }
    });

    await Promise.all(loads);
}

export async function loadTheme() {

    try {
        const res = await fetch("daten/theme/theme.json", { cache: "no-store" });
        if (!res.ok) return; // keep CSS defaults
        const json = (await res.json()) as Theme;

        // Apply variables first so text size/line-height update early
        applyThemeVars(json);

        // Then load and register font faces (non-blocking for initial render)
        await loadFontFaces(json.fonts).catch(() => {});
    } catch {
        console.warn("Failed to load theme, use default-css-values in main.css");
    }
}