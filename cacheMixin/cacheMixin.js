/** 缓存混入功能
 * @description 缓存页面数据
 * @param {Object} _cacheData 页面需要缓存的数据 定义在computed中
 * @param {Boolean} _isCache 去向页面返回时是否缓存 路由跳转时定义在query或params中 缓存开关 有些页面不需要缓存
 *
 */

let cacheto;
let fromName = {
  sysStation: ["sysInverter"],
  alarmEvent: ["sysInverter"],
  collectorUpgrade: ["collectorReport", "collectorProcess"],
  inverterUpgrade: ["inverterReport", "inverterProcess"],
  orderManage: ["company", "equsLoad", "equsManage"],
  company: ["companyEdit", "companyDetail", "orderManage"],
  companyAgent: ["companyEditAgent", "companyDetailA`gent"],
  stationManage: ["stationEdit", "stationMoreEdit"],
  stationManageAgent: ["stationEditAgent", "stationMoreEditAgent"],
  equsManage: ["sysInverter", "equsLoad", "orderManage"],
  equsManageAgent: ["sysInverter", "equsLoadingAgent"],
  equsLoad: ["deviceLog", "equsManage", "orderManage"],
  equsLoadingAgent: ["deviceLog", "equsManageAgent"]
};
const cacheData = {
  beforeRouteEnter(to, from, next) {
    if (fromName[to.name].indexOf(from.name) == -1) {
      let storage = window.sessionStorage;
      Object.keys(storage).forEach(key => {
        if (key.indexOf('_cache') > -1) {
          window.sessionStorage.removeItem(key);
        }
      });
    }
    next();
  },
  created() {
    let cacheData = null;
    if (this.name == 'inverterCardModel' || this.name == 'inverterListModel') {
      cacheData = window.sessionStorage.getItem(`${this.name}_cache`);
    } else {
      cacheData = window.sessionStorage.getItem(`${this.$route.name}_cache`);
    }
    if (cacheData && cacheData !== 'undefined') {
      let data = JSON.parse(cacheData);
      for (let key in data) {
        if (data.hasOwnProperty(key)) {
          const ele = data[key];
          switch (key) {
            case "refs": ele.forEach(item => {
              this.$nextTick(() => {
                this.$refs[item.name][item.key] = item.value;
              });
            });
              break;
            case "ids": this.$nextTick(() => {
              this[key] = ele;
            });
              break;
            default: this[key] = ele;
          }
        }
      }
    }
  },
  beforeRouteLeave(to, from, next) {
    cacheto = to;
    if (to.query._isCache || to.params._isCache) {
      if (this._cacheData) {
        this._saveCacheData = Object.assign({}, this._cacheData);
        window.sessionStorage.setItem(`${this.$route.name}_cache`, JSON.stringify(this._saveCacheData));
      }
    } else {
      window.sessionStorage.removeItem(`${this.$route.name}_cache`);
    }
    next();
  },
  beforeDestroy() {
    if (this.name == 'inverterCardModel' || this.name == 'inverterListModel') {
      if (cacheto.query._isCache || cacheto.params._isCache) {
        if (this._cacheData) {
          this._saveCacheData = Object.assign({}, this._cacheData);
          window.sessionStorage.setItem(`${this.name}_cache`, JSON.stringify(this._saveCacheData));
        }
      } else {
        window.sessionStorage.removeItem(`${this.name}_cache`);
      }
    }
  },
};

export default cacheData;