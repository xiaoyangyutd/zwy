<template>
  <div>
    <Table
      :stripe="stripe"
      :height="height"
      size="small"
      :columns="columns"
      :data="tableData"
      :border="showBorder"
      :listLength="listLength"
      :no-data-text="noDataText"
      @on-select="getSelectedData"
      @on-select-cancel="getSelectedData"
      @on-select-all="selectAllData"
      @on-selection-change="selectAllData"
      @on-row-click="rowClick"
      @on-row-dblclick="rowDblClick"
      @on-sort-change="sortChange"
      ref="deptTree"
      class="kh-table"
      :row-class-name="rowClassName"
    >
    </Table>
    <div :class='{"tab-foot" : true, "kh-tab-foot": true, "fixed-footer" : showFixedBar && (showfixedClass === "fixed-footer"), "fixed-footer-more": showFixedBar && (showfixedClass === "fixed-footer-more") }'>
      <div  style="position: relative;float: left;">
        <Page
          :total="total"
          :page-size="pageSize"
          :page-size-opts="pageSizeOpts"
          transfer
          :current="pageNum"
          @on-change="handlePage"
          @on-page-size-change="handlePageSize"
          size="small"
          show-sizer
          show-elevator
          show-total
          v-show="showPager"
          class="page-class"
        >
        <span></span>
        </Page>
      </div>
      <div class="selected-item" v-show="showPager">{{ this.$t('totalCount')}} {{total}} {{this.$t('item')}}<label v-show="selectRowList.length>0">，{{this.$t('selected')}} {{selectRowList.length}} {{this.$t('item')}}</label></div>
    </div>
      <div class="fix-table-copy-wrapper" v-show="showFixedHeader">
          <Table
            v-if="isReRender"
            :columns="columns"
            :data="tableHeadData"
            height='46px'
            class="table-fixed-head"
            @on-selection-change="selectAllHeader"
            ref="headerTree"
          >
          </Table>
      </div>
  </div>
</template>

<script>
import {isObjectValueEqual} from "@/libs/util";
import $ from 'jquery';

/**
 * 引入
 * import {khTable} from "@/components"
 * 注册
 * Vue.component(khTable.name, khTable);
 * <kh-table :columns="" :tableData="" :total="" :pageSizeOpts="" @get-selected="" @on-pageNum="" @on-pageSize="">
 * </kh-table>
 * @params
 * @name props
 * @columns [String, Array] 表格列
 * @tableData [String, Array] 表格数据
 * @total {Number} 表格条数
 * @pageSize {Number} 每页条数
 * @pageSizeOpts [Array] 每页条数切换的配置
 * @pageNum {Number} 当前页码
 * @isSelectAllData 底下全选框是否勾上
 * @isBotCheckAll 底下全选框是否创建
 * @name events
 * @on-pageNum 页码改变的回调，返回改变后的页码
 * @on-pageSize 切换每页条数时的回调，返回切换后的每页条数
 * @get-selected 获取选中行数据
 * @row-click 单击某一行时候触发
 * @on-sort-change 排序时有效，当点击排序时触发
 */
export default {
  name: 'khTable',
  props: {
    columns: { type: [Object, Array], default() { return {}; } },
    tableData: { type: [Object, Array], default() { return {}; } },
    total: { type: Number, default: 0 },
    pageSize: { type: Number, default: 10 },
    pageSizeOpts: { type: [Array], default() { return []; } },
    pageNum: { type: Number, default: 1 },
    stripe: { type: Boolean, default: true },
    isBotCheckAll: { type: Boolean, default: false },
    height: { type: Number, default: 0 },
    hasCheckBox: { type: Boolean, default: false },
    showPager: { type: Boolean, default: true },
    showFixedBar: { type: Boolean, default: false },
    showFixedHeader: { type: Boolean, default: false },
    showBorder: { type: Boolean, default: false },
    isReRender: { type: Boolean, default: true },
  },
  data() {
    return {
      isSelAllData: false,
      noDataText: this.$t('loading'),
      selectRowList: [],    //记住用户选中的row
      lang: window.localStorage.getItem('language'),
      showfixedClass: 'fixed-footer',
      tableHeadData:[//遮罩层表格体，不呈现，但是需要，否则全选框无法点击
        {"deviceType":"1",
          "YC21":545.0000,
          "subDeviceNo":-1,
          "YC12":52.7000,
          "appPower":14.2000,
          "YC13":53.2000,
          "YC16":1.0000,
          "pvActivePower":14.4000,
          "YC15":60.2000,
          "deviceTypeName":"deviceTypeName1",
          "protocolTempletId":22,
          "deviceId":3,
          "companyId":1,
          "areaCode":"16",
          "createTime":"2019-09-10 09:49:16",
          "YC18":3.2000,
          "acquireTime":"2019-09-10 05:49:08",
          "totalElec":9094.8000,
          "stationName":"stationName1",
          "id":5057,
          "sn":"sn1",
          "dayElec":18.0000,
          "stationId":4
        }
      ],
      isClickData:false,
      isSelfClick:true,//顶部表格点击
      name: this.test
    };
  },
  computed: {
    listLength() {
      return this.tableData.length;
    }
  },
  watch: {
    tableData: {
      handler(newVal, oldVal) {// 判断是否为新请求回来的数据
        this.$nextTick(()=>{
          let checkAllBox = document.querySelectorAll('.kh-table .ivu-table-header .ivu-table-cell .ivu-checkbox-wrapper span.ivu-checkbox-checked');
          if (checkAllBox.length > 0){
            this.tableHeadData.forEach( ele => {//定时请求数据刷新页面时取消勾选状态 遮罩层
              this.$set(ele, '_checked', true);
            });
          } else {
            this.tableHeadData.forEach( ele => {//定时请求数据刷新页面时取消勾选状态 遮罩层
              this.$set(ele, '_checked', false);
            });
          }
          let selectAllBox =  document.querySelectorAll(".kh-table .ivu-table-body .demo-table-row");
          if (!selectAllBox.length) {
            this.selectRowList = [];
          }
        });
        this.isSelAllData = false;
        this.noDataText = this.$t('loading');
        //重新渲染表格后清空已选项
        if ((newVal && newVal.length == 0) || (oldVal && oldVal.length == 0)) {
          let timer1 = setTimeout(() => {
            this.noDataText = `<img style="margin-top:62px;" src="${require('@/assets/images/default_img_noData.png')}"><div style="margin-bottom:62px;">${this.$t('noneData')}</div>`;
            clearTimeout(timer1);
          }, 2500);
        }
        //特殊处理表格宽度不一致的情况
        let timer2 = setTimeout(()=> {
          if (parseInt($('.layout-content').width()) - parseInt($('.load-layout').width()) === 24) {
            this.showfixedClass = 'fixed-footer-more';
          } else {
            this.showfixedClass = 'fixed-footer';
          }
          clearTimeout(timer2);
        },100);
      },
      deep: true,
      immediate: true
    },
  },
  created() {},
  mounted() {},
  methods: {
    //取消选中项
    clearSelect() {
      this.selectRowList = [];
      //清空当前选中项
      this.tableData.forEach( (ele,index) => {
        ele._checked = false;
        this.$set(this.tableData, index, ele);
      });
    },
    handlePage(value) { //页码改变的回调，返回改变后的页码
      this.isSelAllData = false;
      this.tableHeadData.forEach( ele => {//设置遮罩层不选中
        this.$set(ele, '_checked', false);
      });
      this.selectRowList = [];
      this.$emit('on-pageNum', value);
    },
    handlePageSize(value) { //切换每页条数时的回调，返回切换后的每页条数
      this.isSelAllData = false;
      this.tableHeadData.forEach( ele => {//设置遮罩层不选中
        this.$set(ele, '_checked', false);
      });
      this.selectRowList = [];
      this.$emit('on-pageSize', value);
    },
    rowClick(value, index) {

      let selection = [];
      let rowData = this.tableData[index];
      //判断表格是否存在checkBox,存在则触发选中事件
      if (this.hasCheckBox) {
        //判断该行是否被禁用，禁用则不触发
        if (!rowData._disabled) {
          rowData._checked = ! rowData._checked;
          this.$set(this.tableData, index, rowData);
          //读取用户选择的行
          this.tableData.forEach(element => {
            if (element._checked) {
              selection.push(element);
            }
          });
          this.selectRowList = selection;
          this.$emit('get-selected', selection);
        }
      }
      //避免表格只有一条数据的时候重置表格单击选中的效果
      if (selection.length == 0 || this.tableData.length === 1) {//一个都没选中或者所有的都选中时，isSelfClick先不设为true，等相应操作完再设为true
        // this.isSelfClick = true;
      } else if (selection.length !== this.listLength){//数据表格反操作遮罩层表格  选中的个数与总个数不相等即非全选情况
        this.isSelfClick = false;//isSelfClick为false表示是数据表格触发了遮罩层表格的全选框选中和不选中；为true表示是遮罩层本身触发了全选框事件
        this.isClickData = true;//isClickData为true时，说明点击了数据表格，这时不能设置遮罩层表格的全选框为选中状态
        this.$refs.headerTree.selectAll(false);//这里会触发selectAllHeader函数   设置遮罩层表格的全选框为false  ,走 2-1
      } else {
        this.isClickData = false;//   全选
        this.$refs.headerTree.selectAll(true);//全选之前isSelfClick一直为false,走2-2  然后将其设置为true
      }
      this.$emit('row-click', { value, index });
    },
    rowDblClick(value, index) {
      this.$emit('row-dblclick', { value, index });
    },
    sortChange(column) {
      this.$emit('on-sort-change', column);
    },
    getSelectedData(selection, row) {//这里不包含表格的全选按钮点击
      //找出与表格中与当前勾选行对应的数据存放的位置
      let index = this.tableData.findIndex((v) => {
        return isObjectValueEqual(row, v);
      });

      if (index != -1) {
        this.tableData[index]._checked = ! this.tableData[index]._checked;
      }
      //全选
      selection.length !== this.listLength ? this.isSelAllData = false : this.isSelAllData = true;
      this.selectRowList = selection;
      this.$emit('get-selected', selection);

      if (selection.length == 0) {
        //this.isSelfClick = true;
      } else if (selection.length !== this.listLength){//数据表格反操作遮罩层  选中的个数与总个数不相等
        this.isSelfClick = false;
        this.isClickData = true;//
        this.$refs.headerTree.selectAll(false);
      } else {
        this.isClickData = false;//   全选
        this.$refs.headerTree.selectAll(true);
      }
    },
    selectAllData(selection) {
      if (selection.length == this.listLength) {
        this.tableData.forEach( ele => {
          ele._checked = true;
        });
        this.tableHeadData.forEach( ele => {//设置遮罩层选中
          this.$set(ele, '_checked', true);
        });
      } else if (selection.length === 0) {
        this.tableData.forEach( ele => {
          ele._checked = false;
        });
        this.tableHeadData.forEach( ele => {//设置遮罩层不选中
          this.$set(ele, '_checked', false);
        });
      }
      this.selectRowList = selection;
      this.$emit('get-selected', selection);
    },
    selectAllHeader(){//点击遮罩层全选框
      if (this.isSelfClick){ // 1
        if (this.selectRowList.length !== this.tableData.length) { //1-1
          this.$refs.deptTree.selectAll(true);//在表格数据没有全选中时，点击自身的选中框，选中所有数据
        } else {//1-2
          this.$refs.deptTree.selectAll(false);//在表格数据全选中时，点击自身的选中框，不选中所有数据
        }
      } else {//2
        if (this.isClickData){//isClickData为true时  2-1
          this.isClickData = false;
        } else {//2-2
          this.$refs.deptTree.selectAll(true);
          this.isSelfClick = true;
        }
      }
    },
    selectChange(selection) {
      if (!selection.length || selection.length !== this.listLength) {
        this.isSelAllData = false;
      }
      this.$emit('get-selected', selection);
    },
    selectedAllData() {      // 全选表格数据 取消
      this.isSelAllData = !this.isSelAllData;
      this.$refs.deptTree.selectAll(this.isSelAllData);
      if (!this.isSelAllData) {
        this.$emit('get-selected', []);
      }
    },
    rowClassName(row, index) {
      if (row._isChecked) {
        return 'demo-table-row';
      } else {
        return '';
      }
    },
  }
};
</script>

<style scoped lang="scss">
.tab-foot {
  width: 100%;
  display: flex;
  align-items: center;
  padding: $space;
}
.ivu-table .demo-table-row td{
    background-color: #2db7f5;
    color: #fff;
}
.selected-item {
   display: inline;
   float: left;
   margin-left: 10px;
   margin-top: -2px;
}
.page-class {
  margin-left: p2r(-35px);
}

//固定操作bar样式
.fixed-footer {
    position: fixed;
    bottom: 38px;
    z-index: 20;
    margin: 0;
    background: rgba(75,75,75,.85);
    border-top-color: transparent;
    width: 97.9%;
    left: 12px;
    height: 45px;
    ul {
       margin-left: p2r(-7px) !important;
    }

    .selected-item {
       color: white;
    }
 }

//  带有empty-page的外层div
 .fixed-footer-more {
    position: fixed;
    bottom: 38px;
    z-index: 20;
    margin: 0;
    background: rgba(75,75,75,.85);
    border-top-color: transparent;
    width: 98.8%;
    left: 12px;
    height: 45px;
    ul {
       margin-left: p2r(-7px) !important;
    }

    .selected-item {
       color: white;
    }
 }

//固定头部操作bar样式
.fix-table-copy-wrapper{
  left: 12px;
  height: 45px;//45px
  display: block;
  background-color: #656565;
  overflow: hidden;
  position: fixed;
  z-index: 30;
  top:68px;
  width: 97.9%;
}
.fix-table-copy-wrapper .table-fixed-head{
  z-index: 31;
}
/deep/.fix-table-copy-wrapper .ivu-table-wrapper{
  border:0;
  margin: 0 p2r(20px);
}
/deep/.fix-table-copy-wrapper .ivu-table-wrapper .ivu-table:after{
  width: 0;
}
/deep/.table-fixed-head .ivu-table{
  background-color: #656565;
  color:#fff;
  z-index: 51;
}
/deep/.table-fixed-head .ivu-table th{
  background-color:#656565;
  height: 46px;
}

 @media screen and (min-width: 1600px) and (max-width: 1919px) {
    .fixed-footer, .fix-table-copy-wrapper{
      width: 97.5%;
    }

    .fixed-footer-more {
      width: 98.5%;
    }
 }

 @media screen and (min-width: 1400px) and (max-width: 1599px) {
    .fixed-footer, .fix-table-copy-wrapper {
      width: 97.2%;
    }

    .fixed-footer-more {
      width: 98.4%;
    }
 }

@media screen and (min-width: 1366px) and (max-width: 1439px) {
    .fixed-footer{
      width: 97%;
    }

    .fixed-footer-more {
      width: 98.3%;
    }
    .fix-table-copy-wrapper {
       width: 98.3%;
    }
 }
@media screen and (min-width: 1921px){//适配2000
  .fix-table-copy-wrapper {
    width: 98.8%;
  }
}
 /deep/ .fixed-footer .ivu-page-options-elevator {
    color: white;
 }

 /deep/ .fixed-footer-more .ivu-page-options-elevator {
    color: white;
 }

</style>