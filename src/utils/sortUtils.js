/**
 * 排序工具函数
 * 按照 Windows 资源管理器的排序规则：特殊字符 > 数字 > 字母 > 汉字
 */

/**
 * 类似 Windows 资源管理器的排序函数
 * @param {string} name1 - 第一个名称
 * @param {string} name2 - 第二个名称
 * @returns {number} 比较结果：负数表示 name1 < name2，正数表示 name1 > name2，0 表示相等
 */
export const sortLikeWin = (name1, name2) => {
  const regexPunc = /[\s!！#$%&(（)）,，、.。;；？@[\]^_`{}~''""《》￥【】+=·…]/
  const regexNum = /[0-9]/
  const regexEng = /[A-Za-z]/
  const regexCh = /[\u4E00-\u9FFF]/
  // 排序大小： 特殊字符 > 数字 > 字母 > 汉字
  // 如果第一个字符相等，再比较下一个字符
  let compareValue = false
  const minLength = Math.min(name1.length, name2.length)
  let i = 0
  do {
    const aIndex = name1.charAt(i)
    const bIndex = name2.charAt(i)
    const nameFirstType = [aIndex, bIndex].map((item) => {
      if (item.match(regexPunc)) {
        return 0
      }
      if (item.match(regexNum)) {
        return 1
      }
      if (item.match(regexEng)) {
        return 2
      }
      if (item.match(regexCh)) {
        return 3
      }
      return -1
    })
    // 如果第一个字符不相等
    if (aIndex !== bIndex) {
      if (nameFirstType[0] !== nameFirstType[1]) {
        compareValue = nameFirstType[0] - nameFirstType[1]
        break
      } else {
        // 中文需根据拼音顺序
        compareValue = aIndex.localeCompare(bIndex, 'zh')
        break
      }
    }
    if (i === minLength) {
      compareValue = name1.localeCompare(name2, 'zh')
      break
    }
    i += 1
  } while (i <= minLength)
  return compareValue
}
