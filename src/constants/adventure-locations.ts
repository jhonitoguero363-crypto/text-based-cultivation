import type { RealmMajor } from './realm'
import { REALM_MAJORS } from './realm'
import { getRealmMajorIndex } from './treasure'

export interface AdventureLocation {
  id: string
  name: string
  realm: RealmMajor
  danger: string
  stars: number
  drops: string
  feature: string
}

/** 秘境历练地点总表 */
export const ADVENTURE_LOCATIONS: AdventureLocation[] = [
  {
    "id": "loc-1",
    "name": "青云山",
    "realm": "炼气",
    "danger": "★",
    "stars": 1,
    "drops": "灵草、灵石、低阶妖兽",
    "feature": "新手区域"
  },
  {
    "id": "loc-2",
    "name": "黑风林",
    "realm": "炼气",
    "danger": "★",
    "stars": 1,
    "drops": "妖兽材料、灵草",
    "feature": "妖兽较多"
  },
  {
    "id": "loc-3",
    "name": "落霞谷",
    "realm": "炼气",
    "danger": "★★",
    "stars": 2,
    "drops": "灵药、矿石",
    "feature": "日夜环境变化"
  },
  {
    "id": "loc-4",
    "name": "寒潭洞",
    "realm": "炼气",
    "danger": "★★",
    "stars": 2,
    "drops": "寒属性材料、灵泉",
    "feature": "冰系妖兽"
  },
  {
    "id": "loc-5",
    "name": "赤炎山脉",
    "realm": "筑基",
    "danger": "★★",
    "stars": 2,
    "drops": "火属性矿石、灵药",
    "feature": "火系妖兽"
  },
  {
    "id": "loc-6",
    "name": "百兽岭",
    "realm": "筑基",
    "danger": "★★",
    "stars": 2,
    "drops": "妖兽材料、灵宠蛋",
    "feature": "捕捉灵宠"
  },
  {
    "id": "loc-7",
    "name": "青木秘境",
    "realm": "筑基",
    "danger": "★★★",
    "stars": 3,
    "drops": "高阶灵药、木灵石",
    "feature": "灵气浓郁"
  },
  {
    "id": "loc-8",
    "name": "断剑谷",
    "realm": "筑基",
    "danger": "★★★",
    "stars": 3,
    "drops": "剑器、矿石、残剑",
    "feature": "剑修遗迹"
  },
  {
    "id": "loc-9",
    "name": "万妖森林",
    "realm": "金丹",
    "danger": "★★★",
    "stars": 3,
    "drops": "高阶妖丹、灵宠",
    "feature": "妖兽群落"
  },
  {
    "id": "loc-10",
    "name": "地火洞",
    "realm": "金丹",
    "danger": "★★★",
    "stars": 3,
    "drops": "炼器矿石、地火",
    "feature": "炼丹炼器资源"
  },
  {
    "id": "loc-11",
    "name": "紫云秘境",
    "realm": "金丹",
    "danger": "★★★★",
    "stars": 4,
    "drops": "紫灵晶、功法残卷",
    "feature": "随机秘境"
  },
  {
    "id": "loc-12",
    "name": "古剑冢",
    "realm": "金丹",
    "danger": "★★★★",
    "stars": 4,
    "drops": "飞剑、剑魂石",
    "feature": "剑修传承"
  },
  {
    "id": "loc-13",
    "name": "九幽谷",
    "realm": "元婴",
    "danger": "★★★★",
    "stars": 4,
    "drops": "魂晶、幽冥材料",
    "feature": "神魂危险"
  },
  {
    "id": "loc-14",
    "name": "天雷崖",
    "realm": "元婴",
    "danger": "★★★★",
    "stars": 4,
    "drops": "雷晶、雷属性材料",
    "feature": "天雷环境"
  },
  {
    "id": "loc-15",
    "name": "沧海遗迹",
    "realm": "元婴",
    "danger": "★★★★",
    "stars": 4,
    "drops": "水系宝物、古修遗物",
    "feature": "海底探索"
  },
  {
    "id": "loc-16",
    "name": "龙骨荒原",
    "realm": "元婴",
    "danger": "★★★★★",
    "stars": 5,
    "drops": "龙骨、龙血、龙鳞",
    "feature": "上古龙族遗迹"
  },
  {
    "id": "loc-17",
    "name": "太虚秘境",
    "realm": "化神",
    "danger": "★★★★★",
    "stars": 5,
    "drops": "虚空晶、空间材料",
    "feature": "空间乱流"
  },
  {
    "id": "loc-18",
    "name": "星陨海",
    "realm": "化神",
    "danger": "★★★★★",
    "stars": 5,
    "drops": "星辰铁、星陨石",
    "feature": "天外陨石"
  },
  {
    "id": "loc-19",
    "name": "凤凰遗墟",
    "realm": "化神",
    "danger": "★★★★★",
    "stars": 5,
    "drops": "凤凰羽、涅槃石",
    "feature": "火焰与重生"
  },
  {
    "id": "loc-20",
    "name": "万魂古墓",
    "realm": "化神",
    "danger": "★★★★★★",
    "stars": 6,
    "drops": "魂晶、魂器",
    "feature": "神魂战斗"
  },
  {
    "id": "loc-21",
    "name": "虚空裂谷",
    "realm": "炼虚",
    "danger": "★★★★★★",
    "stars": 6,
    "drops": "虚空晶、空间神石",
    "feature": "空间穿梭"
  },
  {
    "id": "loc-22",
    "name": "岁月长河",
    "realm": "炼虚",
    "danger": "★★★★★★",
    "stars": 6,
    "drops": "时光石、岁月晶",
    "feature": "时间流速异常"
  },
  {
    "id": "loc-23",
    "name": "轮回古境",
    "realm": "炼虚",
    "danger": "★★★★★★",
    "stars": 6,
    "drops": "轮回玉、魂道晶",
    "feature": "轮回试炼"
  },
  {
    "id": "loc-24",
    "name": "无尽星域",
    "realm": "炼虚",
    "danger": "★★★★★★",
    "stars": 6,
    "drops": "星辰神材、星界晶",
    "feature": "星空探索"
  },
  {
    "id": "loc-25",
    "name": "混沌海",
    "realm": "合体",
    "danger": "★★★★★★★",
    "stars": 7,
    "drops": "混沌石、混沌精华",
    "feature": "混沌之力充斥"
  },
  {
    "id": "loc-26",
    "name": "阴阳天池",
    "realm": "合体",
    "danger": "★★★★★★★",
    "stars": 7,
    "drops": "阴阳玉、造化材料",
    "feature": "阴阳之力交织"
  }
] as AdventureLocation[]

export const ADVENTURE_LOCATION_REALMS: RealmMajor[] = REALM_MAJORS.filter((realm) =>
  ADVENTURE_LOCATIONS.some((item) => item.realm === realm)
)

export function getLocationById(id: string | null | undefined) {
  if (!id) return null
  return ADVENTURE_LOCATIONS.find((item) => item.id === id) || null
}

export function filterLocationsByRealm(realm: string) {
  if (!realm || realm === '全部') return ADVENTURE_LOCATIONS
  return ADVENTURE_LOCATIONS.filter((item) => item.realm === realm)
}

/** 是否达到进入该地点的建议境界 */
export function canEnterLocation(playerMajor: RealmMajor, location: AdventureLocation) {
  return getRealmMajorIndex(playerMajor) >= getRealmMajorIndex(location.realm)
}

/** 依地点危险度估算单次探索收益 */
export function estimateExploreReward(location: AdventureLocation) {
  const realmBonus = Math.max(0, getRealmMajorIndex(location.realm))
  const exp = 30 + location.stars * 18 + realmBonus * 25
  const stones = 16 + location.stars * 10 + realmBonus * 14
  return { exp, stones }
}
