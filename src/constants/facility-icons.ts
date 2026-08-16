/** 宗门设施线标：图形画在 24×24 中心区域，保证视觉居中 */
const JADE = '#5bc8a8'
const GOLD = '#d9b36c'
const BLUE = '#6fa8dc'
const CORAL = '#e07b6c'

function svgData(body: string, color: string) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export const FACILITY_ICON_SRC: Record<string, string> = {
  // 丹阁：锥形瓶，左右对称
  pill: svgData(
    '<path d="M9 4h6"/><path d="M10 4v2.4c0 .5-.2 1-.5 1.4L7.2 11A5 5 0 0 0 6 14.2V16a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-1.8A5 5 0 0 0 16.8 11l-2.3-3.2c-.3-.4-.5-.9-.5-1.4V4"/><path d="M8 15.5h8"/>',
    JADE
  ),
  // 器阁：奖杯，左右对称
  forge: svgData(
    '<path d="M8 5h8v2.8c0 2.2-1.8 4-4 4s-4-1.8-4-4V5z"/><path d="M8 7H6.2A2.2 2.2 0 0 1 4 4.8V4"/><path d="M16 7h1.8A2.2 2.2 0 0 0 20 4.8V4"/><path d="M12 11.8v2.4"/><path d="M9 16.5h6l-1.2 1.2H10.2L9 16.5z"/><path d="M8 20h8"/>',
    GOLD
  ),
  // 功法阁：开卷，左右对称
  tech: svgData(
    '<path d="M12 7c-1.2-1-2.8-1.6-4.5-1.6H5v11.5h2.8c1.6 0 3.1.5 4.2 1.4 1.1-.9 2.6-1.4 4.2-1.4H19V5.4h-2.5C14.8 5.4 13.2 6 12 7z"/><path d="M12 7v11.3"/>',
    BLUE
  ),
  // 洞府：屋，左右对称
  cave: svgData(
    '<path d="M5 11l7-6 7 6v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8z"/><path d="M10 12.5h4M10 15h4M10 17.5h4"/>',
    CORAL
  ),
  // 任务堂：看板，左右对称
  mission: svgData(
    '<rect x="7" y="6" width="10" height="14" rx="1.5"/><path d="M9.5 4.5h5v2.2h-5z"/><path d="M9.5 11h5M9.5 14h3.5"/>',
    CORAL
  ),
  // 人物：居中
  members: svgData(
    '<circle cx="12" cy="8.2" r="3"/><path d="M6 19c.8-3 2.9-4.6 6-4.6s5.2 1.6 6 4.6"/>',
    JADE
  ),
  // 矿洞：镐（对角但包围盒居中）
  mine: svgData(
    '<path d="M13.5 5.2c1.8 0 3.4.6 4.5 1.8-1.5.1-2.9.7-4 1.8L7.2 15.6a1.4 1.4 0 1 1-2-2l6.8-6.8c.9-.9 2-1.5 3.5-1.6z"/><path d="M9 14.2l-2.8 2.8"/>',
    GOLD
  ),
  // 药园：幼苗，左右对称
  garden: svgData(
    '<path d="M12 19.5V11"/><path d="M12 12.8C9.8 12.6 8 11.2 7 9.2c2.2 0 4.1 1.2 5 3.6z"/><path d="M12 12.8c2.2-.2 4-1.6 5-3.6-2.2 0-4.1 1.2-5 3.6z"/><path d="M6.5 19.5h11"/>',
    JADE
  ),
  // 思过崖：山，左右对称
  cliff: svgData(
    '<path d="M4 18.5l5.2-10c.5-.9 1.8-1 2.4-.1L13 12l2.2-3.1c.6-.8 1.8-.7 2.3.2L20 18.5"/><path d="M4 18.5h16"/>',
    CORAL
  ),
  // 镇妖塔：层塔，左右对称
  tower: svgData(
    '<path d="M12 4.2L9.6 6.5h4.8L12 4.2z"/><rect x="8.6" y="6.5" width="6.8" height="2.8" rx="0.4"/><rect x="7.6" y="9.3" width="8.8" height="3" rx="0.4"/><rect x="6.6" y="12.3" width="10.8" height="3.2" rx="0.4"/><rect x="7.8" y="15.5" width="8.4" height="4.3" rx="0.4"/>',
    BLUE
  ),
  // 魔窟：洞窟入口
  demon_den: svgData(
    '<path d="M5 18.5V11c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5v7.5"/><path d="M9 18.5v-4.2c0-1.5 1.3-2.8 3-2.8s3 1.3 3 2.8v4.2"/><path d="M5 18.5h14"/>',
    CORAL
  ),
  // 剑冢：立剑丘
  sword_tomb: svgData(
    '<path d="M12 4.5v11"/><path d="M10 7.2h4"/><path d="M9.2 15.5h5.6L12 19.2 9.2 15.5z"/><path d="M6 19.5h12"/>',
    BLUE
  ),
  // 返祖池：水池涟漪
  ancestor_pool: svgData(
    '<ellipse cx="12" cy="14.5" rx="7" ry="4"/><ellipse cx="12" cy="14.5" rx="4.2" ry="2.2"/><path d="M12 6.5v4.2"/><path d="M9.5 8.2c.8-.6 1.6-.9 2.5-.9s1.7.3 2.5.9"/>',
    GOLD
  ),
  // 灵兽阁：爪印，左右对称
  beast: svgData(
    '<ellipse cx="12" cy="15.4" rx="4" ry="3.2"/><circle cx="7" cy="9.4" r="1.55"/><circle cx="10.2" cy="7.5" r="1.55"/><circle cx="13.8" cy="7.5" r="1.55"/><circle cx="17" cy="9.4" r="1.55"/>',
    JADE
  )
}
