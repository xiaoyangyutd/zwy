<template>
  <div class="operate-Log panel-shadow">
    <layout class="load-layout">
      <Content>
        <div class="search-box mb-10">
          <span>{{ $t('reportType') }}</span>
          <Select v-model="reportType"
                  class="mr-5 kh-search-input ml-12"
                  :placeholder="$t('selectReportType')"
                  @on-change="reportTypeChange"
                  >
            <Option value="all" :title="$t('all')">{{ $t('all') }}</Option>
            <Option v-if="!reportTypeList.length" value='' disabled>{{ $t('noMatchData')}}</Option>
            <Option v-for="(option, index) in reportTypeList" :value="option.reportType" :key="index" :title="option.reportTypeName">{{option.reportTypeName}}</Option>
          </Select>
          <span>{{ $t('reportName') }}</span>
         <Select v-model="reportName"
            :placeholder="$t('enterReportName')"
            filterable
            remote
            clearable
            :remote-method="remoteMethod"
            class="kh-search-input  ml-12 report-name-input"
            @on-clear="reportClear"
            @on-query-change="reportQueryChange"
            ref="reportName"
            @on-change="changeReport">
            <Option v-if="!optionsReportList.length" value='' disabled>{{ $t('noMatchData')}}</Option>
            <Option v-for="(option, index) in optionsReportList" :value="option.reportName" :key="index" :title="option.reportName">{{option.reportName}}</Option>
          </Select>
          <span class="long-desp">{{ $t('reportGenerationDate') }}</span>
          <DatePicker
            type="daterange"
            :placeholder="$t('selectTimeSpan')"
            format="yyyy-MM-dd"
            v-model="sectionTime"
            :options="timeOptions"
            :start-date="startDate"
            class="time-select ml-12"
            @on-change="timeOut"
            :editable="false"
            ref="queryTime"
          >
          </DatePicker>
          <Button type="primary" @click="searchData" class="ml-10">{{
            $t("search")
          }}</Button>
        </div>
        <div class="report_tip">{{ $t('maxHundredReport') }}</div>
        <div class="kh-table-container">
          <kh-table
            :columns="columns"
            :tableData="tableDataArr"
            :total="total"
            :pageNum="pageNum"
            :pageSizeOpts="pageSizeOpts"
            :pageSize="pageSize"
            :display="display"
            @get-selected="getSelectedData"
            @on-pageNum="handlePage"
            @on-pageSize="handlePageSize"
            :hasCheckBox="true"
            ref="tableList"
            :showFixedBar="showFixedBar"
            :showFixedHeader="showFixedHeader"
          ></kh-table>
          <ve-download
            type="primary"
            class="mr-5"
            :downloadUrl="downLoadUrl"
            :fileNameCustom="fileNameCustom"
            :paramData="downLoadParam"
            :token="token"
            ref="download"
            v-show="false"
            >{{ $t('downloadTemp') }}</ve-download
          >
          <div :class="{'kh-tab-btn-group': !showFixedBar, 'fixed-btn-group': showFixedBar}">
            <Button type="primary" @click="gotoNew" class="mr-8">{{$t("add")}}</Button>
            <Button type="primary" @click="confirmDel">{{ $t("delete") }}</Button>
          </div>
          <delete-modal v-model="showDelModal" @confirm="batchDelete"></delete-modal>
        </div>
      </Content>
    </layout>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { formatDate, compareDate, hasScrollbar, pageOnScroll } from "@/libs/util";
import {
  DOWN_REPORT_MANAGER,
} from "@/store/module/apis";
import { veDownload, khTable, deleteModal } from "@/components";
import { baseURL } from '@/config';
import Cookies from 'js-cookie';
export default {
  name: "handReport",
  components: {
    veDownload,
    khTable,
    deleteModal
  },
  data() {
    return {
      columns: [
        {
          type: "selection",
          width: 40,
          align: "center",
          className: 'table-selection-class',
        },
        {
          title: this.$t('orderNum'),
          width: 70,
          align: 'center',
          type: 'index',
          indexMethod: (row) => {
            return (row._index + 1) + this.pageSize * (this.pageNum - 1);
          },
        },
        {
          title: this.$t('reportName'),
          key: "reportName",
          align: "center",
          ellipsis: true,
          tooltip: true
        },
        {
          title: this.$t('reportType'),
          key: "reportTypeName",
          align: "center",
          ellipsis: true,
          tooltip: true
        },
        {
          title: this.$t('reportGenerationDate'),
          key: "createTime",
          align: "center",
          ellipsis: true,
          tooltip: true
        },
        {
          title: this.$t('operation'),
          key: 'action',
          align: 'center',
          render: (h, params) => {
            return h(
              'div',
              {
              },
              [
                h(
                  'Button',
                  {
                    props: {
                      type: 'text',
                      size: 'small',
                      disabled:params.row.status == '1' ? false : 'disabled',
                    },
                    style: {
                      marginRight: '5px'
                    },
                    on: {
                      click: (e) => {
                        if (e && e.stopPropagation){
                          e.stopPropagation();
                        } else {
                          window.event.cancelBubble = true;
                        }
                        let query = {
                          id: params.row.id,
                        };
                        this.fileNameCustom = params.row.reportName;//获取下载的文件名称
                        this.downLoadParam = query;
                        setTimeout(() => {
                          this.$refs.download.$el.click();
                        }, 0);
                      }
                    }
                  },
                  params.row.status == '1'?this.$t('downloadFile'):this.$t('processing')
                ),
                h(
                  "label",
                  {
                    props: {
                      type: "text"
                    },
                    style: {
                      display: "inline-block",
                      marginRight: "5px",
                      color: "#dcdee0",
                      verticalAlign: "middle"
                    }
                  },
                  "|"
                ),
                h(
                  "Button",
                  {
                    props: {
                      size: "small",
                      type: "text",
                      disabled:params.row.status == '1' ? false : 'disabled'
                    },
                    style: {
                      marginRight: "5px"
                    },
                    on: {
                      click: (e) => {
                        if (e && e.stopPropagation){
                          e.stopPropagation();
                        } else {
                          window.event.cancelBubble = true;
                        }
                        this.$Modal.confirm({
                          title: this.$t('noticeTip'),
                          content: this.$t('isDelete'),
                          onOk: (e) => {
                            if (e && e.stopPropagation){
                              e.stopPropagation();
                            } else {
                              window.event.cancelBubble = true;
                            }
                            this.remove(params.index);
                          }
                        });
                      }
                    }
                  },
                  this.$t("delete")
                ),
              ]
            );
          }
        }
      ],
      dInputParamter: '',
      showModal: false,
      scrollLen: 9,
      tableSpan: 0,
      tableDataArr: [],
      total: 0,
      pageSizeOpts: [30, 50, 100],
      pageSize: 30,
      pageNum: 1,
      display: false,
      key: "",
      ids: [],
      time: "",
      startTime: "",
      endTime: "",
      timeOptions: {
        //不可选今天之前的日期
        disabledDate(date) {
          return date && date.valueOf() > Date.now();
        }
      },
      sortByDurationTime: '', //响应时间排序
      operateResult: 'all',
      reportTypeList:[],
      optionsReportList:[],//报表名称选项
      showDelModal:false,//删除弹窗
      reportType:'all',//报表类型
      reportName:'',//报表名称
      downLoadUrl: baseURL + DOWN_REPORT_MANAGER,//下载路径
      downLoadParam: {},
      fileNameCustom:'',
      timerArr: [], // 存储计时器队列
      sectionTime:'',
      isRepeatTimer:true,//是否还需要发请求获取表格数据，处理中需要，全部为下载时不需要
      showFixedBar: false, //是否展示底部遮罩层
      showFixedHeader:false, //是否展示顶部遮罩表头
      reportName_query:'',
    };
  },
  created() {
    this.timer();//定时请求
    this.getListReportType();
    this.getAsyncReportNameList();

    //页面滚动事件
    setTimeout(() => {
      pageOnScroll(this);
    });
  },
  mounted() {},
  computed: {
    startDate() {
      let year = (new Date()).getFullYear();
      let month = (new Date()).getMonth();
      let day = (new Date()).getDate();
      return new Date(year, month-1, day);
    },

    token() {
      return Cookies.get('token') ? Cookies.get('token') : '';
    }
  },
  methods: {
    ...mapActions(["listReportType","listReportTable","listReportName","deleteReportManager","downloadReportManager"]),
    handlePage(value) {
      this.pageNum = value;
      if (this.isRepeatTimer){
        this.timer();//定时请求
      } else{
        this.getTabData();
      }
    },
    handlePageSize(value) {
      this.pageNum = 1;
      this.pageSize = value;
      if (this.isRepeatTimer){
        this.timer();//定时请求
      } else {
        this.getTabData();
      }
    },
    getSelectedData(selection ,row) {
      this.selectedData = [];
      this.selectedData = selection;
      this.ids = [];
      selection.forEach(element => {
        this.ids.push(element.id);
      });
    },
    searchData() {
      this.pageNum = 1;
      if (this.isRepeatTimer){
        this.timer();//定时请求
      } else{
        this.getTabData();
      }
    },
    //获取报表类型
    getListReportType() {
      this.listReportType().then((res) => {
        if (res.data){
          this.reportTypeList = res.data;
        }
      });
    },
    //关闭定时器
    clearTimer(){
      this.timerArr.forEach(item => {
        clearTimeout(item); // 多余计时器清理
      });
      this.timerArr.length = 0;
    },
    //切换时间
    timeOut(value) {
      this.sectionTime = value;
      this.startTime = value[0];
      this.endTime = value[1];
      this.clearTimer();
    },
    // 请求获取操作日志数据
    getTabData() {
      //判断输入的时间范围是否合法
      if (this.startTime > this.endTime) {
        this.$Message.error(this.$t('timeSelectLimit'));
        return;
      }
      this.listReportTable({
        pageNumber: this.pageNum,
        pageSize: this.pageSize,
        startTime:this.startTime === '' ? null : this.startTime + ' 00:00:00',
        endTime: this.endTime === '' ? null : this.endTime + ' 23:59:59',
        reportType:this.reportType === 'all' ? null : this.reportType,
        name:this.reportName ? this.reportName : this.reportName_query
      }).then(res => {
        if (!res.data) return;
        this.tableDataArr = res.data.result || [];
        let statusArr = [];
        this.tableDataArr.forEach(item => {
          if (item.createTime) {
            item.createTime = formatDate(
              new Date(item.createTime),
              "y-m-d"
            );
          }
          statusArr.push(item.status);
        });
        this.isRepeatTimer = statusArr.some(this.checkStatus);//true情况下，需要定时请求，false不需要请求
        this.total = res.data.total || 0;
        //清空表格的选中项
        this.$refs.tableList.clearSelect();
        // 判断是否需要展示固定滚动条
        setTimeout(() => {
          this.showFixedBar = hasScrollbar("load-layout");
        });
      });
    },
    //检查是否全是下载状态，无处理中状态
    checkStatus(status) {
      return status === 0;
    },
    // 输入搜索
    remoteMethod(query) {
      this.getAsyncReportNameList(query);
    },
    //获取报表名称
    getAsyncReportNameList(query) {
      this.listReportName({
        name: query || '',
        reportType: this.reportType === 'all' ? null : this.reportType,
      }).then((res) => {
        if (res.data){
          this.optionsReportList = res.data || [];
        }
      });
    },
    reportClear() {//清空查询的内容重新获取数据
      this.getAsyncReportNameList();//没有传query去查询，查到的是全部的
    },
    reportQueryChange(query) {//存在查询的内容，请求数据
      !query && this.getAsyncReportNameList(query);
      this.reportName_query = query;
    },
    resetQuery() {
      let query = this.$refs['reportName'].$data.query;
      if (query) {
        this.$refs['reportName'].$data.query = '';
      }
    },
    reportTypeChange() {//报表类型切换
      this.reportName = '';
      this.resetQuery();
      this.getAsyncReportNameList();
      this.clearTimer();
    },
    changeReport() {//修改报表名称
      this.clearTimer();
    },
    confirmDel() {//删除按钮
      if (this.ids.length == 0) {
        this.$Message.error(this.$t('selectLeaseOneObj'));
        return false;
      }
      this.$Modal.confirm({
        title: this.$t('noticeTip'),
        content: this.$t('isDelete'),
        onOk: () => {
          this.batchDelete();
        }
      });
    },
    gotoNew() {//新增
      if (this.tableDataArr.length >= 100){
        this.$Message.error(this.$t('keepUpReports'));
        return false;
      }
      this.$router.push({
        name: "reportHandAdd",
        query: {}
      });
    },
    batchDelete() {//批量删除
      this.deleteReport(this.ids);
    },
    remove(index) {//单个删除
      let reportId = this.tableDataArr[index].id;
      let ids = [reportId];
      this.deleteReport(ids);
    },
    deleteReport(ids) {
      this.deleteReportManager({
        ids: ids.join(',')
      }).then(res => {
        if (res.code === '0') {
          if (this.tableDataArr.length === this.ids.length) {
            this.pageNum = 1;
          }
          this.ids = [];
          this.$Message.success(res.message || this.$t('deleteSuc'));
          this.getTabData();
        } else {
          this.$Message.error(res.message || this.$t('operateFail'));
        }
      });
    },
    async timer() {
      this.clearTimer();
      if (!this._isDestroyed) {
        //实时刷新采集时间数据
        if (this.isRepeatTimer){
          this.getTabData();
          this.timerArr.push(setTimeout(this.timer, 15000));
        }
      }
    }
  }
};
</script>

<style scoped lang="scss">

@media screen and (max-width: 1440px){}

@media screen and (max-width: 1366px){}
</style>
