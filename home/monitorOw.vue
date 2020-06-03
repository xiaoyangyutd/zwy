<template>
  <div class="monitor-ow">
    <div class="monitor-left">
      <div class="monitor-power monitor-item panel-shadow">
          <p class="title" style="position: absolute;z-index: 999">
            <span>{{$t('stationSurvey')}}</span>
          </p>
          <div class="left-top">
              <div class="gauge-bg" v-if="isStationPower">
                <img src="../../../assets/images/common_dashboard_part1.png">
              </div>
              <div class='gauge-title' v-if="isStationPower"><span class="text-limit" :title="this.stationPower">{{ this.stationPower}}</span> </div>
              <div class='gauge-unit'  v-if="isStationPower"><label>{{stationPowerUnit}}</label></div>
                  <ul  class="gauge-value" v-if="isStationPower">
                    <li class="value_0">0</li>
                    <li class="value_1">{{ this.gaugeValueList[1] }}</li>
                    <li class="value_2">{{ this.gaugeValueList[2] }}</li>
                    <li class="value_3">{{ this.gaugeValueList[3] }}</li>
                    <li class="value_4">{{ this.gaugeValueList[4] }}</li>
                    <li class="value_5">{{ this.gaugeValueList[5] }}</li>
                    <li class="value_6">{{ this.gaugeValueList[6] }}</li>
                  </ul>

              <div  v-if="isStationPower"  class="ve-gauge">
                  <vue-gauge :chartDatas="chartDataGuage"
                            :settings="chartSettings"
                            :maxValue="maxPower"
                            :pointerStyle="pointerStyle"
                            :colors="colors3"
                            :chartUnit="chartUnit"
                            :chartTitle="$t('curTotalGenPower')"
                            height=350px></vue-gauge>
              </div>
              <div v-else class="demo-carousel">
                <p>{{$t('loading')}}</p>
              </div>
              <div v-show="isStationNone" class="demo-carousel">
                <p>{{$t('noneData')}}</p>
              </div>
              <div class="link-top"></div>
              <div class="left-top-content">
                <div class="img-left-ab">
                      <img src="@/assets/images/homeL1_icon_volume_n.png" alt="" height="30px">
                </div>
                <div class="img-name-ab">
                    <span class="img-name-ab" :title="$t('totalCapacity')">{{$t('totalCapacity')}}</span>
                </div>
                <div class="img-value-ab">
                    <span class="center-text-num" :title="stationCapcity">{{stationCapcity}}</span>
                    <span class="img-unit-ab">{{stationCapcityUnit}}</span>
                </div>
              </div>
          </div>
      </div>
     
      
      <div class="monitor-item panel-shadow">
        <p class="title">
          <span>{{$t('equOverview')}}</span><!-- 设备概况 -->
          <span class="device-total">{{$t('deviceTotal')}}: {{ deviceTotal }}</span>
        </p>
        <div class="deviceOverview">
          <div class="chart-progress">      
            <p class="process-msg">
              <i class="process-icon process-icon-line"></i>
              <span class="process-name text-limit" :title="$t('online')">{{ $t('online') }}</span>
              <span class="process-percent">{{ onLinePer }}%</span>
              <span
                class="process-num process-num1 text-limit">{{ onLineNum }}</span>
              <i class="process-icon process-icon-grey"></i>
              <span class="process-name text-limit" :title="$t('offLine')">{{ $t('offLine') }}</span>
              <span class="process-percent">{{ offLinePer }}%</span>
              <span
                class="process-num-grey text-limit">{{ offLineNum }}</span>
            </p>
            <Progress
              :percent="onLinePerInt"
              hide-info
              :stroke-width="16"
              class="progress-line"
            />
            <p class="process-msg">
              <i class="process-icon process-icon-normal"></i>
              <span class="process-name text-limit" :title="$t('normal')">{{ $t('normal') }}</span>
              <span class="process-percent">{{ normalPer }}%</span>
              <span
                class="process-num process-num2 text-limit">{{ normalNum }}</span>
              <i class="process-icon process-icon-yellow"></i>
              <span class="process-name text-limit" :title="$t('abnormal')">{{ $t('abnormal') }}</span>
              <span class="process-percent">{{ abNormalPer }}%</span>
              <span
                class="process-num-abnor2 text-limit">{{ abNormalNum }}</span>
            </p>
            <Progress
              :percent="normalPerInt"
              hide-info
              :stroke-width="16"
              :class="{'progress-line2': normalPerInt == 0, 'progress-line3': normalPerInt > 0}"
            />
          </div>
        </div>
      </div>
      <div class="monitor-curve monitor-item panel-shadow">
          <p class="title">
            <span>{{$t('stationAnalysis')}}</span><!-- 电站分析 -->
          </p>
          <div class="swiper-wrap">
              <div v-if="isStationAlarmLev" class="left-ring">
                <div class="circle-station-ring"></div>
                <vue-ring :chartDatas="stationAlarmLev"
                          class="vue-ring"
                          :colors="colors"
                          :chartSettings="leftChartSettings"
                          :legends="leftLegendData"
                          :extendDatas="leftExtendData"
                          :isSpecialTwo="true"
                          :needRichStyle="needRichStyle">
                </vue-ring>
                <div class="center-text">
                  <p class="center-text-title">{{$t('totalStations')}}</p>
                  <hr class="hr-line" />
                  <p class="center-text-num station_count_class">{{stationAllCount}}</p>
                </div>
              </div>
              <div v-else class="demo-carousel">
                <p>{{$t('loading')}}</p>
              </div>
              <div v-show="isStationAlarmNone" class="demo-carousel">
                <p>{{$t('noneData')}}</p>
              </div>
          </div>

      </div>
    </div>
    <div class="monitor-center">
      <div class="center-item center-item panel-shadow">
          <div class="title-line">
            <span>{{$t('generationTrends')}}</span>
            <span  :class="{'tab-icon-right': true, btnblue: carouselRun,btnwhite:!carouselRun}" @click="tabClick(1)">{{$t('nearlyMonth')}}</span>
            <span  :class="{'tab-icon-left': true, btnblue: !carouselRun,btnwhite:carouselRun}" @click="tabClick(0)">{{$t('nearlyDay')}}</span>
          </div>
          <div >
            <Carousel
              v-model="carouselRun"
              arrow="never"
              ref="carouselOne"
              dots="none">
              <CarouselItem
                dots="none">
                  <div v-if="isCurrentDayElec"  ><!-- lastDayUnit -->
                    <vue-line 
                      :chartDatas="currentDayElec"
                      :xAxisSet="xAxisSetLine"
                      :unit="lastDayUnit"
                      :splitLineY="false"
                      :extend="extendDayData"
                      :title="{text: ''}"></vue-line>
                  </div>
                  <div v-else>
                    <p class="ml-10">{{$t('noneData')}}</p>
                  </div>
              </CarouselItem>
              <CarouselItem>
                <div v-if="isCurrentMonthElec" ><!-- lastYearUnit -->
                    <vue-histogram :chartDatas="currentMonthElec"
                    :title="{text: ''}"
                    :unit="lastYearUnit"
                    :splitLineY="false"
                    :barWidth=16
                    :extend="extendYearData"
                    ></vue-histogram>
                </div>
                <div v-else  >
                  <p class="ml-10">{{$t('noneData')}}</p>
                </div>
              </CarouselItem>
            </Carousel>
          </div>
      </div>

      <div class="kh-table-container table-item panel-shadow table-new-item">
          <div class="title-line">
            <span>{{$t('stationRank')}}<label class="rank-desp">({{$t('AvFullHours')}})</label></span>
            <span :class="{'tab-rank-right': true, btnblue: carouselRank,btnwhite:!carouselRank }" @click="rankClick(1)">{{$t('last10')}}</span>
            <span :class="{'tab-rank-left': true, btnblue: !carouselRank,btnwhite:carouselRank }" @click="rankClick(0)">{{$t('top10')}}</span>
          </div>
          <div>
            <div class="kh-table-container rankTable">
                <kh-table
                  class="org-table"
                  :columns="rankColumns"
                  :tableData="tableData"
                  :stripe="false"
                  :showPager="false"
                  :pageSizeOpts="pageSizeOpts"
                ></kh-table>
            </div>
            <div class="item-tip">
              <span>{{ $t("stationState") }}：</span>
              <Icon type="ios-checkmark-circle" size="20" color="#1fcc58" /><label
              >{{ $t("normal") }}</label
              >
              <Icon type="md-warning" size="20" color="#fd4f4b" /><label>{{
              $t("abnormal")
              }}</label>
              <Icon type="ios-help-circle" size="20" color="#7b808c" /><label>{{
              $t("noneDevice")
              }}</label>
            </div>
          </div>
      </div>
    </div>
    <div class="monitor-right">
       <div class="monitor-item panel-shadow right-item">
          <p class="title">
            <span>{{$t('GenElecStatistics')}}</span>
          </p>
          <div class="left-center">
              <Row>
                <Card class="card1"
                style="background-color:rgba(51,153,255,0.05);border:1px solid rgba(51,153,255,0.3)"
                :dis-hover="true">
                  <div style="border-color:1px solid #2fde69">
                      <img src="@/assets/images/homeL2_icon_electic_b.png" alt="" class="elec-img">
                      <span class="elec-name-ab" :title="$t('curDayDischarge')">{{$t('curDayDischarge')}}</span>
                      <span class="elec-value-ab dayElec-color" :title="dayElec">{{dayElec}}</span>
                      <span class="elec-unit-ab dayElec-color">{{dayElecUnit}}</span>
                  </div>
                </Card>
              </Row>
               <Row>
                <Card  class="card1"
                    style="background-color:rgba(244,185,32,0.05);border:1px solid rgba(244,185,32,0.3)"
                :dis-hover="true">
                  <div>
                      <img src="@/assets/images/homeL2_icon_electic_y.png" alt="" class="elec-img">
                      <span class="elec-name-ab" :title="$t('monthElec')">{{$t('monthElec')}}</span>
                      <span class="elec-value-ab monthElec-color" :title="monthElec">{{monthElec}}</span>
                      <span class="elec-unit-ab monthElec-color">{{monthElecUnit}}</span>
                  </div>
                </Card>
              </Row>
              <Row>
                <Card  class="card1"
                style="background-color:rgba(47,222,105,0.05);border:1px solid rgba(47,222,105,0.3)"
                :dis-hover="true">
                  <div>
                      <img src="@/assets/images/homeL2_icon_electic_g.png" alt="" class="elec-img">
                      <span class="elec-name-ab" :title="$t('countCharge')">{{$t('countCharge')}}</span>
                      <span class="elec-value-ab totalElec-color" :title="totalElec">{{totalElec}}</span>
                      <span class="elec-unit-ab totalElec-color">{{totalElecUnit}}</span>
                  </div>
                </Card>
              </Row>
          </div>
      </div>
      <div class="monitor-item panel-shadow">
          <p class="title">
            <span>{{$t('OperaStatis')}}</span>
          </p>
          <div class="right-top" v-show="showEuqal">
             <Row>
                <Col span="0">
                  <br>
                </Col>           
                <Col :span="cardSpanLen">
                    <Card
                    style="background-color:rgba(51,153,255,0.05);border: 1px solid rgba(51,153,255,0.3)"
                    :dis-hover="true"
                    v-if="isAgent">
                        <div style="text-align:center">
                          <img src="@/assets/images/homeR1_icon_agent.png" alt="">
                        </div>
                        <p class="text-blue-col" :title="companyCount">{{companyCount}} </p>
                        <p class="unit-blue-col" :title="$t('totalAgents')">{{$t('totalAgents')}}</p>
                    </Card>
                </Col>
                <Col :span="cardSpanLen" :offset="cardOffset">
                    <Card
                    style="background-color:rgba(244,185,32,0.05);border: 1px solid rgba(244,185,32,0.3)"
                    :dis-hover="true">
                        <div style="text-align:center">
                          <img src="@/assets/images/homeR1_icon_staff.png" alt="">
                        </div>
                        <p class="text-yellow-col" :title="employeeCount">{{employeeCount}} </p>
                        <p class="unit-yellow-col" :title="$t('totalEmployees')">{{$t('totalEmployees')}}</p>
                    </Card>
                </Col>
                <Col :span="cardSpanLen" :offset="cardOffset">
                    <Card
                    style="background-color:rgba(47,222,105,0.05);border: 1px solid rgba(47,222,105,0.3)"
                    :dis-hover="true" >
                        <div style="text-align:center">
                          <img src="@/assets/images/homeR1_icon_user.png" alt="">
                        </div>
                        <p class="text-green-col" :title="usedCustomer+ '/'+ customerTotal">{{usedCustomer}}/{{customerTotal}} </p>
                        <p class="unit-green-col" :title="$t('totalUsers')+ `\n`+$t('online') + '/' + $t('alarmCount')">{{$t('totalUsers')}}<br>({{$t('online')}}/{{$t('alarmCount')}})</p>
                    </Card>
                </Col>
                <Col span="0">
                  <br>
                </Col>
            </Row>
          </div>
      </div>
       <div class="monitor-item panel-shadow">
          <p class="title">
            <span>{{$t('reduceEmissions')}}</span>
          </p>
          <div class="right-center">
                <Col span="2">
                  <br>
                </Col>
                <Col span="10">
                      <div class="energy-container">
                        <img src="@/assets/images/homeR2_icon_co2.png" alt="">
                      </div>
                      <p class="text-blue-col text-limit" :title="carbonReduction">{{carbonReduction}} </p>
                      <p class="unit-black-col" :title="$t('reduceCarbon') + `  (${carbonReductionUnit})`">{{$t('reduceCarbon')}} &nbsp;({{carbonReductionUnit}})</p>
                </Col>
                <Col span="10" offset="0">
                      <div class="energy-container">
                        <img src="@/assets/images/homeR2_icon_tree.png" alt="">
                      </div>
                      <p class="text-yellow-col text-limit" :title="equalTree">{{equalTree}} </p>
                      <p class="unit-black-col" :title="$t('reduceTree')+ `  (${equalTreeUnit})`">{{$t('reduceTree')}} &nbsp;({{equalTreeUnit}})</p>
                </Col>
                <Col span="2">
                  <br>
                </Col>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { vueRing, vueLine,vueGauge,vueHistogram,khTable} from '@/components';
  import { mapActions} from 'vuex';
  import {deepCopy} from '@/libs/tools';
  import "echarts/lib/component/markLine";
  export default {
    name: 'monitorOw',
    components: {
      vueGauge,
      khTable,
      vueRing,
      vueLine,
      vueHistogram
    },
    data() {
      return {
        isStationPower: false,
        isStationNone: false,
        maxPower: 0,
        gaugeValueList:[],
        stationPower: 0,
        stationPowerUnit:'kW',
        stationCapcity: 0,
        stationCapcityUnit:'',
        companyCount: 0,
        employeeCount: 0,
        customerTotal: 0,
        usedCustomer: 0,
        devNormalCount: 0,
        devAbnormalCount: 0,
        devOnlineCount: 0,
        devOfflineCount: 0,
        currentSum: [],
        dayElec:0,
        dayElecUnit:"kWh",
        monthElec:0,
        monthElecUnit:"kWh",
        totalElec:0,
        totalElecUnit:"kWh",
        carbonReduction:0,
        carbonReductionUnit:"",
        equalTree:0,
        equalTreeUnit:"",
        pageSizeOpts: [10.30,50],
        carouselRun: 0, // 运行状况
        carouselRank: 0, //排名情况
        stationAllCount: 0,
        stationAlarmLev:{},
        isStationAlarmLev: false,
        isStationAlarmNone: false,
        stationHeight:'250px',
        lineColor: ['#fa800a'],
        colors: ['#2fde69', '#fecf0d','#3399ff'],
        colors1: ['#3399ff', '#dedee0'],//#dedee0
        colors2: ['#2fde69', '#dedee0'],
        lineColor: [],
        devAlarmLev: {},
        isDevAlarmLev: false,
        devOnlineLev: {},
        isDevOnlineLev: false,
        isDevOnlineNone:false,
        isDevAlarmNone:false,
        panelType: 0,
        isCurrentDayElec: false,
        isCurrentMonthElec: false,
        currentDayElec: {},
        currentMonthElec: {
        },
        rankColumns: [
          {
            title: this.$t('ranking'),
            key: 'sortNum',
            align: "left",
            width: 70,
            render: (h, params) => {
              var bgColor = '' ;
              if (params.row.sortNum == '1') {
                bgColor = '#c6e5fc';
              } else if (params.row.sortNum == '2') {
                bgColor = '#c6e5fc';
              } else if (params.row.sortNum == '3') {
                bgColor = '#c6e5fc';
              } else {
                bgColor = '';
              }
              return h('div',{
                props: {
                },
                style: {
                  borderRadius: '11px',
                  background: bgColor,
                  width:'22px',
                  height:'22px',

                },
              },[
                h('label', {
                  props: {
                  },
                  style: {
                    marginLeft: '7px',
                    verticalAlign: '-2px',
                    fontWeight:700,
                    fontSize: '12px',
                  },
                },params.row.sortNum),
              ]);
            }
          },
          {
            title: this.$t('stationName'),
            key: "stationName",
            ellipsis: true,
            tooltip: true,
            width: 170,
          },
          {
            title: this.$t('status'),
            key: 'stationStatus',
            width: 60,
            align: 'left',
            render: (h, params) => {
              var bgColor = '',
                className = '';
              if (params.row.stationStatus == 3) {//异常
                bgColor = '#fd4f4b';
                className = 'md-warning';
              } else if (params.row.stationStatus == 2) {//正常
                bgColor = '#1fcc58';
                className = 'ios-checkmark-circle';
              } else if (params.row.stationStatus == 1) {//无设备
                bgColor = '#7b808c';
                className = 'ios-help-circle';
              } else {}

              return h('div', [
                h('Icon', {
                  props: {
                    'type': className,
                    'size': 22,
                    color: bgColor
                  }
                }),
                h('label', {
                  props: {
                  },
                  style: {
                    marginLeft: '5px',
                    verticalAlign: '-2px',
                    fontWeight: 400,
                  },
                }),
              ]);
            }
          },
          {
            title: this.$t("stationRunningDay"),
            key: "countDay",
            align: "center",
            ellipsis: true,
            tooltip: true,
          },
          {
            title: this.$t('AvFullHours')+"(h)",
            key: "avgDailyFullHours",
            align: "center",
            ellipsis: true,
            tooltip: true,
          },
          {
            title:  this.$t('CumuFullHours')+"(h)",
            key: "totalFullHours",
            align: "center",
            ellipsis: true,
            tooltip: true,
          }
        ],

        tableHeight: 0,
        ids: [],
        tableData: [],
        tableDataTop: [],
        tableDataLast: [],
        pointerSrc: require('@/assets/images/gauge-pointer.png'),
        chartDataGuage: {},
        pointerStyle:{//指针
          width: 30,//30
          length: 68,
          backgroundColor: '#dcdee0',
          zIndex: 1000,
        },
        chartUnit:'kW',
        colors3:['#2fde69','#4cbbff'],
        chartSettings: {
        },
        hierarchyInfo: {
          stationId: this.$route.query.stationId,
          companyId: this.$route.query.companyId,
          areaCode: this.$route.query.areaCode,
        },
        leftLegendData:{
          left: window.screen.width > '1440' ? '60%' : (window.screen.width <= '1366' ? '65%' : '63%'),
          top: '27%',
          itemGap: 40,
          textStyle:{
            rich:{
              a:{
                fontSize: 14,
                color: '#7b808c',
                verticalAlign:'top',
                align:'left',
                padding:[0,5,7,5],
                lineHeight:20,
              },
              b:{
                fontSize: 20,
                color: '#7b808c',//#7b808c
                align:'center',
                padding:[0,5,3,5],
                lineHeight:25,
              },
              c:{
                fontSize: 14,
                align:'right',
                padding:[0,5,7,5],
                lineHeight:20,
                verticalAlign:'top',
                color: '#191e33',
              }
            }
          },
        },
        rightLegendData:{
          left: ' 30%',
          top: '65%',
          textStyle:{
            rich:{
              a:{
                fontSize: 14,
                color: '#7b808c',
                verticalAlign:'top',
                align:'left',
                padding:[0,5,7,5],
                lineHeight:20,
              },
              b:{
                fontSize:20,
                color: '#7b808c',
                align:'left',
                padding:[0,5,3,5],
                lineHeight:25,
              },
              c:{
                fontSize:14,
                align:'left',
                padding:[0,5,7,5],
                lineHeight:20,
                verticalAlign:'top',
                color: '#191e33',
              }
            }
          },
        },
        rightLegendData1:{
          left: ' 12%',
          top: '65%',
          textStyle:{
            rich:{
              a:{
                fontSize: 14,
                color: '#7b808c',
                verticalAlign:'top',
                align:'left',
                padding:[0,5,7,5],
                lineHeight:20,
              },
              b:{
                fontSize:20,
                color: '#7b808c',
                align:'left',
                padding:[0,5,3,5],
                lineHeight:25,
              },
              c:{
                fontSize:14,
                align:'left',
                padding:[0,5,7,5],
                lineHeight:20,
                verticalAlign:'top',
                color: '#191e33',
              }
            }
          },
        },

        leftChartSettings: {
          radius: [70, 78],
        },
        rightChartSettings: {
          radius: [0, 50],
        },

        leftExtendData: {
          series: {
            center: ['38%', '55%'],// 设置图像位置
          }
        },
        needRichStyle:{//需要自定义的富文本样式
          legendRichLeft:'76%',
          legendRichTop:'22%',
          liLineheight:41,
          liHeight:38,
          legendRichTopTwo:'31%',
          legendRichLeftTwo:window.screen.width >'1600' ? '64%' : '65%'
        },
        leftLegends: {
          left: '65%',
          top: '8%',
        },
        rightExtendData: {
          series: {
            center: ['58%', '40%'],// 设置图像位置
          }
        },
        rightExtendData1: {
          series: {
            center: ['40%', '40%'],// 设置图像位置
          }
        },
        needRichStyle2:{
          legendRichLeft:window.screen.width <= '1600'? '33%':'30%',//
          legendRichTop:'62%',
          liLineheight:39,
          liHeight:39,
        },
        specialColor:['#7b808c'],
        needRichStyle3:{
          legendRichLeft:window.screen.width <= '1600'? '72%':'71%',
          legendRichTop:'62%',
          liLineheight:39,
          liHeight:39,
        },
        isAgent: true,
        cardSpanLen: 7,
        cardOffset:1,//代理商和厂商下保证居中
        showEuqal: false,
        deviceTotal: 0,
        lang:'',//语言
        lastDayUnit:'kWh',
        lastYearUnit:'kWh',
        onLineNum: 0,
        offLineNum: 0,
        normalNum: 0,
        abNormalNum: 0,
        onLinePer: 0,
        offLinePer: 0,
        normalPer: 0,
        abNormalPer: 0,
        onLinePerInt: 0,
        offLinePerInt: 0,
        normalPerInt: 0,
        abNormalPerInt: 0,
        xAxisSetLine: {
          axisLine: {
            show:true,
            lineStyle:{
              color: ['#dcdee0'],
              width: 1,
              type: 'solid'
            }
          },
          axisLabel: {
            formatter:function(value) {
              return value;
            },
            textStyle: {
              color: '#424759'
            }
          }
        },
        extendDayData: {
          series: {
            markLine: {
              silent: true, // true 不响应鼠标事件
              symbol:'none',
              data: [],         
              lineStyle: {
                width: 0.2,
                show: true,
                color: '#000',
                type: "solid",
              },
              label: {
                normal: {
                  show: true,
                  padding: [-20, 0, 0, -70],
                  color:'#515a6e',
                  formatter: '',
                  fontSize:10
                },
              },
            }
          }
        },
        extendYearData: {
          xAxis:{
            axisLine: {
              show: true,
              lineStyle:{
                color: ['#dcdee0'],
                width: 1,
                type: 'solid'
              }
            },
            axisLabel: {
              show:true,
              formatter:function(value) {
                return value;
              },
              textStyle: {
                color: '#424759'
              }
            }
          },
          series: {
            markLine: {
              silent: true, // true 不响应鼠标事件
              symbol:'none',
              data: [],
              lineStyle: {
                width: 0.2,
                show: true,
                color: '#000',
                type: "solid",
              },
              label: {
                normal: {
                  show: true,
                  padding: [-20, 0, 0, -70],
                  color:'#515a6e',
                  formatter: '',
                  fontSize:10
                }
              }
            }
          }
        },
        isExit:false,
        isExitYear:false,
      };
    },
    computed: {},
    watch: {},
    created() {
      this.init();
    },
    mounted() {
      //解决全屏下百分比问题
      window.onresize = function temp() {
        if (window.innerHeight == '1080') {//全屏
          document.querySelector(".monitor-ow .table-item").style.height = '65.8%';
        } else if (window.innerHeight == '969') {//非全屏
          document.querySelector(".monitor-ow .table-item").style.height = '66.085';
        }
      }
    },
    methods: {
      ...mapActions([
        'getAreaList', // 区域节点
        'getAreaByComId', // 区域节点
        'getAgentList', // 代理商节点
        'getAgentByAreaCode', // 代理商节点
        'getStationNode', // 电站节点
        'getStaticAlarmLevel',
        'getCapcity',
        'getCurSum',
        'getYearChart',
        'getMonthChart',
        'getDayChart',
        'getTopAndLast',
        'getCompanyCount',
        'getUserCount',
        'getDevCount',
        'getStationStatus',
      ]),
      init() {
        this.getCap();
        this.setCurrentSum();
        this.getComCount();
        this.getUsersCount();
        this.getDevsCount();
        this.getStaStatus();
        this.getMonChart();
        this.getDChart();
        this.getTableData();
      },
      // 代理商总数
      getComCount(params) {
        this.getCompanyCount(params).then(res => {
          this.companyCount = res.data.company;
          this.isAgent = res.data.comnpanyType === 1 ? true : false;
          this.cardOffset = this.isAgent ? 1 : 3;
          this.showEuqal = true;
        });
      },
      //图形展示总发电功率/总装机容量
      getCap(params) {//电站概况
        this.isStationPower = false;
        //设置最大值
        this.getCapcity(params).then(res => {
          if (Object.keys(res.data).length > 0){
            this.stationPower = res.data.power || 0;
            this.stationPowerUnit = res.data.unit || 'kW';
            this.stationCapcity = res.data.capcity || 0;
            this.stationCapcityUnit = res.data.unit || 'kW';
            if (Number(res.data.maxCapcity) >= Number(res.data.power)) {
              this.maxPower = Number(res.data.maxCapcity || 0);
            } else {
              this.maxPower =  Number(res.data.power || 0);
            }
            this.getGaugeValue(Number(this.maxPower));
            this.chartDataGuage = {
              columns: ['type', 'value'],
              rows: [
                { type: this.$t('curTotalGenPower'), value: this.stationPower }
              ]
            };
            this.isStationPower = true;
          } else {
            this.isStationPower = true;
            this.isStationNone = true;
          }
        }).catch( err => {
          this.isStationPower = true;
          this.isStationNone = true;
        });
      },
      // 获取所有数值 当日/当月/当年/累积电量参数值获取
      setCurrentSum() {
        this.getCurSum(this.hierarchyInfo).then(res =>{
          let result = res.data;
          this.dayElec = (result.dayElec && result.dayElec.value) || 0;
          this.monthElec = (result.monthElec && result.monthElec.value) || 0;
          this.totalElec = (result.totalElec && result.totalElec.value) || 0;
          this.dayElecUnit = (result.dayElec && result.dayElec.unit) || 'kWh';
          this.monthElecUnit = (result.monthElec && result.monthElec.unit) || 'kWh';
          this.totalElecUnit = (result.totalElec && result.totalElec.unit) || 'kWh';
          this.carbonReduction = result.carbonReduction.value;
          this.equalTree = result.equalTree.value;
          this.carbonReductionUnit = result.carbonReduction.unit;
          this.equalTreeUnit = result.equalTree.unit;
        });
      },
      //环形图展示电站状态统计(正常/异常/离线)
      getStaStatus(params) {
        this.isStationAlarmLev = false;
        this.getStationStatus(params).then(res => {
          if (Object.keys(res.data).length > 0){
            this.stationAlarmLev = {
              columns:  ['电站状态', '电站数量'],
              rows : [
                { '电站状态': this.$t('normal'), '电站数量': res.data.normal },
                { '电站状态': this.$t('abnormal'), '电站数量':res.data.abnormal },
                { '电站状态': this.$t('noneDevice'), '电站数量': res.data.noneDevice },
              ]
            };
            // 计算总量
            this.stationAllCount = res.data.normal + res.data.abnormal + res.data.noneDevice ;
            this.isStationAlarmLev = true;
          } else {
            this.isStationAlarmLev = true;
            this.isStationAlarmNone = true;
          }
        }).catch( err => {
          this.isStationAlarmLev = true;
          this.isStationAlarmNone = true;
        });
      },
      //获取设备概况百分比带两位小数-在线离线
      getDevicePercent(value,total,isFloat) {
        let curVal = 0;
        if (total == 0 || value == 0){
          curVal = 0;
        } else {
          if (value == total){
            curVal = 100;
          } else {
            curVal = isFloat === 1 ? ((value/total)*100).toFixed(2) : (value/total)*100;
          }
        }
        return curVal;
      },
      //设备总数数量统计（饼状图）
      getDevsCount(params) {
        this.isDevAlarmLev = false;//加载中
        this.isDevOnlineLev = false;
        this.getDevCount(params).then(res => {
          if (Object.keys(res.data).length > 0){
            this.deviceTotal = res.data.total;
            this.onLineNum= res.data.online;
            this.offLineNum= res.data.offline;
            this.normalNum= res.data.normal;
            this.abNormalNum= res.data.abnormal;
            //计算数值
            this.onLinePer = this.getDevicePercent(this.onLineNum,this.deviceTotal,1);
            this.offLinePer = this.getDevicePercent(this.offLineNum,this.deviceTotal,1);
            this.normalPer = this.getDevicePercent(this.normalNum,this.onLineNum,1);
            this.abNormalPer = this.getDevicePercent(this.abNormalNum,this.onLineNum,1);
            this.onLinePerInt = this.getDevicePercent(this.onLineNum,this.deviceTotal,0);
            this.offLinePerInt = this.getDevicePercent(this.offLineNum,this.deviceTotal,0);
            this.normalPerInt = this.getDevicePercent(this.normalNum,this.onLineNum,0);
            this.abNormalPerInt = this.getDevicePercent(this.abNormalNum,this.onLineNum,0);
            //测试数据
            // this.normalPerInt  = 50;
            this.devOnlineLev = {
              columns:  ['设备状态', '设备数量'],
              rows : [
                { '设备状态': this.$t('normal'), '设备数量': res.data.normal },
                { '设备状态': this.$t('abnormal'), '设备数量': res.data.abnormal },
              ]
            };
            this.isDevOnlineLev = true;
            this.devAlarmLev = {
              columns:  ['设备状态', '设备数量'],
              rows : [
                { '设备状态': this.$t('online'), '设备数量': res.data.online },
                { '设备状态': this.$t('offLine'), '设备数量': res.data.offline },
              ]
            };
            this.isDevAlarmLev = true;
          } else {//暂无数据
            this.isDevOnlineNone = true;
            this.isDevAlarmNone = true;
            this.isDevAlarmLev = true;
            this.isDevOnlineLev = true;
          }
        }).catch( err => {
          this.isDevOnlineNone = true;
          this.isDevAlarmNone = true;
        });
      },

      tabClick(type) {
        this.panelType = type;
        this.carouselRun = type;
        this.className = "btn-blue";
      },
      rankClick(type) {
        this.tableData = [];
        type == 1 ? this.tableData = this.tableDataLast : this.tableData = this.tableDataTop;
        // //补全数据
        for (let i = this.tableData.length; i<10 ; i++) {
          this.tableData.push({
            sortNum: i+1
          });
        }
        this.carouselRank = type;
      },

      //展示当月发电量曲线(横坐标为31日)
      getMonChart(params) {
        this.isCurrentMonthElec = false;
        this.getMonthChart(params).then(res => {
          let result = res.data;
          this.currentMonthElec = {
            columns: [this.$t('time'), this.$t('charge')],
            rows: []
          };
          this.initChartLineData(this.currentMonthElec, result);
          this.isCurrentMonthElec = true;
          this.lastYearUnit =  result ? result.unit[0] : 'kWh';
          //获取数组最大值
          let ydata = [];
          if (result) {
            ydata = [...new Set(result.y_data)];//去重
          }
          let maxNum = 0;
          ydata.forEach((v)=>{
            if (v) {//数组元素不为空
              this.isExitYear = true;
              return;
            }
          });

          if (this.isExitYear) {
            maxNum = Math.max(...result.y_data);
            this.extendYearData.series.markLine.data = [
              {
                name: '水平线',
                yAxis: maxNum
              }
            ];
            this.extendYearData.series.markLine.label.normal.formatter = maxNum + ' ' + this.lastYearUnit;
          }
        });
      },
      //展示当日发电量柱状图(横坐标为12个月)
      getDChart(params) {
        this.isCurrentDayElec = false;
        this.getDayChart(params).then(res => {
          let result = res.data;
          this.currentDayElec = {
            columns: [this.$t('time'), this.$t('charge')],
            rows: []
          };
          this.initChartLineData(this.currentDayElec, result);
          this.isCurrentDayElec = true;
          let ydata = [];
          if (result) {
            this.lastDayUnit = result.unit[0];
            ydata = [...new Set(result.y_data)];//去重
          }
          //获取数组最大值
          let maxNum = 0;
          ydata.forEach((v)=>{
            if (v) {//数组元素不为空
              this.isExit = true;
              return;
            }
          });

          if (this.isExit) {
            maxNum = Math.max(...result.y_data);
            this.extendDayData.series.markLine.data = [
              {
                name: '水平线',
                yAxis: maxNum
              }
            ];
            this.extendDayData.series.markLine.label.normal.formatter = maxNum + ' ' + this.lastDayUnit;
          }
        });
      },

      getTableData() {
        this.getTopAndLast({
          desc: 0
        }).then(res => {
          this.tableData = res.data;
          this.tableDataTop = res.data;
          //补全数据
          for (let i = this.tableData.length; i<10 ; i++) {
            this.tableData.push({
              sortNum: i+1
            });
          }
        });
        this.getTopAndLast({
          desc: 1
        }).then(res => {
          this.tableDataLast = res.data;
        });
      },

      initChartLineData(container, backData) {
        let newItem = {};
        backData && backData.x_data.forEach((item, index) => {
          newItem[container.columns[0]] = item;
          newItem[container.columns[1]] = backData.y_data[index];
          container.rows.push(deepCopy(newItem));
        });
      },
      // 员工总数/用户总数(当前在线/总数)获取
      getUsersCount() {
        this.getUserCount({}).then(res => {//getCurrentStatistics
          this.employeeCount = res.data && res.data.employee;
          this.customerTotal = res.data && res.data.customerTotal;
          this.usedCustomer = res.data && res.data.usedCustomer;
        });
      },

      //计算仪表盘刻度值
      getGaugeValue(value){
        var v;
        for (let i = 0; i < 6; i++){//前5个，包含0
          v = (Number(value)/ 6).toFixed(0) * i;
          this.gaugeValueList.push(v);
        }
        this.gaugeValueList.push(value);//push最大值
      }

    }
  };
</script>

<style  lang='scss' scoped>
@import '@/styles/monitor.scss';

  .monitor-ow {
     display: flex;
     height: 100%;
    .monitor-item {
      position:relative;
      width: 100%;
      height: p2r(274px);
      border: 1px solid #fff;
      margin-bottom: p2r(14px);
      border-radius: p2r(5px);
      background: #fff;
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  /deep/ .ivu-table:after{
    background-color: #fff;
  }
  /deep/ .ivu-table-wrapper{
    border:0;
  }
  /deep/ .ivu-table-tbody tr td:nth-child(2){
    color:#0487ff;
    font-weight:bold;
    font-size: p2r(14px);
  }
  //...
@media screen and (min-width: 1440px) and (max-width: 1599px) {
  //...
}
@media screen and (min-width: 1921px){
    //...
}
@media screen and (min-width: 1600px) and (max-width: 1919px) {
  //...
}
@media screen and (min-width: 1366px) and (max-width: 1439px){
}
</style>