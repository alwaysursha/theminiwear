function img(id: string, width = 800) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;
}

/** Verified free Unsplash photos — kids / baby clothing */
const photos = {
  onesieSet: "1622290291720-ac961c43ee30",
  onesieBlue: "1622290319146-7b63df48a635",
  girlDress: "1518831959646-742c3a14ebf7",
  boyOutfit: "1519238263530-99bdd11df2ea",
  whiteTee: "1622290291468-a28f7a7dc6a8",
  blueShorts: "1632337950445-ba446cb0e26f",
  clothesLine: "1632337948797-ba161d29532b",
  babyNest: "1522771930-78848d9293e8",
  leggings: "1503944583220-79d8926ad5e2",
  sleepScene: "1587654780291-39c9404d746b",
  assortedClothes: "1566454544259-f4b94c3d758c",
  closetRack: "1622218286192-95f6a20083c7",
} as const;

export const seedImages = {
  categories: {
    bodysuits: img(photos.onesieSet, 600),
    dresses: img(photos.girlDress, 600),
    outerwear: img(photos.boyOutfit, 600),
    topsTees: img(photos.whiteTee, 600),
    bottoms: img(photos.blueShorts, 600),
    accessories: img(photos.clothesLine, 600),
    sleepwear: img(photos.sleepScene, 600),
    swimwear: img(photos.blueShorts, 600),
  },
  products: {
    cloudSoftBodysuit: [img(photos.onesieSet), img(photos.onesieBlue)],
    floralDreamDress: [img(photos.girlDress)],
    cozyPufferJacket: [img(photos.boyOutfit)],
    rainbowStripeTee: [img(photos.assortedClothes)],
    stretchPlayLeggings: [img(photos.leggings)],
    bunnyKnitCardigan: [img(photos.clothesLine)],
    starlightPajamaSet: [img(photos.sleepScene)],
    sunSplashRashGuard: [img(photos.boyOutfit)],
    littleExplorerOveralls: [img(photos.blueShorts)],
    pastelPartyRomper: [img(photos.onesieBlue)],
    cozySockPack: [img(photos.closetRack)],
    dinoRoarHoodie: [img(photos.whiteTee)],
  },
} as const;
