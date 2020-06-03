//...

//判断页面是否出现滚动条
export const  hasScrollbar = (className) => {
  //出现的滚动高度大于100才出现固定操作栏
  return document.querySelector('.'+className).offsetHeight > document.querySelector('.layout-content').offsetHeight + 100;
};

/**
 * @param {item} vue实例
 * @description  控制底部遮罩层的显示隐藏
 */
export const  pageOnScroll = (item) => {
  let _this = item;
  document.querySelector('.special_Scroll').onscroll = function(e) {
    //判断是否滚到最底部
    var scrollTop = this.scrollTop;//滚动条的垂直位置
    var containerHeight = document.querySelector('.load-layout') ? document.querySelector('.load-layout').clientHeight : 0;//真实内容区域高度（可超出框架高度）
    var scrollHeight = parseInt(document.querySelector('.special_Scroll') ? document.querySelector('.special_Scroll').clientHeight : 0);//框架布局区域高度（固定）
    var tableConHeight = document.querySelector('.kh-table-container') ? document.querySelector('.kh-table-container').clientHeight : 0;//表格的高度（固定）
    if (scrollTop + scrollHeight >= containerHeight - 100) {
      _this.showFixedBar = false;
    } else {
      _this.showFixedBar = true;
    }

    if (scrollTop >=  containerHeight - tableConHeight ){//出现顶部滚动条
      _this.showFixedHeader = true;
    } else {
      _this.showFixedHeader = false;
    }
  };
};


