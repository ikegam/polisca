var React = require('react');
var ReactDOM = require('react-dom');
var ReactBootstrap = require('react-bootstrap');
var ReactOverlays = require('react-overlays');
var ReactHighcharts = require('react-highcharts');
var HighchartsMore = require('highcharts-more');
HighchartsMore(ReactHighcharts.Highcharts);

var Papa = require('papaparse');
require('./data.js');

var members_array = Papa.parse(members);
var speech_index_array = Papa.parse(speech_index);

var speech_index_hash_minsyu = {};
var speech_index_hash_jimin = {};

speech_index_array.data.forEach(function(val){
  if (parseInt(val[1]) >= 182) {
    if (!speech_index_hash_jimin[val[0]]) {
      speech_index_hash_jimin[val[0]] = [];
    } else {
      speech_index_hash_jimin[val[0]].push([parseInt(val[3]), parseInt(val[2]), parseInt(val[4]), parseInt(val[6])]);
    }
  } else {
    if (!speech_index_hash_minsyu[val[0]]) {
      speech_index_hash_minsyu[val[0]] = [];
    } else {
      speech_index_hash_minsyu[val[0]].push([parseInt(val[3]), parseInt(val[2]), parseInt(val[4]), parseInt(val[6])]);
    }
  }
});

var calSpec = function(items) {
  var attendance = 0, speech = 0, contribute = 0, flame = 0;
  items.forEach(function(val) {
    attendance += val[0];
    speech += val[1];
    contribute += val[2];
    flame += val[3];
  });
  return ([speech/attendance, contribute/attendance, flame/speech]);
}

var ChartView = React.createClass({
  render: function() {
    var specs = calSpec(speech_index_hash_jimin[this.props.item.text].concat(speech_index_hash_minsyu[this.props.item.text]));
    var specs_jimin = calSpec(speech_index_hash_jimin[this.props.item.text]);
    var specs_minsyu = calSpec(speech_index_hash_minsyu[this.props.item.text]);
    //if (this.props.item.text == "岸宏一") {
    //  console.log(speech_index_hash_jimin[this.props.item.text]);
    //}
    var config = {
        chart: {
          polar: true,
          animation: false,
          type: 'line'
        },

        title: {
          text: this.props.item.text + 'の戦闘力',
          x: -80
        },

        xAxis: {
          categories: ['発言指数', '貢献指数', '白熱指数'],
          tickmarkPlacement: 'on',
          lineWidth: 0
        },

        yAxis: {
          gridLineInterpolation: 'polygon',
          lineWidth: 0,
          min: 0,
          max: 0.5
        },

        tooltip: {
          shared: true,
          pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y}</b><br/>'
        },

        legend: {
          align: 'center',
          verticalAlign: 'top',
          y: 70,
          layout: 'horizontal'
        },

        series: [
        {
          name: '民主党政権 (第182回まで)',
          data: specs_minsyu,
          animation: false,
          pointPlacement: 'on'
        }, {
          name: '自民党政権',
          data: specs_jimin,
          animation: false,
          pointPlacement: 'on'
        }
        ]
    };

    //

    return (
        <div>
        <ReactHighcharts config = {config}></ReactHighcharts>
        </div>
    );

//        return (
//            <div>
//            <span>{this.props.item.text}</span>
//            <h3>全期間</h3>
//            <ul>
//            <li>発言指数: {specs[0].toFixed(3)}</li>
//            <li>貢献指数: {specs[1].toFixed(3)}</li>
//            <li>白熱指数: {specs[2].toFixed(3)}</li>
//            </ul>
//            <h3>民主党政権 (第182回まで)</h3>
//            <ul>
//            <li>発言指数: {specs_minsyu[0].toFixed(3)}</li>
//            <li>貢献指数: {specs_minsyu[1].toFixed(3)}</li>
//            <li>白熱指数: {specs_minsyu[2].toFixed(3)}</li>
//            </ul>
//            <h3>自民党政権</h3>
//            <ul>
//            <li>発言指数: {specs_jimin[0].toFixed(3)}</li>
//            <li>貢献指数: {specs_jimin[1].toFixed(3)}</li>
//            <li>白熱指数: {specs_jimin[2].toFixed(3)}</li>
//            </ul>
//            </div>
//        );
  }
});

var DetailView = React.createClass({
  render: function() {
    var item = this.props.item;
    var kokalog = <a href={'http://kokalog.net/?session=&nameofhouse=&typeofmeeting=&nameofmeeting=&speaker=' + item.text + '&speech=&submit=1'}>kokalog</a>;
    var rapport = <a href={'http://www.rapportjapan.info/giins/search?search[name]=' + item.text}>RAPPORT JAPAN</a>;
    var wikipedia = <a href={'https://ja.wikipedia.org/wiki/' + item.text}>Wikipedia</a>;
    return (<div>
        <h3>外部の情報</h3>
        <ul>
        <li>国会発言ログ: {kokalog}</li>
        <li>政治資金情報: {rapport}</li>
        <li>総合情報: {wikipedia}</li>
        </ul></div>);
  }
});

var MemberDetail = React.createClass({
  onMouseEnter: function() {
    var item = this.props.item;
    ReactDOM.render(<div key={item.id}>
        <ChartView key={item.id} item={item} />
        <DetailView key-={item.id} item={item} />
      </div>, document.getElementById(item.id));
  },
  onMouseOut: function() {

  },
  render: function() {
    var item = this.props.item;
    return (<Row key={item.id} onMouseOver={this.onMouseEnter} >
        <Col onMouseOver={this.onMouseEnter} onMouseOut={this.onMouseOut} >{item.text}
          <ul>
          <li>{item.party}</li>
          <li>{item.state}</li>
          </ul></Col><Col><div id={item.id}></div>
        </Col></Row>);
  }
});

var VisualizeApp = React.createClass({
  getInitialState: function() {
    return {items: this.props.items};
  },
  onChange: function(e) {
    var item_members = [];
    var value = e.target.value;
    var re = new RegExp(value, "g");
    members_array.data.forEach(function(key, index) {
      if (value == "" ){
        item_members.push({text: key[0], party: key[2], state: key[3], id: index});
      } else {
        key.some(function(word){
          if (word.match(re)) {
            item_members.push({text: key[0], party: key[2], state: key[3], id: index});
            return true;
          }
        });
      }
    });
    this.setState({items: item_members});
  },
  render: function() {
    var createItem = function(item) {
      return (<MemberDetail key={item.id} item={item} />);
    };
    return (
        <Grid>
          <Row className="show-grid">
            <Col xs={12} md={4}>
              <Row>
                <span>検索 </span>
                <input onChange={this.onChange} />
              </Row>
            </Col>
          </Row>
          {this.state.items.map(createItem)}
        </Grid>
        );
  }
});

var Grid = ReactBootstrap.Grid;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var AutoAffix = ReactOverlays.AutoAffix;

var item_members = []
members_array.data.forEach(function(key, index) {
  item_members.push({text: key[0], party: key[2], state: key[3], id: index});
});

ReactDOM.render(
        <VisualizeApp items={item_members}/>
    , document.getElementById('container'));

//    <Col xs={8} md={8}>
//    <AutoAffix viewportOffsetTop={15}>
//      <div><div id='chart'></div><div id="external_link"></div></div>
//    </AutoAffix></Col>

//ReactDOM.render(<VisualizeApp />, document.getElementById('root'));

members_array.data

//console.log(members_array.data);
//console.log(speech_index_array.data);
