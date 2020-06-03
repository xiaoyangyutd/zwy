<template>
  <div class="operate-Log panel-shadow">
    <layout class="load-layout">
      <Content>
        <div class="date-container">
          <Tabs type="line" @on-click="changeType" v-model="tabType">
            <Tab-pane :label="$t('plantData')" name="stationTab"></Tab-pane>
            <Tab-pane :label="$t('deviceData')" name="deviceTab"></Tab-pane>
          </Tabs>
        </div>
        <div class="search-box">
          <span><label class="requireItem" >*</label>{{ $t('reportName') }}</span>
          <Input class="mr-5 kh-search-input ml-12 report-name-input" type="text" v-model="reportName"  @on-change.once="rep_sta_change" v-show=" tabType === 'stationTab'"  :placeholder="$t('enterReportName')" clearable :maxlength="80"/>
          <Input class="mr-5 kh-search-input ml-12 report-name-input" type="text" v-model="reportName_dev" v-show=" tabType === 'deviceTab'" :placeholder="$t('enterReportName')" clearable :maxlength="80"/>
              <select-agent
                ref="agentSelect"
                :isRequired="true"
                @on-change="changeCompany"
                :isAgentType="false"
                :isSearchModal="false"
                v-if="(tabType === 'stationTab' && isCompany)"
              >
              </select-agent>
        </div>
        <div class="hand-report-container">
          <div class="ivu-table-wrapper">
            <div class="ivu-table ivu-table-default ivu-table-border">
            <div class="ivu-table-header">
              <table cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
                 <thead>
                   <tr>
                      <th class="ivu-table-column-center">
                        <div class="ivu-table-cell">
                          <span class="" v-show=" tabType === 'stationTab'"><label class="requireItem" >*</label>{{ $t('plantSelection') }}（{{ $t('maxFiftyStations') }}）</span> <!--电站选择-->
                          <span class="" v-show=" tabType === 'deviceTab'">{{ $t('deviceSearch') }}</span>  <!--设备查询-->
                        </div>
                      </th>
                      <th class="ivu-table-column-center">
                        <div class="ivu-table-cell">
                          <span class="" v-show=" tabType === 'stationTab'">{{ $t('businessRange') }}</span> <!--业务范围-->
                          <span class="" v-show=" tabType === 'deviceTab'"><label class="requireItem" >*</label>{{ $t('deviceList') }}（{{ $t('maxTenDevices') }}）</span> <!--设备列表-->
                        </div>
                      </th>
                      <th class="ivu-table-column-center">
                        <div class="ivu-table-cell">
                          <span class="" v-show=" tabType === 'stationTab'">{{ $t('timeSelection') }}</span> <!--时间选择-->
                          <span class="" v-show=" tabType === 'deviceTab'"><label class="requireItem" >*</label>{{ $t('pointList') }}</span> <!--点位列表-->
                        </div>
                      </th>
                    </tr>
                  </thead>
              </table>
            </div>
            <div class="ivu-table-body">
              <table cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
                <tbody class="ivu-table-tbody">
                  <tr class="ivu-table-row">
                    <td class="ivu-table-column-center">
                      <div class="ivu-table-cell station_cell" :style="{ height:(tabType === 'stationTab'?((station_cell_h+20) / 14 + 'rem'):((station_cell_h+68) / 14 + 'rem') )}">
                        <ul class="station_ul" v-show=" tabType === 'stationTab'"><!--电站数据模块-->
                          <li class="buss_li" v-for="(item, index) in stationNumberList" :key="index">
                              <Select v-model="stationNumberList[index]"
                                  :placeholder="$t('inputStation')"
                                  filterable
                                  remote
                                  transfer
                                  :remote-method="findStation"
                                  class="kh-search-input buss_btn"
                                  @on-clear="clearStation"
                                  @on-query-change="stationQueryChange"
                                  :ref="'stationRef' + index"
                                  :disabled="getStaDisabled(index) || isChangeName"
                                  @on-open-change="openStaChange(index,$event)"
                                  @on-change="changeStation(index,$event)">
                              <Option v-if="!stationNameList.length" value="none" disabled>{{ $t('noMatchData')}}</Option>
                              <Option v-for="(option, k) in stationNameList" :value="option.stationId" :key="option.stationId" :title="option.stationName">{{option.stationName}}</Option>
                              </Select>
                              <button type="button" @click="deleteStation(index)" :disabled="stationNumberList.length == 1" class="ivu-btn ivu-btn-default" style="margin-left: 8px;margin-bottom:5px">
                                <span>{{ $t('delete') }}</span>
                              </button>
                          </li>
                        </ul>
                        <div class="device_left_div" v-show=" tabType === 'deviceTab'"><!--设备数据模块-->
                          <Form
                            :label-width="150"
                            @submit.native.prevent
                            class="device_form"
                            style="margin-top: 24px;"
                          >
                            <FormItem :label="$t('dataType')"
                                      class="mb-16">
                                <Select
                                    v-model.number="dataType"
                                    class="kh-search-input device_form_select tl"
                                    :placeholder="$t('enterDatatype')"
                                    >
                                  <Option v-for="item in dataTypeList"  :value="item.key" :key="item.index" :title="item.title">{{item.title}}</Option>
                                </Select>
                            </FormItem>
                          <FormItem :label="$t('agent')"
                                      v-if="isCompany"
                                      class="mb-16">
                              <select-agent
                                ref="agentSelectDev"
                                @on-change="agentChange"
                                @on-clear="agentClear"
                                :isAgentType="false"
                                :isSearchModal="false"
                                :isNeedLabel="false"
                                width="240"
                              >
                              </select-agent>
                            </FormItem>
                          </Form>
                          <div>
                            <span class="time2_span"><label class="requireItem" >*</label>{{ $t('station') }}</span>
                              <Select v-model="stationId_dev"
                                  :placeholder="$t('inputStation')"
                                  filterable
                                  remote
                                  clearable
                                  :remote-method="findStation"
                                  class="kh-search-input device_form_select tl"
                                  @on-clear="clearStation_dev"
                                  @on-query-change="stationQueryChange_dev"
                                  @on-open-change="stationOpen"
                                  ref="stationRef"
                                  @on-change="stationChange">
                              <Option v-if="!stationList.length" value="none" disabled>{{ $t('noMatchData')}}</Option>
                              <Option v-for="(option, k) in stationList" :value="option.stationId" :key="option.stationId" :title="option.stationName">{{option.stationName}}</Option>
                              </Select>
                          </div>
                          <Form
                            :label-width="150"
                            @submit.native.prevent
                            class="device_form"
                            style="margin-top: 16px;"
                          >
                            <FormItem :label="$t('deviceType')"
                                      class="mb-16">
                                <Select
                                    v-model="deviceType"
                                    class="kh-search-input device_form_select tl"
                                    :placeholder="$t('selectDeviceType')"
                                    @on-change="changeDeviceType"
                                    >
                                  <Option value="all">{{ $t("all") }}</Option>
                                  <Option
                                    v-for="item in deviceTypeList"
                                    :value="item.dictionaryCode"
                                    :key="item.dataDictionaryId"
                                    :title="item.dictionaryName"
                                  >{{ item.dictionaryName }}</Option>
                                </Select>
                            </FormItem>
                            <FormItem :label="$t('deviceSn')"
                                      class="mb-10">
                              <Select  v-model="deviceId"
                                      :placeholder="$t('inputDeviceSn')"
                                      filterable
                                      transfer
                                      remote
                                      clearable
                                      :remote-method="findDeviceCode"
                                      :loading="loadingDevice"
                                      @on-clear="clearDeviceCode"
                                      @on-open-change="openDevice"
                                      @on-query-change="deviceIdQueryChange"
                                      class="kh-search-input device_form_select"
                                      ref='deviceSnRef'
                                      >
                                  <Option v-if="!optionsDeviceCode.length" value='' disabled>{{ $t('noMatchData')}}</Option>
                                  <Option v-for="(option, index) in optionsDeviceCode" :value="option.deviceId" :key="index" :title="option.sn">{{option.sn}}</Option></Select>
                            </FormItem>
                        </Form>
                        <div>
                            <span class="time2_span"><label class="requireItem" >*</label>{{ $t('timeIntervalSelection') }}</span>
                            <DatePicker type="daterange"
                              split-panels
                              placement="bottom-end"
                              :placeholder="$t('selectTimeSpan')"
                              :options="timeOptions2"
                              :editable="false"  
                              v-model="sectionTime2"
                              @on-change="timeOut2"
                              :start-date="startDate2"
                              class="device_form_select time2_select"
                              ref="queryTime2"
                              key="dataPicker2"
                            ></DatePicker>
                          </div>
                          <Button type="primary" @click="searchData" class="device_search">
                              {{ $t("search") }}
                          </Button>
                        </div>     
                      </div>
                      </td>
                      <td class="ivu-table-column-center buss_td">
                        <div class="ivu-table-cell station_cell" style="padding-left:0;padding-right:0"  :style="{ height:(tabType === 'stationTab'?((station_cell_h+20) / 14 + 'rem'):((station_cell_h+68) / 14 + 'rem') )}">
                          <ul class="buss_ul" v-show=" tabType === 'stationTab'">
                            <li class="buss_li" v-for="(item,index) in bussList" :key="index">
                              <Select v-model="bussList[index]"
                                      class="kh-search-input buss_btn"
                                      transfer
                                      :disabled="isChangeName"
                                      :placeholder="$t('selectBusiness')"
                                      >
                              <Option v-for="(item,index) in bussTypeList"  :value="item.statisticalType" :key="index" :title="item.statisticalName">{{item.statisticalName}}</Option>
                              </Select>
                              <button type="button" @click="deleteBuss(index)" :disabled="bussList.length === 1"  class="ivu-btn ivu-btn-default" style="margin-left: 8px;margin-bottom:5px">
                                <span>{{ $t('delete') }}</span>
                              </button>
                            </li>
                          </ul>
                          <ul class="buss_ul buss_dev" v-show=" tabType === 'deviceTab'"><!-- 设备列表  最多勾选10个设备-->
                             <li class="buss_li" v-for="(item,index) in deviceSnList" :key="index">
                                <Checkbox class="li_check" :value="deviceCheckList[getCurIndex(index)]" :ref="'device_' + getCurIndex(index)" @on-change="deviceCheckChange(index,$event)"></Checkbox>
                                <Button
                                  type="default"
                                  :class="{'active_sn':snIndex === getCurIndex(index),'buss_btn2':true}"
                                  :value="item.deviceId"
                                  :disabled="isSelectDevList[getCurIndex(index)]"
                                  @click="deviceSnClick(index)"
                                >{{ item.sn }}
                                </Button>
                                <Button class="copyPaste" @click="pointCopy(index)" :disabled="!(snIndex === getCurIndex(index))">
                                  {{ isCopy ? $t('apply'): $t('copy') }}
                                </Button>
                            </li>
                          </ul>
                          <div class="card-page" v-show=" tabType === 'deviceTab'">
                            <Page :total="totalDeviceNum"
                                  :page-size="devicePageSize"
                                  :page-size-opts="devicePageSizeOpts"
                                  transfer
                                  :current="devicePageNum"
                                  @on-change="deviceHandlePage"
                                  @on-page-size-change="deviceHandlePageSize"
                                  size="small"
                                  show-sizer
                                  show-elevator
                                  show-total>
                              <span>{{ this.$t('totalCount')}} {{totalDeviceNum}} {{this.$t('item')}}</span>
                            </Page>
                        </div>
                      </div>
                      </td>
                      <td class="ivu-table-column-center time_td">
                        <div class="ivu-table-cell">
                          <ul class="time_ul" v-show=" tabType === 'stationTab'">
                            <li>
                              <span>{{ $t('reportType') }}</span>
                              <Select v-model.number="reportType"
                                      class="kh-search-input ml-12 time_input"
                                      @on-change="changeReport"
                                      :disabled="isChangeName"
                                      >
                              <Option v-for="(item,index) in reportTypeList"  :value="item.reportType" :key="index" :title="item.reportTypeName">{{item.reportTypeName}}</Option>
                              </Select>
                            </li>
                            <li v-if="reportType === 3">
                              <span><label class="requireItem" >*</label>{{ $t('selectYear') }}</span>
                              <Date-picker type="year" :editable="false" :disabled="isChangeName" v-model="yearChoose" :placeholder="$t('selectYear')" class="ml-12 time_input"></Date-picker>
                            </li>
                            <li v-if="reportType === 2">
                              <span><label class="requireItem" >*</label>{{ $t('selectMonth') }}</span>
                              <Date-picker :editable="false" :disabled="isChangeName"  type="month" v-model="monthChoose" :placeholder="$t('selectMonth')" class="ml-12 time_input"></Date-picker>
                            </li>
                            <li v-if="reportType === 99">
                              <span><label class="requireItem" >*</label>{{ $t('occurTime') }}</span>
                              <DatePicker type="daterange"
                                  split-panels
                                  placement="bottom-end"
                                  :placeholder="$t('selectTimeSpan')"
                                  :options="timeOptions"
                                  @on-change="timeOut"
                                  v-model="sectionTime"
                                  :start-date="startDate"
                                  class="ml-12 time_input"
                                  :editable="false"
                                  ref="queryTime"
                                  :disabled="isChangeName"
                                  key="dataPicker">
                                </DatePicker>
                            </li>
                          </ul>
                          <div v-show=" tabType === 'deviceTab'" class="clearfix">
                              <div class="curve_content fl">
                                <ul class="point_ul" :style="{ height:((station_cell_h - 6) / 14 + 'rem')}"><!--设备数据模块-->
                                  <li class="point_li" v-for="(item,index) in poiList" :key="index">
                                   <Checkbox  class="li_check_dev" :value="poiCheckList[index]" :key="index" :ref="'check_'+curDeviceId +'_'+ index" @on-change="checkPointChange(index,$event)" :disabled="isDisablefkPoint(index)"></Checkbox>
                                      <Select 
                                          v-model="templeteArr[index]"
                                          :placeholder="$t('inputPointName')"
                                          transfer
                                          filterable
                                          remote
                                          clearable
                                          :remote-method="getPointList"
                                          class="point-name-input"
                                          @on-clear="pointClear(index)"
                                          @on-query-change="pointQueryChange"
                                          @on-open-change="openChange(index,$event)"
                                          :ref="'device_'+curDeviceId +'_'+index"
                                          @on-change="changePoint(index,$event)"
                                      >
                                      <Option v-for="ele in pointNameList"  :value="ele.templatePointId" :key="ele.templatePointId" :title="ele.remark">{{ele.remark}}</Option>
                                      </Select>
                                      
                                    <button type="button" @click="deletePoint(index)" :disabled="poiList.length === 1"  class="ivu-btn ivu-btn-default delete_point" style="margin-left: 8px;margin-bottom:5px">
                                      <span>{{ $t('delete') }}</span>
                                    </button>
                                  </li>
                                </ul>                
                              </div>
                              <div class="curve_tip">{{ $t('maxTwPoint') }}</div>
                              <div class="curve_button fr">
                                <Button type="info" @click="clickAddPoint" :disabled="isClick_dev" class="curve_addBtn">
                                  <img :src="addSrc">
                                </Button>
                              </div>
                              <div class="curve_checkbox fr">
                                  <CheckboxGroup  v-model="operation">
                                      <Checkbox  label="1">
                                          <span>{{ $t('max') }}</span>
                                      </Checkbox>
                                      <Checkbox  label="2">
                                          <span>{{ $t('min') }}</span>
                                      </Checkbox>
                                      <Checkbox  label="3">
                                          <span>{{ $t('average') }}</span>
                                      </Checkbox>
                                      <Checkbox  label="4">
                                          <span>{{ $t('summation') }}</span>
                                      </Checkbox>
                                      <Checkbox  label="5">
                                          <span>{{ $t('range') }}</span>
                                      </Checkbox>
                                  </CheckboxGroup>
                              </div>       
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr class="ivu-table-row" v-show=" tabType === 'stationTab'">
                      <td class="">
                        <div class="ivu-table-cell" style="text-align:right">
                          <div class="station_left_div">
                            <button type="button" @click="addStation" :disabled="isChangeName" class="ivu-btn ivu-btn-primary">
                              <span>{{ $t('increaseAdd') }}</span>
                            </button>
                          </div>
                        </div>
                      </td>
                    <td class="">
                      <div class="ivu-table-cell" style="text-align:right">
                        <div class="station_left_div">
                          <button type="button" @click="addBuss" :disabled="isChangeName" class="ivu-btn ivu-btn-primary">
                          <span>{{ $t('increaseAdd') }}</span>
                          </button>
                        </div>
                      </div>
                    </td>
                  <td class="ivu-table-column-center">
                    <div class="ivu-table-cell">
                    <span></span>
                    </div>
                  </td>
                </tr>
              </tbody>
              </table>
              </div>
        </div>
        <div class="kh-tab-btn-group">
          <Button type="primary" @click="clickExit" :disabled="isExport_dev || !isCopy"  v-show=" tabType === 'deviceTab'"  class="exitBtn">{{ $t("exitBatchApply") }}</Button>
          <Button type="primary" @click="clickSave" :disabled="isExport_sta"  v-show=" tabType === 'stationTab'"  class="mr-16">{{ $t("save") }}</Button>
          <Button type="primary" @click="clickDeviceSave" :disabled="isExport_dev" v-show=" tabType === 'deviceTab'"  class="mr-16">{{ $t("save") }}</Button><!-- 'formValidate' -->
          <Button type="default" @click="back">{{ $t("back") }}</Button>
        </div>
        </Content>
    </layout>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { formatDate } from "@/libs/util";
import { deepCopy} from "@/libs/tools";
import { veDownload, khTable, deleteModal,selectAgent} from "@/components";
export default {
  name: "autoReport",
  components: {
    veDownload,
    khTable,
    deleteModal,
    selectAgent
  },
  data() {
    return {
      isExport_sta:false,
      isExport_dev:false,
      total: 0,
      pageSizeOpts: [30, 50, 100],
      pageSize: 30,
      pageNum: 1,
      key: "",
      ids: [],
      startTime: "",
      endTime: "",
      reportName:'',//报表名称
      reportName_dev:'',//设备数据报表名称
      tabType: 'stationTab',//导航栏标签
      selectReportData:false,//是否启用电站数据报表
      selectReportData_dev:false,//是否启用设备数据报表
      businessRange:'',//业务下拉框
      reportType:3,//报表类型下拉框
      stationNameList:[],
      stationCheckList:[],//电站复选框数组
      deviceCheckList:[],//设备复选框数组
      devIds:[],//勾选的设备个数
      poiCheckList:[],//点位复选框数组
      stationIdGroup:[],//保存时选中的电站id
      bussTypeIdGroup:[],//保存时的业务选择id
      addSrc:require('@/assets/images/common_icon_add_16_n.png'),
      deleteSrc:require('@/assets/images/common_icon_delete_16_n.png'),
      reportTypeList:[],
      timeOptions: {
        disabledDate(date) {
          return date && date.valueOf() > Date.now();
        }
      },
      sectionTime: '',
      yearChoose:'',
      monthChoose:'',
      dataType:1,
      dataTypeList:[
        {
          index: 0,
          title: this.$t('shortStorageData'),
          key: 1,
        },
        {
          index: 1,
          title: this.$t('longStorageData'),
          key: 2,
        },
      ],
      companyId: "",
      companyId_dev: "",
      companyList: [],
      companyList_dev: [],
      isEditDevice:false,
      stationId: "",
      stationList: [],
      isPostParam: true,
      deviceType: 'all',
      deviceTypeList: [],
      deviceId: '',//设备序列号
      optionsDeviceCode:[],
      startTime2: "",
      endTime2: "",
      timeOptions2: {
        //不可选今天之前的日期
        disabledDate(date) {
          return date && date.valueOf() > Date.now();
        }
      },
      sectionTime2: '',
      loadTimeFirst2: true, //设备数据第一次加载时间控件
      operation:[],
      bussList:['1'],//需要增加的业务
      bussTypeList:[],//业务下拉框
      loadTimeFirst: true, //第一次加载时间控件
      deviceSnList:[],//分页设备列表
      allDeviceSnList:[],//所有设备列表
      totalDeviceNum:0,//设备总数
      devicePageNum: 1,
      devicePageSize: 10,
      devicePageSizeOpts: [10],
      station_cell_h:480,
      loadingDevice: false,
      pointNameList:[],//点位名称下拉框的值
      snIndex:'',//判断设备列表选中的设备样式
      curDeviceId:'',//当前选中设备的Id
      curDeviceProto:'',//当前选中设备模板Id
      allDevicePointArr:[],//每个设备添加的点位名称
      allDevicePointObj:{},//每个设备添加的点位名称存储对象
      poiList:[],//需要增加的点位
      disabledArr:[],//设置点位列表的disabledArr属性
      isSelectPoint:[],//没有选择点位前将复选框置为不可选状态，选完之后放开
      testDis:[],
      allValue:{},//暂时存储数据
      allArr:[],
      devicePointInfoTo:[],//传给后台的数据
      isClick_dev:true,//是否选中了设备，选中才让点击
      pointQueryArr:[],//存储点位
      pointNameListAll:[],//备份点位
      curPoilist:[],
      curTempleteArr:[],
      curChecklist:[],
      curTestist:[],
      isSelectDevList:[],//设备列表勾选下可以点击设备，没有勾选情况下置灰
      isNeedRequire:false,//是否需要重新请求点位
      stationId_dev: '',
      stationNumberList:[''],//需要增加的电站
      isConfirmList:[false],//是否选择好电站
      curStationNumList:[],
      curConfirmList:[],
      stationNameListAll:[],
      disabledArrSearch:[],//手动输入带remark
      templeteArr:[],//存储选中点位的模板id
      infoTeobj:{},//存储模板templatePointId和enableStatic属性
      isChangeName:true,//代理商情况下还没修改报表名称
      copyTempId:'',//被复制的设备协议模板Id
      copyDeviceVersion: '', // 被复制的设备类型只有同一种类型才可以应用
      copyDeviceType: '', // 被复制的设备类型只有同一种类型才可以应用
      copyData:[],//复制的点位信息
      isCopy:false,//点击一次复制后全部变为粘贴，点击退出批量应用即可退出复制
      cacheCompanyId: '',//缓存上次选择的companyId
    };
  },
  created() {
    this.getDeviceType();
    this.isChangeName = this.isCompany;
    if (window.screen.width == '1920'){
      this.station_cell_h = 520;
    } else if (window.screen.width == '1600'){
      this.station_cell_h = 356;
    } else if (window.screen.width == '1440'){
      this.station_cell_h = 356;
    } else {//1366
      this.station_cell_h = 400;
    }
  },
  mounted() {

  },
  watch: {
  },
  computed: {
    startDate() {
      let year = new Date().getFullYear();
      let month = new Date().getMonth();
      let day = new Date().getDate();
      return new Date(year, month - 1, day);
    },
    startDate2() {
      let year = new Date().getFullYear();
      let month = new Date().getMonth();
      let day = new Date().getDate();
      return new Date(year, month - 1, day);
    },
    ...mapGetters(["getCompanyId"]),
    isCompany() {
      return this.getCompanyId == "1"; // 厂家版
    }
  },
  methods: {
    ...mapActions(['getAgentList','getDeviceStationList','getDirectoryByType','getDeviceNameList',
      'listReportStaticName','listReportType','listReportManager','createReportTask','listTableNames',
      'listDeviceByCondition','createDeviceReportTask','listDeviceByConditionByPage']),
    ...mapGetters(['getSmallHeight', 'getScrollLen']),
    //判断是代理商还是厂商决定下面数据的请求
    isAgentOrCompany() {
      if (this.isCompany){//厂商 可以选择代理商，选择后才去请求数据
      } else {//代理商 修改报表名称时才去请求数据
        if (this.reportName){//修改电站报表名称
          this.getListReportType();
          this.getBussData();
          this.getStationData();
        }
      }
    },
    getStaDisabled(index) {
      if (this.isCompany){//厂商 可以选择代理商，选择后才去请求数据
        // return (this.companyId === '' || this.isConfirmList[index]);
        // return this.$refs["agentSelect"].agentTitle === '';
      } else {//代理商 修改报表名称时才去请求数据
        // return (false || this.isConfirmList[index]);
        return false;
      }
    },
    //初始化时间
    initTime() {
      var endDate = new Date(),
        startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
      this.endTime = formatDate(endDate,'y-m-d');
      this.startTime = formatDate(startDate,'y-m-d');
      this.endTime2 = formatDate(endDate,'y-m-d');
      this.startTime2 = formatDate(startDate,'y-m-d');
      this.sectionTime = [this.startTime, this.endTime];
      this.sectionTime2 = [this.startTime2, this.endTime2];
    },
    isDisablefkPoint(index) {
      let disabledArr_v = this.disabledArr[index];
      if (this.templeteArr[index] !== undefined && this.templeteArr[index] !== '' && this.templeteArr.length>0) {
        if (this.infoTeobj[this.templeteArr[index]] != undefined){
          disabledArr_v = this.infoTeobj[this.templeteArr[index]].enableStatic;
        } else {
          disabledArr_v = true;
        }
      } else {
        disabledArr_v = true;
      }
      return disabledArr_v;
    },
    //获取报表类型
    getListReportType() {
      this.listReportType().then((res) => {
        if (res.data){
          let reportTypeListCopy = [];
          this.reportTypeList= [];
          reportTypeListCopy = res.data;
          reportTypeListCopy.forEach((v,k) => {
            if (v.reportType !== 4){
              this.reportTypeList.push(v);
            }
          });
        }
      });
    },
    getStationData(query) {//获取电站选择列表
      var postData = {};
      if (this.tabType === 'stationTab'){
        postData = {
          companyName: this.$refs["agentSelect"] ? this.$refs["agentSelect"].agentTitle : "",
          stationName: query || ''
        };
      } else {
        postData = {
          companyName: this.$refs["agentSelectDev"] ? this.$refs["agentSelectDev"].agentTitle : "",
          stationName: query || ''
        };
      }

      this.listReportManager(postData).then((res) => {//listStationInReportManager
        if (res.data){
          if (this.tabType === 'stationTab'){
            this.stationNameList = res.data;
            if (!query){
              this.stationNameListAll = deepCopy(res.data);
            }
          } else {
            this.stationList = res.data;
          }
        }
      });
    },
    getBussData() {//获取业务选择列表
      this.listReportStaticName().then((res) => {
        if (res.data){
          this.bussTypeList = res.data;
        }
      });
    },
    changeType(){},
    clickSave(){//点击电站数据保存
      this.isExport_sta = true;
      if (!this.reportName){
        this.$Message.error(this.$t('enterReportName'));
        this.isExport_sta = false;
        return;
      }
      if (this.isCompany && !this.companyId) {
        this.$Message.error(this.$t('agentNotEmpty'));
        this.isExport_sta = false;
        return;
      }
      if (this.stationNumberList.toString() === ''){
        this.isExport_sta = false;
        this.$Message.error(this.$t('plantNotEmpty'));
        return;
      }
      if (this.reportType === 3 && this.yearChoose === ''){
        this.$Message.error(this.$t('pleaseSelectYear'));
        this.isExport_sta = false;
        return;
      }
      if (this.reportType === 2 && this.monthChoose === ''){
        this.$Message.error(this.$t('pleaseSelectMonth'));
        this.isExport_sta = false;
        return;
      }
      this.stationIdGroup = [];
      this.stationIdGroup = Array.from(new Set(this.stationNumberList));
      if (this.stationIdGroup.toString() === ''){
        this.$Message.error(this.$t('plantNotEmpty'));
        this.isExport_sta = false;
        return;
      }

      //获取添加的业务类型
      this.bussTypeIdGroup = Array.from(new Set(this.bussList));
      let dataChoose;
      if (this.reportType === 3){
        dataChoose = formatDate(this.yearChoose,'y');
      } else if (this.reportType === 2){
        dataChoose = formatDate(this.monthChoose,'y-m');
      } else {
        dataChoose = null;
      }

      if (this.bussTypeIdGroup.length == 0){
        this.$Message.error(this.$t('selectBusiness'));
        this.isExport_sta = false;
        return;
      }
      //用户切换时间
      if (!this.loadTimeFirst) {
        this.startTime = this.sectionTime[0];
        this.endTime = this.sectionTime[1];
      }
      this.createReportTask({
        stationId: this.stationIdGroup.toString() || '',
        date:(this.reportType === 99)?this.startTime:dataChoose,
        reportName: this.reportName || '',
        startDate: (this.reportType === 99)?this.startTime:'',
        endDate: (this.reportType === 99)?this.endTime:'',
        reportType:Number(this.reportType),
        type:this.bussTypeIdGroup.toString() || '',
      }).then((res) => {
        this.isExport_sta = true;
        this.$Message.success(
          res.message ? res.message : this.$t("saveSuc")
        );
        this.$router.push("/handReport");
      }).catch(err => {
        console.log(err);
        this.isExport_sta = false;
      });
    },
    //点击设备数据保存
    clickDeviceSave(){
      this.isExport_dev = true;
      if (!this.reportName_dev){
        this.$Message.error(this.$t('enterReportName'));
        this.isExport_dev = false;
        return;
      }
      //判断是否存在时间
      if (this.startTime2 === "" || this.endTime2 === "") {
        this.$Message.error(this.$t('timeSpanNotEmpty'));
        this.isExport_dev = false;
        return;
      }
      this.getCurrentPointData(this.curDeviceId);//防止最后一个设备的数据没有被保存，但同时有可能导致存储多次
      // console.log("保存数据",this.allDevicePointObj);
      if (this.devIds.length === 0){
        this.$Message.error(this.$t('atLeastOneDevice'));
        this.isExport_dev = false;
        return;
      }

      let startTime2To = new Date(this.startTime2).valueOf();
      let endTime2To = new Date(this.endTime2).valueOf();
      //用户切换时间
      if (!this.loadTimeFirst2) {
        let dateSt = new Date(this.sectionTime2[0] + ' 00:00:00');
        let dateEnd = new Date(this.sectionTime2[1] + ' 23:59:59');
        startTime2To = dateSt.valueOf();
        endTime2To = dateEnd.valueOf();
      }
      
      delete this.allDevicePointObj[""];//最开始点击的时候存储的""设备，需要去除
      let allDevicePointObjCopy = {};
      this.devicePointInfoTo = [];
      
      this.deviceCheckList.forEach((v,k)=>{
        if (v){//打勾的选项
          allDevicePointObjCopy[this.allDeviceSnList[k].deviceId] = this.allDevicePointObj[this.allDeviceSnList[k].deviceId];
        }
      });
      for (let key in allDevicePointObjCopy){
        let propertyArr = [];
        let tempList =  allDevicePointObjCopy[key][0].templeteList;
        let tempCheckPoi =  allDevicePointObjCopy[key][0].checkPoi;
        let tempPointName =  allDevicePointObjCopy[key][0].pointNameList;//确保点位列表与设备对应
        let newPropertyObject = [];

        tempList = Array.from(new Set(tempList));
        let tempIdProListValue = {};
        tempPointName.forEach((v,k) => {
          tempIdProListValue = {
            propertyCache: v.property,
            remarkCache: v.remark,
            enableStatic: v.enableStatic
          };
          newPropertyObject[v.templatePointId] = tempIdProListValue;
        });
        tempList.forEach((v,k)=>{
          if (v){//非空点位下发
            propertyArr.push({
              property: newPropertyObject[v].propertyCache,//this.pointNameList[v-1].property  pointNameList每个设备不一样，这样会导致每次取的是最后的那个
              selected: tempCheckPoi[k],
              enableStatic: newPropertyObject[v].enableStatic,
              remark: newPropertyObject[v].remarkCache
            });
          }
        });
        this.devicePointInfoTo.push(
          {
            device: propertyArr,
            deviceId: key
          }
        );
      }
      // console.log("gggg",this.devicePointInfoTo);
      let isNullPoint2 = false;
      this.devicePointInfoTo.forEach((v,k)=>{
        if (v.device.length === 0){
          isNullPoint2 = true;
        }
      });
      if (isNullPoint2){
        this.$Message.error(this.$t('deviceNeedPoint'));
        this.isExport_dev = false;
        return;
      }

      this.createDeviceReportTask({
        dataType: this.dataType,
        devicePointInfo: this.devicePointInfoTo,
        deviceStaticsInfo: this.operation.toString(),//最大最小值
        endDate: endTime2To,
        reportName: this.reportName_dev,
        startDate: startTime2To
      }).then((res) => {
        this.isExport_dev = true;
        this.$Message.success(
          res.message ? res.message : this.$t("saveSuc")
        );
        this.$router.push("/handReport");
      }).catch(err => {
        console.log(err);
        this.isExport_dev = false;
      });
    },
    back(){//返回
      this.$router.push("/handReport");
    },
    //获取查询所需的下拉数据
    getDeviceType() {
      this.getDirectoryByType({'dictionaryType' : 'DEVICE_TYPE'}).then((res) => {
        if (res.data){
          this.deviceTypeList = res.data;
        }
      });
    },
    //修改电站报表名称
    rep_sta_change() {},
    agentChange(data) {//切换代理商-设备数据
      if (this.cacheCompanyId != data.companyId && data.companyId) {//说明选择了下拉框,清掉上一次查询的信息
        this.cacheCompanyId = data.companyId;
        this.stationList = [];
        this.stationId_dev = "";
        this.resetDevStaQuery();
        this.deviceId = '';
        this.resetSnQuery();
      }
    },
    //清空代理商
    agentClear() {
      this.stationList = [];
      this.stationId_dev = "";
      this.resetDevStaQuery();
      this.deviceId = '';
      this.resetSnQuery();
    },
    // 选择电站-设备
    stationChange() {
      this.deviceId = '';
      this.resetSnQuery();//清空原本的SN查询内容
    },
    //切换设备类型-设备
    changeDeviceType() {
      this.deviceId = '';
      this.optionsDeviceCode = [];
      //清掉上一次查询的信息
      this.resetSnQuery();
      !this.stationId ? '' : this.stationId;
      this.findDeviceCode();
    },
    resetSnQuery() {//清除SN查询内容
      let querySN = this.$refs['deviceSnRef'].$data.query;//清空逆变器序列号
      if (querySN) {
        this.$refs['deviceSnRef'].$data.query = '';
      }
    },
    //自动输入查找设备名称
    findDeviceCode(query) {
      var postData = {
        companyName: this.$refs["agentSelectDev"] ? this.$refs["agentSelectDev"].agentTitle : "",
        stationName: this.$refs["stationRef"] && this.$refs["stationRef"].query,//stationRef  this.stationId_dev
        deviceType: this.deviceType === 'all' ? '' : this.deviceType,
        sn: query || '',
      };
      this.getDeviceNameList(postData).then((res) => {
        if (res){
          this.optionsDeviceCode = res.data;
        }
      });
    },
    //清空设备序列号后
    clearDeviceCode() {
      this.findDeviceCode();
    },
    deviceIdQueryChange(query) {//下拉框选择设备序列号
      !query && this.findDeviceCode(query);
    },
    //展开设备序列号下拉框时发请求
    openDevice(value){
      if (value){//展开
        let snQuery = this.$refs['deviceSnRef'].$data.query;
        this.findDeviceCode(snQuery);
      }
    },
    //获取所有设备列表
    getAllDeviceList(query) {
      let postData = {
        companyName: this.$refs["agentSelectDev"] ? this.$refs["agentSelectDev"].agentTitle : "",
        stationName: this.$refs['stationRef'].query,
        deviceType: this.deviceType === 'all' ? '' : this.deviceType,
        sn: this.$refs['deviceSnRef'].query,//query ? query : this.deviceId
      };
      this.listDeviceByCondition(postData).then((res) => {
        if (res){
          this.allDeviceSnList = res.data;
          this.deviceCheckList = [...Array(res.data.length).keys()].fill(false);//填充数组false
          this.isSelectDevList = [...Array(res.data.length).keys()].fill(true);
        }
      });
    },
    //获取分页设备数据列表
    getDeviceListByPage(query) {
      let postData = {
        companyName: this.$refs["agentSelectDev"] ? this.$refs["agentSelectDev"].agentTitle : "",
        stationName: this.$refs['stationRef'].query,
        deviceType: this.deviceType === 'all' ? '' : this.deviceType,
        sn: this.$refs['deviceSnRef'].query,//query ? query : this.deviceId
        pageNumber: this.devicePageNum,
        pageSize: this.devicePageSize,
      };
      this.listDeviceByConditionByPage(postData).then((res) => {
        if (res){
          this.deviceSnList = res.data.result;
          this.totalDeviceNum = res.data.total;
        }
      });
    },
    getCurrentPointData(cur_devId) {//存储跳转设备前的点位数据
      this.ids = [];//勾选中的点位列表
      this.poiCheckList.forEach((v,k)=>{
        if (v === true){
          this.ids.push(k);
        }
      });
      this.pointQueryArr = [];
      this.templeteArr.forEach((v,k)=>{
        if (v){
          this.pointQueryArr.push(this.infoTeobj[v].remark);
        } else {
          this.pointQueryArr.push('');
        }
      });
      let templeteArrCopy  = deepCopy(this.templeteArr);
      this.allArr = [];//后面是push，不清空会导致保存的时候有问题
      this.allValue = {//跳转前的数据
        templeteList: templeteArrCopy,//选中的点位的templateId
        list: deepCopy(this.poiList),//增加了多少个状态列表
        checkPoi: this.poiCheckList,//是否选中状态列表
        idsPoi: this.ids,//选中的index
        testDis: this.testDis,
        pointQueryArr: this.pointQueryArr,//保存选中的点位名称
        pointNameList: this.pointNameListAll//保存设备的点位下拉列表
      };
   
      this.allArr.push(this.allValue);
      //切换前将上一个设备的点位名称数据保存
      this.allDevicePointObj[cur_devId] = this.allArr;//deviceId为key,添加的点位列表为value
    },
    //还原点位
    returnPoint(currentKey) {
      this.poiList = currentKey[0].list;
      this.templeteArr = currentKey[0].templeteList;
      this.poiCheckList = [];
      this.templeteArr.forEach((v) => {
        this.poiCheckList.push(false);
      });
      currentKey[0].checkPoi.forEach((v,k) => {
        if (v === true){
          this.$set(this.poiCheckList,k,true);//恢复原来打勾的选项
        } else {
          this.$set(this.poiCheckList,k,false);
        }
      });
      this.ids = currentKey[0].idsPoi;
      this.testDis = currentKey[0].testDis;

      this.$nextTick(()=>{//还原query
        this.templeteArr.forEach((v,k)=>{
          let gv = 'device_' + this.curDeviceId + '_' + k;
          this.$refs[gv][0].$data.query = currentKey[0].pointQueryArr[k];
        });
      });
    },

    async deviceSnClick(index){//切换设备列表
      this.isClick_dev = false;
      if (this.snIndex === this.getCurIndex(index)){//说明点击的是自己
        return;
      } else {
        this.getCurrentPointData(this.curDeviceId);//存储跳转前的点位数据
        this.snIndex = this.getCurIndex(index);
        this.curDeviceId = this.allDeviceSnList[this.getCurIndex(index)].deviceId;
        this.curDeviceProto = this.allDeviceSnList[this.getCurIndex(index)].protocolTempletId;
        this.isNeedRequire = true;
        await this.getPointList();//获取点位名称下拉列表

        let currentKey = this.allDevicePointObj[this.curDeviceId];
        if (currentKey){//如果该设备已经添加了点位列表，则恢复所有数据
          this.returnPoint(currentKey);
        } else {
          this.poiList = [];//没有的话添加置为原始状态
          this.templeteArr = [];//没有的话添加置为原始状态
          this.poiList.push('');
          this.templeteArr.push('');
          this.poiCheckList = [false];//选中项为空
          this.isSelectPoint = [true];
          this.testDis = [false];
          this.ids = [];
          this.$nextTick(()=>{
            this.resetQuery(this.curDeviceId,0);
          });
        }
        this.allValue = {};
        this.allArr = [];
      }
    },
    //获取点位名称下拉列表 ppp
    async getPointList(query){
      let postData = {
        dataType: this.dataType,
        deviceId: this.curDeviceId,//this.curDeviceId
        protocolTempletId: this.curDeviceProto,
        remark:query ? query : ''
      };
      if (this.isNeedRequire){
        await this.listTableNames(postData).then((res) => {
          if (res){
            this.disabledArrSearch = [];
            this.pointNameList = res.data;
            this.pointNameList.forEach((v,k)=>{
              this.pointNameList[k].pointId = k + 1  + '';
              this.disabledArrSearch.push(v.enableStatic === 0 ? true : false);
            });
            if (!query){
              let infoObj = {};
              this.infoTeobj = {};
              this.disabledArr = [];
              this.pointNameListAll = deepCopy(res.data);
              this.pointNameListAll.forEach((v,k)=>{
                this.pointNameListAll[k].pointId = k + 1  + '';
                this.disabledArr.push(v.enableStatic === 0 ? true : false);

                //将所有信息对应存储一份
                infoObj = {
                  enableStatic: v.enableStatic === 0 ? true : false,
                  remark: v.remark
                };
                this.infoTeobj[v.templatePointId] = infoObj;
              });
            }
          }
        });
      } else {
        this.pointNameList =  this.pointNameListAll;
      }
    },
    pointClear(index) {//清空点位查询的内容重新获取数据
  
      this.testDis[index] = true;
      this.$set(this.testDis,index,true);
      this.$set(this.isSelectPoint,index,true);
      this.$set(this.poiCheckList,index,false);//去掉打勾的选项
      this.getPointList();
      
      this.ids = [];
      this.poiCheckList.forEach((v,k)=>{
        if (v){
          this.ids.push(k);
        }
      });
    },
    pointQueryChange(query) {//点位存在查询的内容，请求数据
      this.isNeedRequire = true;
    },
    resetQuery(devId,index) {
      let gv = 'device_' + devId + '_' + index;
      let query = this.$refs[gv][0].$data.query;
      if (query) {
        this.$refs[gv][0].$data.query = '';
      }
    },
    openChange(index,value){
      let gv = 'device_' + this.curDeviceId + '_' + index;
      let query = this.$refs[gv][0].$data.query;
      if (value && !query){
        this.getPointList();
      } else if (value && query){
        this.getPointList(query);
      } else {

      }
      if (!this.templeteArr[index]) {//防止删除后query保留
        this.resetQuery(this.curDeviceId,index);
        this.$nextTick(()=>{
          this.getPointList();
        });
      }
    },
    changePoint(index,value) {//修改点位名称
      this.isNeedRequire = true;
      this.testDis[index] = false;
      this.$set(this.isSelectPoint,index,false);
      this.$set(this.poiCheckList,index,false);//去掉打勾的选项
    },
    clickAddPoint(){//点击增加点位名称
      if (this.poiList.length >= 20){//限定最多增加几个
        this.$Message.error(this.$t('maxAddTenPoints'));
      } else {
        this.poiList.push('');
        this.templeteArr.push('');
        this.poiCheckList.push(false);
        this.isSelectPoint.push(true);
        this.testDis.push(false);
      }
    },
    async deletePoint(index){//删除点位列表
      this.isNeedRequire = false;
      this.poiList.splice(index,1);
      this.templeteArr.splice(index,1);
      this.poiCheckList.splice(index,1);
      this.testDis.splice(index,1);
      this.ids = [];//每次点击选框时清空选中项数组
      this.curPoilist = deepCopy(this.poiList);
      this.curTempleteArr = deepCopy(this.templeteArr);
      this.curChecklist = deepCopy(this.poiCheckList);
      this.curTestist = deepCopy(this.testDis);
      this.pointNameList = this.pointNameListAll;
      this.$nextTick(()=>{//重新赋值
        this.poiList = deepCopy(this.curPoilist);
        this.templeteArr = deepCopy(this.curTempleteArr);
        this.poiCheckList = deepCopy(this.curChecklist);
        this.testDis = deepCopy(this.curTestist);
      });
      this.poiCheckList.forEach((v,k)=>{
        if (v){
          this.ids.push(k);
        }
      });
    },
    addStation(){//电站数据-增加电站
      if (this.stationNumberList.length >= 50){//限定最多增加50个
        this.$Message.error(this.$t('maxFiftyStations'));
      } else {
        this.stationNumberList.push('');
        this.isConfirmList.push(false);
      }
    },
    async deleteStation(index){
      this.stationNumberList.splice(index,1);
      this.isConfirmList.splice(index,1);
      this.curStationNumList = deepCopy(this.stationNumberList);
      this.curConfirmList = deepCopy(this.isConfirmList);
      this.stationNameList = this.stationNameListAll;
      this.$nextTick(()=>{//重新赋值
        this.stationNumberList = deepCopy(this.curStationNumList);
        this.isConfirmList = deepCopy(this.curConfirmList);
      });
    },
    addBuss(){//增加业务
      if (this.bussList.length >= this.bussTypeList.length){//限定最多增加几个
        this.$Message.error(`${this.$t('businessRange')}${this.$t('atMostAllow')}${this.bussTypeList.length}${this.$t('item')}`);
      } else {
        this.bussList.push('1');
      }
    },
    deleteBuss(index){//删除业务
      this.bussList.splice(index,1);
    },
    getCurIndex(index){//获取当前的index
      let currentIndex = index + this.devicePageSize * (this.devicePageNum-1);
      return currentIndex;
    },
    computeDevIds() {//重新计算选中项
      this.devIds = [];//每次点击选框时清空选中项数组
      this.deviceCheckList.forEach((v,k)=>{
        if (v){
          this.devIds.push(k);
        }
      });
    },
    deviceCheckChange(index,value){//不是render,不会实时渲染，所以要保持数据一致性
      if (this.devIds.length >= 10){
        if (value){
          this.$Message.error(this.$t('maxTenDevices'));
          this.$set(this.deviceCheckList,this.getCurIndex(index),false);
          let dv = 'device_' + this.getCurIndex(index);
          this.$refs[dv][0].currentValue = false;
          this.devIds = [];//每次点击选框时清空选中项数组  必须要！
        } else {
          this.$set(this.isSelectDevList,this.getCurIndex(index),true);//置灰
          this.$set(this.deviceCheckList,this.getCurIndex(index),value);
        }
      } else {
        this.devIds = [];//每次点击选框时清空选中项数组  必须要！
        if (value){//选中状态时
          this.$set(this.isSelectDevList,this.getCurIndex(index),false);//取消置灰状态
          this.deviceSnClick(index);//点击设备
          this.snIndex = this.getCurIndex(index);//设备高亮
          this.$set(this.deviceCheckList,this.getCurIndex(index),value);
        } else {
          let dv = 'device_' + this.getCurIndex(index);//保持勾选状态
          this.$refs[dv][0].currentValue = true;
          this.$Modal.confirm({
            title: this.$t('noticeTip'),
            content: this.$t('pointCancelDetail'),
            onOk: () => {
              this.$set(this.deviceCheckList,this.getCurIndex(index),value);//确认要取消再去掉勾选状态
              this.computeDevIds();
              this.deleteDevPoint(index);
            }
          });
        }
      }
      this.computeDevIds();
    },
    deleteDevPoint(index){//取消勾选设备
      let delDevId = this.allDeviceSnList[this.getCurIndex(index)].deviceId;//取消勾选的设备ID
      if (this.curDeviceId !== delDevId){//当前选中设备与要取消勾选的设备不一致，需要保存数据   并且当前设备点位数据未保存&& !this.allDevicePointObj[this.curDeviceId]
        this.getCurrentPointData(this.curDeviceId);//存储点位数据
      }
      delete this.allDevicePointObj[delDevId];//清空点位
      this.snIndex = '';
      this.curDeviceId = '';
      this.curDeviceProto = '';
      this.poiList = [],//增加了多少个状态列表
      this.templeteArr = [],//增加了多少个状态列表
      this.poiCheckList = [],//是否选中状态列表
      this.ids = [],//选中的index
      this.$set(this.isSelectDevList,this.getCurIndex(index),true);//置灰
    },
    stationClick(index){//点击电站整栏选中
      if (this.stationCheckList[index]){//this.stationCheckList[index]为布尔型
        this.$set(this.stationCheckList,index,false);
      } else {
        this.$set(this.stationCheckList,index,true);
      }
    },
    checkboxChange(index,value){//不是render,不会实时渲染，所以要保持数据一致性  电站列表
      this.$set(this.stationCheckList,index,value);
    },
    checkPointChange(index,value){//不是render,不会实时渲染，所以要保持数据一致性  点位列表
      if (this.ids.length >= 5){
        if (value){
          this.$Message.error(this.$t('maxFiveChoose'));
          this.$set(this.poiCheckList,index,false);
          let cv = 'check_' + this.curDeviceId + '_' + index;
          this.$refs[cv][0].currentValue = false;
          this.ids = [];//每次点击选框时清空选中项数组  必须要！
        } else {//value为false表示是取消原来勾选的
          this.$set(this.poiCheckList,index,value);
        }
      } else {
        this.$set(this.poiCheckList,index,value);
      }
      this.ids = [];//每次点击选框时清空选中项数组
      this.poiCheckList.forEach((v,k)=>{
        if (v){
          this.ids.push(k);
        }
      });
    },
    changeCompany(data){//电站的切换代理商操作
      this.companyId = data.companyId;
      this.isChangeName = this.companyId ? false : true;
      this.stationNumberList = [''];
      this.isConfirmList = [false];
      this.$nextTick(()=>{
        this.getStationData();
      });
      this.initTime();
      this.getListReportType();
      this.getBussData();
    },
    changeReport() {//切换报表
    },
    //电站数据切换时间
    timeOut(value) {
      this.sectionTime = value;
      this.startTime = value[0];
      this.endTime = value[1];
      this.loadTimeFirst = false;
    },
    //设备数据切换时间
    timeOut2(value) {
      this.sectionTime2 = value;
      this.startTime2 = value[0];
      this.endTime2 = value[1];
      this.loadTimeFirst2 = false;
    },
    searchData() {//查询事件-设备
      //判断是否存在时间
      if (this.startTime2 === "" || this.endTime2 === "") {
        this.$Message.error(this.$t("timeSpanNotEmpty"));
        return;
      }
      if (!this.$refs["stationRef"].query) {
        this.$Message.error(this.$t("selectCorrectStation"));
        return;
      }
      this.deviceSnList = [];
      this.allDeviceSnList = [];
      this.snIndex = '';
      this.curDeviceId = '';
      this.curDeviceProto = '';
      this.poiList = [],//增加了多少个状态列表
      this.templeteArr = [],//增加了多少个状态列表
      this.poiCheckList = [],//是否选中状态列表
      this.ids = [],//选中的index
      this.allDevicePointObj = {},
      this.deviceCheckList = [];
      this.devIds = [];
      this.getDeviceListByPage();
      this.getAllDeviceList();//获取所有设备列表
    },
    deviceHandlePage(value) {//切换设备页码
      this.devicePageNum = value;
      this.getDeviceListByPage();
      
    },
    deviceHandlePageSize(value) {
      this.devicePageNum = 1;
      this.devicePageSize = value;
      this.getDeviceListByPage();
    },
    //自动输入查找电站名
    findStation(query) {
      this.getStationData(query);
    },
    //清空电站id后
    clearStation() {
      this.findStation();
    },
    stationOpen(value) {
      let query = this.$refs["stationRef"].query;
      if (value) {
        this.findStation(query);
      }
    },
    //清空电站id后-设备报表
    clearStation_dev() {
      this.findStation();
      this.resetDevStaQuery();
      this.stationId_dev = "";
    },
    //处理手动清空不能触发remote事件
    stationQueryChange(query) {
      !query && this.clearStation();
    },
    stationQueryChange_dev(query) {
      !query && this.clearStation_dev();
    },
    //切换电站
    changeStation(index) {
      if (this.stationNumberList[index]){//电站数据
        this.$set(this.isConfirmList,index,true);
      }
    },
    resetStationQuery(index) {
      let sv = 'stationRef'+ index;
      let query = this.$refs[sv][0].$data.query;
      if (query) {
        this.$refs[sv][0].$data.query = '';
      }
    },
    resetDevStaQuery() {
      let query = this.$refs["stationRef"].$data.query;
      if (query) {
        this.$refs["stationRef"].$data.query = "";
      }
    },
    openStaChange(index,value){
      if (!this.stationNumberList[index]) {
        this.resetStationQuery(index);
      }
      this.getStationData();
    },
    //复制设备配置
    async pointCopy(index) {
      if (this.isCopy) {//已复制，准备粘贴
        let copyDeviceVersion = this.allDeviceSnList[this.getCurIndex(index)].deviceVersion;
        let copyDeviceType = this.allDeviceSnList[this.getCurIndex(index)].deviceType;
        if (copyDeviceVersion === this.copyDeviceVersion && copyDeviceType === this.copyDeviceType) {//修改为两个设备的类型一致才可以应用
          await this.getPointList();//获取点位名称下拉列表
          this.returnPoint(this.copyData);
        } else {
          this.$Message.error(this.$t('deviceProtoNotMatch'));
        }
      } else {//准备复制
        this.isCopy = true;//点击后全部变成应用
        this.copyDeviceVersion = this.allDeviceSnList[this.getCurIndex(index)].deviceVersion;
        this.copyDeviceType = this.allDeviceSnList[this.getCurIndex(index)].deviceType;
        this.copyTempId = this.allDeviceSnList[this.getCurIndex(index)].protocolTempletId;//当前复制设备的协议模板ID
        this.curDeviceId = this.allDeviceSnList[this.getCurIndex(index)].deviceId;
        this.curDeviceProto = this.allDeviceSnList[this.getCurIndex(index)].protocolTempletId;
        //先存储点位
        this.getCurrentPointData(this.curDeviceId);//存储跳转前的点位数据
        this.copyData = deepCopy(this.allDevicePointObj[this.curDeviceId]);
      }
    },
    //退出批量应用
    clickExit(){
      this.isCopy = false;//点击后全部变成复制
      this.copyData = [];
    }
  }
};
</script>

<style scoped lang="scss">
@import '@/styles/report.scss';

@media screen and (min-width: 1441px) and (max-width: 1600px){
  //...
  /deep/.point_li .ivu-btn-default{
    min-width:p2r(60px);
  }
}
@media screen and (max-width: 1440px){
  /deep/.point_li .ivu-btn-default{
    min-width:p2r(50px);
  }
}

@media screen and (max-width: 1366px){}
</style>