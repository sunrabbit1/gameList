/**
 * 图片相关工具函数
 */

/**
 * 监听图片进入视口，实现懒加载
 * 使用 IntersectionObserver API 来检测图片是否进入视口
 * @param {string} selector - 图片选择器，默认为 '.game-poster'
 * @param {object} options - IntersectionObserver 配置选项
 * @returns {IntersectionObserver|null} 返回观察器实例，用于后续清理
 */
export const observeImages = (selector = '.game-poster', options = {}) => {
  const images = document.querySelectorAll(selector);

  if (images.length === 0) {
    return null;
  }

  const defaultOptions = {
    rootMargin: '50px', // 提前50px开始加载
    ...options
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const dataSrc = img.getAttribute('data-src');

        if (dataSrc && (!img.src || img.src === window.location.href || img.src === '')) {
          // 添加错误处理
          img.onerror = () => {
            console.error('Failed to load image:', dataSrc);
            img.onerror = null; // 避免重复触发
          };

          img.src = dataSrc;
        }
        observer.unobserve(img);
      }
    });
  }, defaultOptions);

  images.forEach(image => {
    const dataSrc = image.getAttribute('data-src');
    const currentSrc = image.src;

    // 只观察还没有加载的图片
    if (dataSrc && (!currentSrc || currentSrc === '' || currentSrc === window.location.href)) {
      observer.observe(image);
    }
  });

  return observer;
};
