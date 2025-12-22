/**
 * 游戏相关工具函数
 */

/**
 * 提取文件名并去掉扩展名
 * 如果文件名包含下划线，则返回下划线后的部分
 * @param {string} imageSrc - 图片路径或游戏名称
 * @returns {string} 处理后的游戏名称
 */
export const getGameName = (imageSrc) => {
  const fileName = imageSrc.split('/').pop();
  let name = decodeURIComponent(fileName.replace(/\.[^/.]+$/, ''));

  if (name.indexOf('_') !== -1) {
    let underscoreIndex = name.indexOf('_');
    return name.slice(underscoreIndex + 1);
  } else {
    return name;
  }
};
