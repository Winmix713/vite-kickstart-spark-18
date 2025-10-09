// Property configuration types
export interface PropertyConfig {
  key: string;
  label?: string;
  type: "text" | "number" | "select" | "color" | "checkbox";
  options?: string[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

// Központi konfiguráció az összes property csoporthoz
export const PROPERTY_GROUPS = {
  dimensions: {
    title: "Dimensions",
    properties: [
      {
        key: "width",
        label: "Width",
        type: "text",
        placeholder: "auto",
      },
      {
        key: "height",
        label: "Height",
        type: "text",
        placeholder: "auto",
      },
      {
        key: "minWidth",
        label: "Min Width",
        type: "text",
        placeholder: "0px",
      },
      {
        key: "minHeight",
        label: "Min Height",
        type: "text",
        placeholder: "0px",
      },
      {
        key: "maxWidth",
        label: "Max Width",
        type: "text",
        placeholder: "none",
      },
      {
        key: "maxHeight",
        label: "Max Height",
        type: "text",
        placeholder: "none",
      },
    ] as PropertyConfig[],
  },

  spacing: {
    title: "Spacing",
    properties: [
      {
        key: "padding",
        label: "Padding",
        type: "text",
        placeholder: "0px",
      },
      {
        key: "paddingTop",
        label: "Padding Top",
        type: "text",
        placeholder: "0px",
      },
      {
        key: "paddingRight",
        label: "Padding Right",
        type: "text",
        placeholder: "0px",
      },
      {
        key: "paddingBottom",
        label: "Padding Bottom",
        type: "text",
        placeholder: "0px",
      },
      {
        key: "paddingLeft",
        label: "Padding Left",
        type: "text",
        placeholder: "0px",
      },
      {
        key: "margin",
        label: "Margin",
        type: "text",
        placeholder: "0px",
      },
      {
        key: "marginTop",
        label: "Margin Top",
        type: "text",
        placeholder: "0px",
      },
      {
        key: "marginRight",
        label: "Margin Right",
        type: "text",
        placeholder: "0px",
      },
      {
        key: "marginBottom",
        label: "Margin Bottom",
        type: "text",
        placeholder: "0px",
      },
      {
        key: "marginLeft",
        label: "Margin Left",
        type: "text",
        placeholder: "0px",
      },
    ] as PropertyConfig[],
  },

  layout: {
    title: "Layout",
    properties: [
      {
        key: "display",
        label: "Display",
        type: "select",
        options: ["block", "inline", "inline-block", "flex", "grid", "none"],
        placeholder: "Select display",
      },
      {
        key: "position",
        label: "Position",
        type: "select",
        options: ["static", "relative", "absolute", "fixed", "sticky"],
        placeholder: "Select position",
      },
      {
        key: "top",
        label: "Top",
        type: "text",
        placeholder: "auto",
      },
      {
        key: "right",
        label: "Right",
        type: "text",
        placeholder: "auto",
      },
      {
        key: "bottom",
        label: "Bottom",
        type: "text",
        placeholder: "auto",
      },
      {
        key: "left",
        label: "Left",
        type: "text",
        placeholder: "auto",
      },
      {
        key: "zIndex",
        label: "Z-Index",
        type: "number",
        placeholder: "auto",
      },
    ] as PropertyConfig[],
  },

  flexbox: {
    title: "Flexbox",
    properties: [
      {
        key: "flexDirection",
        label: "Flex Direction",
        type: "select",
        options: ["row", "row-reverse", "column", "column-reverse"],
      },
      {
        key: "justifyContent",
        label: "Justify Content",
        type: "select",
        options: [
          "flex-start",
          "flex-end",
          "center",
          "space-between",
          "space-around",
          "space-evenly",
        ],
      },
      {
        key: "alignItems",
        label: "Align Items",
        type: "select",
        options: ["stretch", "flex-start", "flex-end", "center", "baseline"],
      },
      {
        key: "alignContent",
        label: "Align Content",
        type: "select",
        options: [
          "stretch",
          "flex-start",
          "flex-end",
          "center",
          "space-between",
          "space-around",
        ],
      },
      {
        key: "gap",
        label: "Gap",
        type: "text",
        placeholder: "0px",
      },
      {
        key: "flexWrap",
        label: "Flex Wrap",
        type: "select",
        options: ["nowrap", "wrap", "wrap-reverse"],
      },
      {
        key: "flex",
        label: "Flex",
        type: "text",
        placeholder: "0 1 auto",
      },
      {
        key: "flexGrow",
        label: "Flex Grow",
        type: "number",
        placeholder: "0",
      },
      {
        key: "flexShrink",
        label: "Flex Shrink",
        type: "number",
        placeholder: "1",
      },
      {
        key: "flexBasis",
        label: "Flex Basis",
        type: "text",
        placeholder: "auto",
      },
    ] as PropertyConfig[],
  },

  grid: {
    title: "Grid",
    properties: [
      {
        key: "gridTemplateColumns",
        label: "Template Columns",
        type: "text",
        placeholder: "none",
      },
      {
        key: "gridTemplateRows",
        label: "Template Rows",
        type: "text",
        placeholder: "none",
      },
      {
        key: "gridGap",
        label: "Grid Gap",
        type: "text",
        placeholder: "0px",
      },
      {
        key: "gridColumnGap",
        label: "Column Gap",
        type: "text",
        placeholder: "0px",
      },
      {
        key: "gridRowGap",
        label: "Row Gap",
        type: "text",
        placeholder: "0px",
      },
      {
        key: "gridAutoFlow",
        label: "Auto Flow",
        type: "select",
        options: ["row", "column", "dense", "row dense", "column dense"],
      },
    ] as PropertyConfig[],
  },

  colors: {
    title: "Colors",
    properties: [
      {
        key: "color",
        label: "Text Color",
        type: "color",
      },
      {
        key: "backgroundColor",
        label: "Background",
        type: "color",
      },
    ] as PropertyConfig[],
  },

  typography: {
    title: "Typography",
    properties: [
      {
        key: "fontSize",
        label: "Font Size",
        type: "text",
        placeholder: "16px",
      },
      {
        key: "fontWeight",
        label: "Font Weight",
        type: "select",
        options: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
      },
      {
        key: "fontFamily",
        label: "Font Family",
        type: "text",
        placeholder: "inherit",
      },
      {
        key: "lineHeight",
        label: "Line Height",
        type: "text",
        placeholder: "normal",
      },
      {
        key: "letterSpacing",
        label: "Letter Spacing",
        type: "text",
        placeholder: "normal",
      },
      {
        key: "textAlign",
        label: "Text Align",
        type: "select",
        options: ["left", "center", "right", "justify"],
      },
      {
        key: "textTransform",
        label: "Text Transform",
        type: "select",
        options: ["none", "uppercase", "lowercase", "capitalize"],
      },
      {
        key: "textDecoration",
        label: "Text Decoration",
        type: "select",
        options: ["none", "underline", "overline", "line-through"],
      },
      {
        key: "whiteSpace",
        label: "White Space",
        type: "select",
        options: ["normal", "nowrap", "pre", "pre-wrap", "pre-line"],
      },
    ] as PropertyConfig[],
  },

  border: {
    title: "Border",
    properties: [
      {
        key: "borderWidth",
        label: "Border Width",
        type: "text",
        placeholder: "0px",
      },
      {
        key: "borderStyle",
        label: "Border Style",
        type: "select",
        options: ["none", "solid", "dashed", "dotted", "double", "groove", "ridge", "inset", "outset"],
      },
      {
        key: "borderColor",
        label: "Border Color",
        type: "color",
      },
      {
        key: "borderRadius",
        label: "Border Radius",
        type: "text",
        placeholder: "0px",
      },
      {
        key: "borderTopWidth",
        label: "Top Width",
        type: "text",
        placeholder: "0px",
      },
      {
        key: "borderRightWidth",
        label: "Right Width",
        type: "text",
        placeholder: "0px",
      },
      {
        key: "borderBottomWidth",
        label: "Bottom Width",
        type: "text",
        placeholder: "0px",
      },
      {
        key: "borderLeftWidth",
        label: "Left Width",
        type: "text",
        placeholder: "0px",
      },
    ] as PropertyConfig[],
  },

  effects: {
    title: "Effects",
    properties: [
      {
        key: "opacity",
        label: "Opacity",
        type: "number",
        placeholder: "1",
      },
      {
        key: "boxShadow",
        label: "Box Shadow",
        type: "text",
        placeholder: "none",
      },
      {
        key: "textShadow",
        label: "Text Shadow",
        type: "text",
        placeholder: "none",
      },
      {
        key: "filter",
        label: "Filter",
        type: "text",
        placeholder: "none",
      },
      {
        key: "backdropFilter",
        label: "Backdrop Filter",
        type: "text",
        placeholder: "none",
      },
    ] as PropertyConfig[],
  },

  transform: {
    title: "Transform",
    properties: [
      {
        key: "transform",
        label: "Transform",
        type: "text",
        placeholder: "none",
      },
      {
        key: "transformOrigin",
        label: "Transform Origin",
        type: "text",
        placeholder: "50% 50%",
      },
      {
        key: "rotate",
        label: "Rotate",
        type: "text",
        placeholder: "0deg",
      },
      {
        key: "scale",
        label: "Scale",
        type: "text",
        placeholder: "1",
      },
      {
        key: "translateX",
        label: "Translate X",
        type: "text",
        placeholder: "0px",
      },
      {
        key: "translateY",
        label: "Translate Y",
        type: "text",
        placeholder: "0px",
      },
    ] as PropertyConfig[],
  },

  overflow: {
    title: "Overflow",
    properties: [
      {
        key: "overflow",
        label: "Overflow",
        type: "select",
        options: ["visible", "hidden", "scroll", "auto"],
      },
      {
        key: "overflowX",
        label: "Overflow X",
        type: "select",
        options: ["visible", "hidden", "scroll", "auto"],
      },
      {
        key: "overflowY",
        label: "Overflow Y",
        type: "select",
        options: ["visible", "hidden", "scroll", "auto"],
      },
    ] as PropertyConfig[],
  },

  background: {
    title: "Background",
    properties: [
      {
        key: "backgroundImage",
        label: "Background Image",
        type: "text",
        placeholder: "none",
      },
      {
        key: "backgroundSize",
        label: "Background Size",
        type: "select",
        options: ["auto", "cover", "contain"],
      },
      {
        key: "backgroundPosition",
        label: "Background Position",
        type: "text",
        placeholder: "0% 0%",
      },
      {
        key: "backgroundRepeat",
        label: "Background Repeat",
        type: "select",
        options: ["repeat", "repeat-x", "repeat-y", "no-repeat"],
      },
      {
        key: "backgroundAttachment",
        label: "Background Attachment",
        type: "select",
        options: ["scroll", "fixed", "local"],
      },
    ] as PropertyConfig[],
  },
} as const;

// Helper függvény: kategóriák display alapján
export const getRelevantGroups = (display?: string) => {
  const baseGroups = ["dimensions", "spacing", "layout", "colors", "typography", "border", "effects", "overflow", "background"];
  
  if (display === "flex") {
    return [...baseGroups, "flexbox"];
  }
  
  if (display === "grid") {
    return [...baseGroups, "grid"];
  }
  
  return baseGroups;
};

// Helper függvény: property érték lekérése computed style-ból
export const getComputedProperty = (element: HTMLElement, key: string): string => {
  const computed = window.getComputedStyle(element);
  return (computed as any)[key] || "";
};

// Helper függvény: összes property érték lekérése egy csoportból
export const getGroupValues = (element: HTMLElement, groupKey: keyof typeof PROPERTY_GROUPS) => {
  const group = PROPERTY_GROUPS[groupKey];
  const values: Record<string, string> = {};
  
  group.properties.forEach((prop) => {
    values[prop.key] = getComputedProperty(element, prop.key);
  });
  
  return values;
};
