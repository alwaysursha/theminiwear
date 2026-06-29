import { PrismaPg } from "@prisma/adapter-pg";
import {
  DiscountType,
  Gender,
  InquiryStatus,
  OrderStatus,
  PrismaClient,
  ReturnStatus,
  ReviewStatus,
  Role,
  ShipmentStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { subDays, subHours } from "date-fns";
import { Pool } from "pg";
import "dotenv/config";
import { seedImages } from "./seed-images";
import {
  defaultHero,
  defaultHomepageSections,
  defaultSitePages,
} from "../src/lib/cms/defaults";
import {
  resolveProductCategorySlug,
  SHOP_CATEGORY_SEED_DATA,
} from "../src/lib/shop-categories";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PASSWORD = "password123";

function orderNumber(n: number) {
  return `TM-${String(n).padStart(5, "0")}`;
}

async function clearDatabase() {
  await prisma.inquiryMessage.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.productReview.deleteMany();
  await prisma.returnRequest.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.customerNote.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.shippingRate.deleteMany();
  await prisma.shippingZone.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.storeSetting.deleteMany();
  await prisma.sitePage.deleteMany();
  await prisma.homepageSectionConfig.deleteMany();
  await prisma.heroSettings.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  console.log("Clearing existing data...");
  await clearDatabase();

  const hashed = await bcrypt.hash(PASSWORD, 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin@theminiwear.com",
      name: "Sarah Chen",
      password: hashed,
      role: Role.ADMIN,
      phone: "+1 555-0100",
    },
  });

  const orderManager = await prisma.user.create({
    data: {
      email: "orders@theminiwear.com",
      name: "Mike Torres",
      password: hashed,
      role: Role.ORDER_MANAGER,
      phone: "+1 555-0101",
    },
  });

  const supportAgent = await prisma.user.create({
    data: {
      email: "support@theminiwear.com",
      name: "Emily Walsh",
      password: hashed,
      role: Role.SUPPORT_AGENT,
      phone: "+1 555-0102",
    },
  });

  const customers = await Promise.all(
    [
      { email: "customer@example.com", name: "Jane Parent", phone: "+1 555-0201" },
      { email: "david.kim@example.com", name: "David Kim", phone: "+1 555-0202" },
      { email: "maria.lopez@example.com", name: "Maria Lopez", phone: "+1 555-0203" },
      { email: "emma.wilson@example.com", name: "Emma Wilson", phone: "+1 555-0204" },
      { email: "james.brown@example.com", name: "James Brown", phone: "+1 555-0205" },
    ].map((c) =>
      prisma.user.create({
        data: { ...c, password: hashed, role: Role.USER },
      }),
    ),
  );

  const [jane, david, maria, emma, james] = customers;

  const categories = await Promise.all(
    SHOP_CATEGORY_SEED_DATA.map((cat) => prisma.category.create({ data: cat })),
  );

  const cat = Object.fromEntries(categories.map((c) => [c.slug, c]));

  const productDefs = [
    {
      name: "Cloud Soft Bodysuit",
      slug: "cloud-soft-bodysuit",
      description: "Ultra-soft organic cotton bodysuit with snap closures. Gentle on sensitive skin.",
      gender: Gender.UNISEX,
      occasion: "Everyday",
      isNewArrival: true,
      isTrending: true,
      trendingScore: 95,
      images: [...seedImages.products.cloudSoftBodysuit],
      variants: [
        { size: "0-3M", color: "Mint", ageGroup: "0-3M", price: 24.99, stock: 50 },
        { size: "3-6M", color: "Mint", ageGroup: "3-6M", price: 24.99, stock: 40 },
        { size: "6-12M", color: "White", ageGroup: "6-12M", price: 24.99, stock: 35 },
      ],
    },
    {
      name: "Floral Dream Dress",
      slug: "floral-dream-dress",
      description: "Twirl-worthy dress with delicate floral print. Perfect for parties and playdates.",
      gender: Gender.GIRLS,
      occasion: "Party",
      isNewArrival: true,
      isTrending: true,
      trendingScore: 88,
      images: [...seedImages.products.floralDreamDress],
      variants: [
        { size: "2T", color: "Pink", ageGroup: "2T", price: 38.99, stock: 25 },
        { size: "3T", color: "Pink", ageGroup: "3T", price: 38.99, stock: 20 },
        { size: "4T", color: "Coral", ageGroup: "4T", price: 38.99, stock: 18 },
      ],
    },
    {
      name: "Cozy Puffer Jacket",
      slug: "cozy-puffer-jacket",
      description: "Lightweight yet warm puffer jacket for chilly adventures. Water-resistant outer shell.",
      gender: Gender.BOYS,
      occasion: "Outdoor",
      isNewArrival: false,
      isTrending: true,
      trendingScore: 91,
      isOnSale: true,
      isClearance: true,
      salePercent: 35,
      images: [...seedImages.products.cozyPufferJacket],
      variants: [
        { size: "4T", color: "Navy", ageGroup: "4T", price: 54.99, stock: 15 },
        { size: "5T", color: "Navy", ageGroup: "5T", price: 54.99, stock: 12 },
        { size: "6", color: "Navy", ageGroup: "6", price: 59.99, stock: 10 },
      ],
    },
    {
      name: "Rainbow Stripe Tee",
      slug: "rainbow-stripe-tee",
      description: "Fun rainbow stripes on breathable cotton. A wardrobe staple for everyday play.",
      gender: Gender.UNISEX,
      occasion: "Everyday",
      isNewArrival: false,
      isTrending: true,
      trendingScore: 82,
      isOnSale: true,
      salePercent: 25,
      images: [...seedImages.products.rainbowStripeTee],
      variants: [
        { size: "2T", color: "Multi", ageGroup: "2T", price: 18.99, stock: 60 },
        { size: "3T", color: "Multi", ageGroup: "3T", price: 18.99, stock: 55 },
        { size: "4T", color: "Multi", ageGroup: "4T", price: 18.99, stock: 50 },
      ],
    },
    {
      name: "Stretch Play Leggings",
      slug: "stretch-play-leggings",
      description: "Flexible leggings that move with active little ones. Tag-free waistband.",
      gender: Gender.GIRLS,
      occasion: "Playtime",
      isNewArrival: true,
      isTrending: false,
      trendingScore: 74,
      isOnSale: true,
      salePercent: 15,
      images: [...seedImages.products.stretchPlayLeggings],
      variants: [
        { size: "3T", color: "Purple", ageGroup: "3T", price: 22.99, stock: 45 },
        { size: "4T", color: "Purple", ageGroup: "4T", price: 22.99, stock: 40 },
        { size: "5T", color: "Navy", ageGroup: "5T", price: 22.99, stock: 38 },
      ],
    },
    {
      name: "Bunny Knit Cardigan",
      slug: "bunny-knit-cardigan",
      description: "Adorable bunny-ear hood cardigan in soft knit. Perfect layering piece.",
      gender: Gender.UNISEX,
      occasion: "Everyday",
      isNewArrival: true,
      isTrending: true,
      trendingScore: 90,
      images: [...seedImages.products.bunnyKnitCardigan],
      variants: [
        { size: "6-12M", color: "Blush", ageGroup: "6-12M", price: 42.99, stock: 22 },
        { size: "12-18M", color: "Blush", ageGroup: "12-18M", price: 42.99, stock: 20 },
        { size: "18-24M", color: "Cream", ageGroup: "18-24M", price: 44.99, stock: 18 },
      ],
    },
    {
      name: "Starlight Pajama Set",
      slug: "starlight-pajama-set",
      description: "Cozy two-piece pajama set with glow-in-the-dark stars. 100% cotton.",
      gender: Gender.UNISEX,
      occasion: "Sleep",
      isNewArrival: false,
      isTrending: true,
      trendingScore: 85,
      images: [...seedImages.products.starlightPajamaSet],
      variants: [
        { size: "2T", color: "Navy", ageGroup: "2T", price: 32.99, stock: 30 },
        { size: "3T", color: "Navy", ageGroup: "3T", price: 32.99, stock: 28 },
        { size: "4T", color: "Navy", ageGroup: "4T", price: 32.99, stock: 25 },
      ],
    },
    {
      name: "Sun Splash Rash Guard",
      slug: "sun-splash-rash-guard",
      description: "UPF 50+ rash guard with fun wave print. Pairs perfectly with our swim trunks.",
      gender: Gender.BOYS,
      occasion: "Swim",
      isNewArrival: true,
      isTrending: false,
      trendingScore: 68,
      images: [...seedImages.products.sunSplashRashGuard],
      variants: [
        { size: "4T", color: "Blue", ageGroup: "4T", price: 28.99, stock: 35 },
        { size: "5T", color: "Blue", ageGroup: "5T", price: 28.99, stock: 32 },
        { size: "6", color: "Teal", ageGroup: "6", price: 29.99, stock: 28 },
      ],
    },
    {
      name: "Little Explorer Overalls",
      slug: "little-explorer-overalls",
      description: "Durable denim-look overalls with adjustable straps. Ready for any adventure.",
      gender: Gender.UNISEX,
      occasion: "Outdoor",
      isNewArrival: false,
      isTrending: true,
      trendingScore: 79,
      images: [...seedImages.products.littleExplorerOveralls],
      variants: [
        { size: "2T", color: "Denim", ageGroup: "2T", price: 36.99, stock: 20 },
        { size: "3T", color: "Denim", ageGroup: "3T", price: 36.99, stock: 18 },
        { size: "4T", color: "Denim", ageGroup: "4T", price: 38.99, stock: 15 },
      ],
    },
    {
      name: "Pastel Party Romper",
      slug: "pastel-party-romper",
      description: "One-piece romper in soft pastels. Snap closures for easy changes.",
      gender: Gender.GIRLS,
      occasion: "Party",
      isNewArrival: true,
      isTrending: true,
      trendingScore: 93,
      images: [...seedImages.products.pastelPartyRomper],
      variants: [
        { size: "0-3M", color: "Lavender", ageGroup: "0-3M", price: 26.99, stock: 40 },
        { size: "3-6M", color: "Peach", ageGroup: "3-6M", price: 26.99, stock: 38 },
        { size: "6-12M", color: "Mint", ageGroup: "6-12M", price: 26.99, stock: 35 },
      ],
    },
    {
      name: "Cozy Sock 3-Pack",
      slug: "cozy-sock-3-pack",
      description: "Three pairs of non-slip grip socks in assorted playful patterns.",
      gender: Gender.UNISEX,
      occasion: "Everyday",
      isNewArrival: false,
      isTrending: false,
      trendingScore: 55,
      images: [...seedImages.products.cozySockPack],
      variants: [
        { size: "0-12M", color: "Multi", ageGroup: "0-12M", price: 14.99, stock: 80 },
        { size: "12-24M", color: "Multi", ageGroup: "12-24M", price: 14.99, stock: 75 },
        { size: "2T-4T", color: "Multi", ageGroup: "2T", price: 14.99, stock: 70 },
      ],
    },
    {
      name: "Dino Roar Hoodie",
      slug: "dino-roar-hoodie",
      description: "Fleece hoodie with 3D dino spikes on the hood. A The Mini Wear favorite.",
      gender: Gender.BOYS,
      occasion: "Everyday",
      isNewArrival: true,
      isTrending: true,
      trendingScore: 97,
      images: [...seedImages.products.dinoRoarHoodie],
      variants: [
        { size: "3T", color: "Green", ageGroup: "3T", price: 34.99, stock: 8 },
        { size: "4T", color: "Green", ageGroup: "4T", price: 34.99, stock: 5 },
        { size: "5T", color: "Green", ageGroup: "5T", price: 36.99, stock: 3 },
      ],
    },
    {
      name: "Mint Meadow Sundress",
      slug: "mint-meadow-sundress",
      description: "Breezy cotton sundress in a soft mint floral. Easy pull-on style for warm days.",
      gender: Gender.GIRLS,
      occasion: "Everyday",
      isNewArrival: false,
      isTrending: false,
      trendingScore: 71,
      isOnSale: true,
      salePercent: 28,
      images: [...seedImages.products.mintMeadowSundress],
      variants: [
        { size: "2T", color: "Mint", ageGroup: "2T", price: 29.99, stock: 28 },
        { size: "3T", color: "Mint", ageGroup: "3T", price: 29.99, stock: 24 },
        { size: "4T", color: "Mint", ageGroup: "4T", price: 31.99, stock: 20 },
      ],
    },
    {
      name: "Cloud Knit Beanie Set",
      slug: "cloud-knit-beanie-set",
      description: "Two-pack ribbed knit beanies with fold-over cuff. Soft stretch for growing heads.",
      gender: Gender.UNISEX,
      occasion: "Everyday",
      isNewArrival: false,
      isTrending: false,
      trendingScore: 63,
      isOnSale: true,
      salePercent: 22,
      images: [...seedImages.products.cloudKnitBeanieSet],
      variants: [
        { size: "0-12M", color: "Cream", ageGroup: "0-12M", price: 19.99, stock: 45 },
        { size: "12-24M", color: "Blush", ageGroup: "12-24M", price: 19.99, stock: 40 },
        { size: "2T-4T", color: "Sky", ageGroup: "2T", price: 21.99, stock: 36 },
      ],
    },
    {
      name: "Peach Pocket Tee",
      slug: "peach-pocket-tee",
      description: "Soft cotton tee with a contrast peach pocket. Easy everyday layer for playdates.",
      gender: Gender.UNISEX,
      occasion: "Everyday",
      isNewArrival: false,
      isTrending: false,
      trendingScore: 68,
      isOnSale: true,
      salePercent: 20,
      images: [...seedImages.products.peachPocketTee],
      variants: [
        { size: "2T", color: "Peach", ageGroup: "2T", price: 17.99, stock: 32 },
        { size: "3T", color: "Peach", ageGroup: "3T", price: 17.99, stock: 30 },
        { size: "4T", color: "White", ageGroup: "4T", price: 18.99, stock: 28 },
      ],
    },
    {
      name: "Mini Fleece Jogger Set",
      slug: "mini-fleece-jogger-set",
      description: "Matching fleece hoodie and joggers with ribbed cuffs. Cozy set for cooler mornings.",
      gender: Gender.UNISEX,
      occasion: "Everyday",
      isNewArrival: false,
      isTrending: false,
      trendingScore: 76,
      isOnSale: true,
      salePercent: 24,
      images: [...seedImages.products.miniFleeceJoggerSet],
      variants: [
        { size: "3T", color: "Heather", ageGroup: "3T", price: 34.99, stock: 22 },
        { size: "4T", color: "Heather", ageGroup: "4T", price: 34.99, stock: 20 },
        { size: "5T", color: "Navy", ageGroup: "5T", price: 36.99, stock: 18 },
      ],
    },
  ];

  const createdProducts: Array<{
    product: Awaited<ReturnType<typeof prisma.product.create>>;
    variants: Awaited<ReturnType<typeof prisma.productVariant.create>>[];
  }> = [];

  for (const def of productDefs) {
    const { images, variants, ...data } = def;
    const categorySlug = resolveProductCategorySlug(
      data.gender,
      variants.map((variant) => variant.ageGroup),
    );
    const product = await prisma.product.create({
      data: {
        ...data,
        categoryId: cat[categorySlug].id,
        images: {
          create: images.map((url, i) => ({
            url,
            alt: def.name,
            sortOrder: i,
          })),
        },
      },
    });

    const createdVariants = await Promise.all(
      variants.map((v) =>
        prisma.productVariant.create({
          data: {
            productId: product.id,
            size: v.size,
            color: v.color,
            ageGroup: v.ageGroup,
            price: v.price,
            salePrice: "salePrice" in v ? (v.salePrice ?? null) : null,
            stock: v.stock,
            sku: `${def.slug}-${v.size}-${v.color}`
              .toUpperCase()
              .replace(/[^A-Z0-9]/g, ""),
          },
        }),
      ),
    );

    createdProducts.push({ product, variants: createdVariants });
  }

  const allVariants = createdProducts.flatMap((p) => p.variants);
  const variant = (slug: string, size: string) => {
    const found = createdProducts
      .find((p) => p.product.slug === slug)
      ?.variants.find((v) => v.size === size);
    if (!found) throw new Error(`Variant not found: ${slug} ${size}`);
    return found;
  };

  const addresses = await Promise.all([
    prisma.address.create({
      data: {
        userId: jane.id,
        label: "Home",
        fullName: "Jane Parent",
        line1: "123 Maple Street",
        line2: "Apt 4B",
        city: "Portland",
        state: "OR",
        postalCode: "97201",
        phone: "+1 555-0201",
        isDefault: true,
      },
    }),
    prisma.address.create({
      data: {
        userId: david.id,
        label: "Home",
        fullName: "David Kim",
        line1: "456 Oak Avenue",
        city: "Austin",
        state: "TX",
        postalCode: "78701",
        isDefault: true,
      },
    }),
    prisma.address.create({
      data: {
        userId: maria.id,
        label: "Home",
        fullName: "Maria Lopez",
        line1: "789 Pine Road",
        city: "Miami",
        state: "FL",
        postalCode: "33101",
        isDefault: true,
      },
    }),
    prisma.address.create({
      data: {
        userId: emma.id,
        label: "Home",
        fullName: "Emma Wilson",
        line1: "321 Birch Lane",
        city: "Seattle",
        state: "WA",
        postalCode: "98101",
        isDefault: true,
      },
    }),
  ]);

  const [janeAddr, davidAddr, mariaAddr, emmaAddr] = addresses;

  const usZone = await prisma.shippingZone.create({
    data: {
      id: "zone-us",
      name: "United States",
      countries: ["US"],
      rates: {
        create: [
          {
            name: "Standard Shipping",
            price: 5.99,
            estimatedDays: "5-7 business days",
          },
          {
            name: "Express Shipping",
            price: 12.99,
            estimatedDays: "2-3 business days",
          },
          {
            name: "Free Shipping",
            price: 0,
            minOrder: 75,
            estimatedDays: "5-7 business days",
          },
        ],
      },
    },
  });

  await prisma.shippingZone.create({
    data: {
      id: "zone-ca",
      name: "Canada",
      countries: ["CA"],
      rates: {
        create: [
          {
            name: "Standard International",
            price: 14.99,
            estimatedDays: "7-14 business days",
          },
        ],
      },
    },
  });

  const welcomeDiscount = await prisma.discount.create({
    data: {
      code: "WELCOME10",
      type: DiscountType.PERCENTAGE,
      value: 10,
      maxUses: 1000,
      usedCount: 47,
      isActive: true,
      expiresAt: subDays(new Date(), -90),
    },
  });

  const summerDiscount = await prisma.discount.create({
    data: {
      code: "SUMMER20",
      type: DiscountType.PERCENTAGE,
      value: 20,
      minOrderAmount: 50,
      maxUses: 500,
      usedCount: 12,
      isActive: true,
      expiresAt: subDays(new Date(), -60),
    },
  });

  await prisma.discount.create({
    data: {
      code: "FREESHIP",
      type: DiscountType.FREE_SHIPPING,
      value: 0,
      maxUses: 200,
      usedCount: 8,
      isActive: true,
    },
  });

  await prisma.discount.create({
    data: {
      code: "FLAT15",
      type: DiscountType.FIXED,
      value: 15,
      minOrderAmount: 40,
      maxUses: 100,
      usedCount: 23,
      isActive: true,
      expiresAt: subDays(new Date(), -30),
    },
  });

  await prisma.discount.create({
    data: {
      code: "EXPIRED50",
      type: DiscountType.PERCENTAGE,
      value: 50,
      isActive: false,
      expiresAt: subDays(new Date(), 30),
    },
  });

  type OrderSeed = {
    userId: string;
    addressId: string;
    status: OrderStatus;
    items: { variantId: string; quantity: number; price: number }[];
    shippingCost: number;
    discountAmount?: number;
    discountId?: string;
    daysAgo: number;
    shipment?: {
      carrier: string;
      trackingNumber: string;
      status: ShipmentStatus;
      shippedDaysAgo?: number;
      deliveredDaysAgo?: number;
    };
    returnRequest?: { reason: string; status: ReturnStatus };
    history: { status: OrderStatus; note?: string; hoursAgo: number }[];
  };

  const orderSeeds: OrderSeed[] = [
    {
      userId: jane.id,
      addressId: janeAddr.id,
      status: OrderStatus.DELIVERED,
      items: [
        {
          variantId: variant("cloud-soft-bodysuit", "0-3M").id,
          quantity: 2,
          price: 24.99,
        },
        {
          variantId: variant("floral-dream-dress", "2T").id,
          quantity: 1,
          price: 38.99,
        },
      ],
      shippingCost: 5.99,
      discountAmount: 8.9,
      discountId: welcomeDiscount.id,
      daysAgo: 14,
      shipment: {
        carrier: "USPS",
        trackingNumber: "9400111899223456789012",
        status: ShipmentStatus.DELIVERED,
        shippedDaysAgo: 12,
        deliveredDaysAgo: 8,
      },
      history: [
        { status: OrderStatus.PAID, note: "Payment received", hoursAgo: 14 * 24 },
        { status: OrderStatus.PROCESSING, note: "Packing order", hoursAgo: 13 * 24 },
        { status: OrderStatus.SHIPPED, note: "Shipped via USPS", hoursAgo: 12 * 24 },
        { status: OrderStatus.DELIVERED, note: "Delivered to mailbox", hoursAgo: 8 * 24 },
      ],
    },
    {
      userId: david.id,
      addressId: davidAddr.id,
      status: OrderStatus.SHIPPED,
      items: [
        {
          variantId: variant("cozy-puffer-jacket", "4T").id,
          quantity: 1,
          price: 54.99,
        },
      ],
      shippingCost: 12.99,
      daysAgo: 3,
      shipment: {
        carrier: "FedEx",
        trackingNumber: "794612345678",
        status: ShipmentStatus.IN_TRANSIT,
        shippedDaysAgo: 1,
      },
      history: [
        { status: OrderStatus.PAID, hoursAgo: 3 * 24 },
        { status: OrderStatus.PROCESSING, hoursAgo: 2 * 24 },
        { status: OrderStatus.SHIPPED, note: "FedEx pickup", hoursAgo: 24 },
      ],
    },
    {
      userId: maria.id,
      addressId: mariaAddr.id,
      status: OrderStatus.PROCESSING,
      items: [
        {
          variantId: variant("dino-roar-hoodie", "4T").id,
          quantity: 1,
          price: 34.99,
        },
        {
          variantId: variant("stretch-play-leggings", "3T").id,
          quantity: 2,
          price: 22.99,
        },
      ],
      shippingCost: 5.99,
      daysAgo: 1,
      history: [
        { status: OrderStatus.PAID, hoursAgo: 24 },
        { status: OrderStatus.PROCESSING, note: "Awaiting pick", hoursAgo: 12 },
      ],
    },
    {
      userId: emma.id,
      addressId: emmaAddr.id,
      status: OrderStatus.DELIVERED,
      items: [
        {
          variantId: variant("starlight-pajama-set", "3T").id,
          quantity: 1,
          price: 32.99,
        },
      ],
      shippingCost: 5.99,
      daysAgo: 21,
      shipment: {
        carrier: "UPS",
        trackingNumber: "1Z999AA10123456784",
        status: ShipmentStatus.DELIVERED,
        shippedDaysAgo: 19,
        deliveredDaysAgo: 16,
      },
      returnRequest: {
        reason: "Ordered wrong size — need 4T instead of 3T.",
        status: ReturnStatus.REQUESTED,
      },
      history: [
        { status: OrderStatus.PAID, hoursAgo: 21 * 24 },
        { status: OrderStatus.PROCESSING, hoursAgo: 20 * 24 },
        { status: OrderStatus.SHIPPED, hoursAgo: 19 * 24 },
        { status: OrderStatus.DELIVERED, hoursAgo: 16 * 24 },
      ],
    },
    {
      userId: jane.id,
      addressId: janeAddr.id,
      status: OrderStatus.PAID,
      items: [
        {
          variantId: variant("pastel-party-romper", "3-6M").id,
          quantity: 1,
          price: 26.99,
        },
      ],
      shippingCost: 5.99,
      daysAgo: 0,
      history: [{ status: OrderStatus.PAID, note: "Stripe checkout", hoursAgo: 2 }],
    },
    {
      userId: james.id,
      addressId: janeAddr.id,
      status: OrderStatus.CANCELLED,
      items: [
        {
          variantId: variant("rainbow-stripe-tee", "4T").id,
          quantity: 3,
          price: 18.99,
        },
      ],
      shippingCost: 5.99,
      daysAgo: 7,
      history: [
        { status: OrderStatus.PENDING, hoursAgo: 7 * 24 },
        { status: OrderStatus.CANCELLED, note: "Customer requested cancel", hoursAgo: 6 * 24 },
      ],
    },
    {
      userId: david.id,
      addressId: davidAddr.id,
      status: OrderStatus.REFUNDED,
      items: [
        {
          variantId: variant("bunny-knit-cardigan", "12-18M").id,
          quantity: 1,
          price: 42.99,
        },
      ],
      shippingCost: 5.99,
      daysAgo: 30,
      history: [
        { status: OrderStatus.PAID, hoursAgo: 30 * 24 },
        { status: OrderStatus.DELIVERED, hoursAgo: 24 * 24 },
        { status: OrderStatus.REFUNDED, note: "Defective item — full refund", hoursAgo: 20 * 24 },
      ],
    },
  ];

  for (let i = 0; i < orderSeeds.length; i++) {
    const seed = orderSeeds[i];
    const subtotal = seed.items.reduce((s, item) => s + item.price * item.quantity, 0);
    const discountAmount = seed.discountAmount ?? 0;
    const total = subtotal + seed.shippingCost - discountAmount;

    const order = await prisma.order.create({
      data: {
        orderNumber: orderNumber(i + 1),
        userId: seed.userId,
        addressId: seed.addressId,
        status: seed.status,
        subtotal,
        shippingCost: seed.shippingCost,
        discountAmount,
        discountId: seed.discountId,
        taxAmount: 0,
        total,
        stripePaymentId: `pi_mock_${i + 1}`,
        createdAt: subDays(new Date(), seed.daysAgo),
        items: {
          create: seed.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
        statusHistory: {
          create: seed.history.map((h) => ({
            status: h.status,
            note: h.note,
            createdAt: subHours(new Date(), h.hoursAgo),
          })),
        },
        ...(seed.shipment && {
          shipment: {
            create: {
              carrier: seed.shipment.carrier,
              trackingNumber: seed.shipment.trackingNumber,
              status: seed.shipment.status,
              shippedAt: seed.shipment.shippedDaysAgo
                ? subDays(new Date(), seed.shipment.shippedDaysAgo)
                : null,
              deliveredAt: seed.shipment.deliveredDaysAgo
                ? subDays(new Date(), seed.shipment.deliveredDaysAgo)
                : null,
            },
          },
        }),
        ...(seed.returnRequest && {
          returnRequest: {
            create: seed.returnRequest,
          },
        }),
      },
    });
    void order;
  }

  const guestOrder = await prisma.order.create({
    data: {
      orderNumber: orderNumber(99),
      guestEmail: "guest.shopper@example.com",
      status: OrderStatus.DELIVERED,
      subtotal: 28.99,
      shippingCost: 5.99,
      discountAmount: 0,
      taxAmount: 0,
      total: 34.98,
      createdAt: subDays(new Date(), 10),
      items: {
        create: [
          {
            variantId: variant("sun-splash-rash-guard", "4T").id,
            quantity: 1,
            price: 28.99,
          },
        ],
      },
      statusHistory: {
        create: [
          { status: OrderStatus.PAID, createdAt: subDays(new Date(), 10) },
          { status: OrderStatus.SHIPPED, createdAt: subDays(new Date(), 8) },
          { status: OrderStatus.DELIVERED, createdAt: subDays(new Date(), 5) },
        ],
      },
      shipment: {
        create: {
          carrier: "USPS",
          trackingNumber: "9400111899223999888777",
          status: ShipmentStatus.DELIVERED,
          shippedAt: subDays(new Date(), 8),
          deliveredAt: subDays(new Date(), 5),
        },
      },
    },
  });
  void guestOrder;

  const janeCart = await prisma.cart.create({
    data: { userId: jane.id },
  });

  await prisma.cartItem.createMany({
    data: [
      {
        cartId: janeCart.id,
        variantId: variant("dino-roar-hoodie", "3T").id,
        quantity: 1,
      },
      {
        cartId: janeCart.id,
        variantId: variant("cozy-sock-3-pack", "2T-4T").id,
        quantity: 2,
      },
    ],
  });

  await prisma.wishlistItem.createMany({
    data: [
      { userId: jane.id, productId: createdProducts[1].product.id },
      { userId: jane.id, productId: createdProducts[5].product.id },
      { userId: david.id, productId: createdProducts[2].product.id },
      { userId: maria.id, productId: createdProducts[9].product.id },
      { userId: emma.id, productId: createdProducts[6].product.id },
    ],
  });

  const inquiry1 = await prisma.inquiry.create({
    data: {
      userId: jane.id,
      subject: "Size guide for bodysuits",
      status: InquiryStatus.RESOLVED,
      assigneeId: supportAgent.id,
      createdAt: subDays(new Date(), 5),
      messages: {
        create: [
          {
            senderId: jane.id,
            isStaff: false,
            content:
              "Hi! My baby is 4 months old and 15 lbs. Which size bodysuit should I order?",
            createdAt: subDays(new Date(), 5),
          },
          {
            senderId: supportAgent.id,
            isStaff: true,
            content:
              "For 4 months and 15 lbs, we'd recommend 3-6M. Our size chart runs true to age. Happy shopping!",
            createdAt: subDays(new Date(), 4),
          },
        ],
      },
    },
  });

  const inquiry2 = await prisma.inquiry.create({
    data: {
      userId: david.id,
      subject: "Order #TM-00002 tracking",
      status: InquiryStatus.IN_PROGRESS,
      assigneeId: supportAgent.id,
      createdAt: subDays(new Date(), 1),
      messages: {
        create: [
          {
            senderId: david.id,
            isStaff: false,
            content: "My jacket order shows shipped but tracking hasn't updated in 2 days.",
            createdAt: subDays(new Date(), 1),
          },
          {
            senderId: supportAgent.id,
            isStaff: true,
            content:
              "Thanks David — I've checked with FedEx. There was a scan delay; it should update tonight.",
            createdAt: subHours(new Date(), 6),
          },
        ],
      },
    },
  });

  await prisma.inquiry.create({
    data: {
      guestEmail: "newmom@example.com",
      guestName: "Lisa Park",
      subject: "Do you ship to Canada?",
      status: InquiryStatus.OPEN,
      createdAt: subHours(new Date(), 3),
      messages: {
        create: [
          {
            isStaff: false,
            content: "Hello, I'm in Toronto. Do you ship to Canada and what are the rates?",
            createdAt: subHours(new Date(), 3),
          },
        ],
      },
    },
  });

  await prisma.inquiry.create({
    data: {
      userId: emma.id,
      subject: "Return for order TM-00004",
      status: InquiryStatus.CLOSED,
      assigneeId: supportAgent.id,
      createdAt: subDays(new Date(), 15),
      messages: {
        create: [
          {
            senderId: emma.id,
            isStaff: false,
            content: "I'd like to return the pajama set — wrong size.",
            createdAt: subDays(new Date(), 15),
          },
          {
            senderId: supportAgent.id,
            isStaff: true,
            content: "Return label sent to your email. Refund in 5-7 days after we receive it.",
            createdAt: subDays(new Date(), 14),
          },
        ],
      },
    },
  });

  void inquiry1;
  void inquiry2;

  await prisma.customerNote.createMany({
    data: [
      {
        customerId: jane.id,
        authorId: admin.id,
        content: "VIP customer — has placed 3+ orders. Send thank-you note with next purchase.",
        tags: ["vip", "repeat-buyer"],
      },
      {
        customerId: david.id,
        authorId: supportAgent.id,
        content: "Called about delayed tracking on TM-00002. FedEx scan delay confirmed.",
        tags: ["support", "shipping"],
      },
      {
        customerId: emma.id,
        authorId: supportAgent.id,
        content: "Return request open for TM-00004. Awaiting package.",
        tags: ["return"],
      },
      {
        customerId: maria.id,
        authorId: orderManager.id,
        content: "Large order potential — mentioned buying for twin nieces.",
        tags: ["sales-lead"],
      },
    ],
  });

  await prisma.storeSetting.createMany({
    data: [
      { key: "site_wide_sale_enabled", value: "false" },
      { key: "site_wide_sale_percent", value: "15" },
    ],
  });

  const janeDeliveredOrder = await prisma.order.findFirst({
    where: { userId: jane.id, status: OrderStatus.DELIVERED },
    include: {
      items: { include: { variant: { include: { product: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const emmaDeliveredOrder = await prisma.order.findFirst({
    where: { userId: emma.id, status: OrderStatus.DELIVERED },
    include: {
      items: { include: { variant: { include: { product: true } } } },
    },
  });

  if (janeDeliveredOrder) {
    const bodysuitItem = janeDeliveredOrder.items.find(
      (item) => item.variant.product.slug === "cloud-soft-bodysuit",
    );
    const dressItem = janeDeliveredOrder.items.find(
      (item) => item.variant.product.slug === "floral-dream-dress",
    );

    if (bodysuitItem) {
      await prisma.productReview.create({
        data: {
          productId: bodysuitItem.variant.productId,
          userId: jane.id,
          orderId: janeDeliveredOrder.id,
          rating: 5,
          title: "So soft and easy for diaper changes",
          body: "We washed this onesie several times and it stayed soft. The snaps are sturdy and the fit is true to size.",
          status: ReviewStatus.APPROVED,
          moderatedById: admin.id,
          moderatedAt: subDays(new Date(), 2),
        },
      });
    }

    if (dressItem) {
      await prisma.productReview.create({
        data: {
          productId: dressItem.variant.productId,
          userId: jane.id,
          orderId: janeDeliveredOrder.id,
          rating: 4,
          title: "Beautiful for parties",
          body: "Lovely twirl and great quality fabric. Runs slightly generous in the shoulders but still adorable.",
          status: ReviewStatus.PENDING,
        },
      });
    }
  }

  if (emmaDeliveredOrder) {
    const pajamaItem = emmaDeliveredOrder.items.find(
      (item) => item.variant.product.slug === "starlight-pajama-set",
    );

    if (pajamaItem) {
      await prisma.productReview.create({
        data: {
          productId: pajamaItem.variant.productId,
          userId: emma.id,
          orderId: emmaDeliveredOrder.id,
          rating: 5,
          title: "Cozy bedtime favorite",
          body: "My daughter asks for these pajamas every night. Soft, breathable, and the print has held up well in the wash.",
          status: ReviewStatus.APPROVED,
          moderatedById: admin.id,
          moderatedAt: subDays(new Date(), 5),
        },
      });
    }
  }

  await prisma.newsletterSubscriber.createMany({
    data: [
      { email: "newsletter@example.com" },
      { email: "deals@example.com" },
      { email: "parent.tips@example.com" },
      { email: jane.email },
      { email: "sarah.mom@example.com" },
    ],
    skipDuplicates: true,
  });

  console.log("\n✅ Seed complete!\n");
  console.log("Accounts (password for all: password123):");
  console.log("  Admin:          admin@theminiwear.com");
  console.log("  Order Manager:  orders@theminiwear.com");
  console.log("  Support Agent:  support@theminiwear.com");
  console.log("  Customer:       customer@example.com");
  console.log("\nMock data created:");
  console.log(`  ${categories.length} categories`);
  console.log(`  ${createdProducts.length} products, ${allVariants.length} variants`);
  console.log(`  ${orderSeeds.length + 1} orders`);
  console.log(`  4 inquiries`);
  console.log(`  3 product reviews`);
  console.log(`  5 wishlist items, 1 cart`);
  console.log(`  4 customer notes, 5 newsletter subscribers`);
  console.log(`  2 shipping zones, 5 discount codes`);
  console.log(`  ${usZone.name} shipping zone configured`);

  await prisma.heroSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      ...defaultHero,
      buttons: defaultHero.buttons,
      productTiles: defaultHero.productTiles,
    },
    update: {},
  });

  for (const section of defaultHomepageSections) {
    await prisma.homepageSectionConfig.upsert({
      where: { key: section.key as never },
      create: {
        key: section.key as never,
        enabled: section.enabled,
        eyebrow: section.eyebrow,
        title: section.title,
        description: section.description,
        viewAllLabel: section.viewAllLabel,
        viewAllHref: section.viewAllHref,
        productLimit: section.productLimit,
        sortBy: section.sortBy,
        includeSiteWideSale: section.includeSiteWideSale,
      },
      update: {},
    });
  }

  for (const page of defaultSitePages) {
    await prisma.sitePage.upsert({
      where: { slug: page.slug },
      create: page,
      update: {},
    });
  }

  console.log("  CMS defaults (hero, sections, pages)");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
