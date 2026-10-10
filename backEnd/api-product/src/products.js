const shopifyImages = (colorCode, colorName, straightImageId) => [
  {
    url: `https://cdn.shopify.com/s/files/1/0404/1101/files/MW75${colorCode}_TUMI_800x800_Hero.png?v=1769444695`,
    alt: `Floating ${colorName.toLowerCase()} TUMI MW75 Active Noise-Cancelling Headphones — hero`,
  },
  {
    url: `https://cdn.shopify.com/s/files/1/0404/1101/files/MW75${colorCode}_TUMI_800x800_Front.png?v=1769444695`,
    alt: `${colorName} TUMI MW75 headphones — front view`,
  },
  {
    url: `https://cdn.shopify.com/s/files/1/0404/1101/files/MW75${colorCode}_TUMI_800x800_Engraving.png?v=1769444695`,
    alt: `${colorName} TUMI MW75 — TUMI engraving detail`,
  },
  {
    url: `https://cdn.shopify.com/s/files/1/0404/1101/files/MW75${colorCode}_TUMI_800x800_Straight_${straightImageId}.png?v=${colorCode === "B" ? "1769444695" : "1769444571"}`,
    alt: `${colorName} TUMI MW75 — straight on view`,
  },
];

const colors = [
  {
    name: "Black",
    stock: 3,
    images: shopifyImages("B", "Black", "8b6fd9c0-e214-42cd-b617-eac997922263"),
  },
  {
    name: "Silver",
    stock: 1,
    images: shopifyImages(
      "S",
      "Silver",
      "f01c8c31-58db-4162-a823-25764eae06d7",
    ),
  },
];

export const products = [
  {
    id: 1,
    name: "MW75 TUMI",
    subtitle: "Active Noise-Cancelling Wireless Headphones",
    price: 750,
    currency: "USD",
    image: colors[0].images[0].url,
    variants: {
      color: colors.map(({ name }) => name),
      quantity: colors[0].stock,
      colorOptions: colors,
    },
    description:
      "A collection of active noise-cancelling sound tools created in partnership with TUMI — built to enhance any journey. Featuring TUMI's iconic 19 Degree design details with 40mm Beryllium drivers and Adaptive ANC for up to 32 hours of listening.",
  },
];
