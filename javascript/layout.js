dojo.require("esri.map");
dojo.require("esri.layout");
dojo.require("esri.widgets");
dojo.require("esri.arcgis.utils");
dojo.require("esri.InfoTemplate");
dojo.require("esri.layers.FeatureLayer");

dojo.require("dojo.dom-construct");
dojo.require("dojo.query");
dojo.require("dojo.on");

dojo.require("dijit.layout.ContentPane");

dojo.require("dojox.charting.Chart");  //try either Chart or Chart2D - maybe don't need both?
//dojo.require("dojox.charting.Chart2D");
dojo.require("dojox.charting.axis2d.Default");
dojo.require("dojox.charting.plot2d.Columns");
dojo.require("dojox.charting.themes.PlotKit.blue");
dojo.require("dojox.charting.action2d.Tooltip");
dojo.require("dojox.charting.action2d.Highlight");


var map;
var configOptions;
var urlObject;
var embed;

function initMap(options) {
configOptions = options;



var dirNode = document.getElementsByTagName("html")[0];
if (configOptions.i18n.isRightToLeft) {
  dirNode.setAttribute("dir", "rtl");
  dojo.addClass(dirNode, "esriRtl");
  //Page Specific
  dojo.attr(dojo.byId("legendCon"), "dir", "rtl");
} else {
  dirNode.setAttribute("dir", "ltr");
  dojo.addClass(dirNode, "esriLtr");
  //Page Specific
  dojo.attr(dojo.byId("legendCon"), "dir", "ltr");
}

dojo.byId('loading').innerHTML = configOptions.i18n.viewer.loading.message;
dojo.byId('legTogText').innerHTML = configOptions.i18n.viewer.legToggle.down;

urlObject = esri.urlToObject(document.location.href);
urlObject.query = urlObject.query || {};

if(urlObject.query.embed){
  embed = urlObject.query.embed;
}

createMap();

}

function createMap() {

if (configOptions.legend === "false" || configOptions.legend === false) {
  $("#legendCon").hide();
}
if(embed === "true" || $("#mainWindow").width() < 768 && embed != "false"){
  $("#header").hide();
  $("#legendDiv").css("max-height",200);
  dijit.byId("mainWindow").layout();
}

var mapDeferred = esri.arcgis.utils.createMap(configOptions.webmap, "map", {
  mapOptions: {
      slider: true,
      sliderStyle: "small",
      maxZoom: getMaxZoom(),
      nav: false,
      wrapAround180: true
  },
  ignorePopups: false,
  bingMapsKey: configOptions.bingmapskey
});

mapDeferred.addCallback(function (response) {

  document.title = configOptions.title || response.itemInfo.item.title || "";
  dojo.byId("title").innerHTML = configOptions.title || response.itemInfo.item.title || "";
  dojo.byId("subtitle").innerHTML = configOptions.subtitle || response.itemInfo.item.snippet || "";

  map = response.map;

  var popupTemplate = new esri.InfoTemplate();
  popupTemplate.setTitle("${NAME}");
  popupTemplate.setContent(getWindowContent);

  var statesFeatureLayerServiceUrl = "http://services1.arcgis.com/VAI453sU9tG9rSmh/arcgis/rest/services/Congressional_Apportionment_features/FeatureServer/0";
  var statesFeatureLayer = new esri.layers.FeatureLayer(statesFeatureLayerServiceUrl, {
    mode: esri.layers.FeatureLayer.MODE_ONDEMAND, //MODE_SNAPSHOT
    infoTemplate: popupTemplate,
    outFields: ["*"],
    opacity: 0
  });

  map.addLayer(statesFeatureLayer);

  dojo.connect(map, "onUpdateEnd", hideLoader);

  if (configOptions.popupIncludeZoomOutLink != undefined && configOptions.popupIncludeZoomOutLink != null && configOptions.popupIncludeZoomOutLink == true) {
    var zoomOutLink = dojo.create("a", {
      "class": "action",
      "id": "zoomOutLink",
      "innerHTML": "Zoom out",
      "href": "#",
      "onclick": "return false;"
    }, dojo.query(".actionList", map.infoWindow.domNode)[0]);

    dojo.on(zoomOutLink, "click", zoomToHomeExtent);
  }

  if (configOptions.popupMaxHeight == undefined || configOptions.popupMaxHeight == null || configOptions.popupMaxHeight == 0) {
    configOptions.popupMaxHeight = 600;
  }

  if (configOptions.popupWidth != undefined && configOptions.popupWidth != null && configOptions.popupWidth > 0) {
    map.infoWindow.resize(configOptions.popupWidth, configOptions.popupMaxHeight);
  }


  var layers = response.itemInfo.itemData.operationalLayers;
  if (map.loaded) {
      initUI(response);
  } else {
      dojo.connect(map, "onLoad", function () {
          initUI(response);
      });
  }

});

mapDeferred.addErrback(function (error) {
  alert(configOptions.i18n.viewer.errors.createMap + dojo.toJson(error.message));
});

}

function createChartDiv() {
  var chartDiv = dojo.create("div", { id: "simplechart", style: { width: "380px", height: "250px" } }, dojo.body());
}

function getWindowContent(feature) {
  dojo.destroy("simplechart");
  createChartDiv();

  var containerDiv = dojo.create("div", { id: "popupContainer", style: { width: "100%", height: "100%" } });

  var topDiv = dojo.create("div", {
    id: "popupIntro",
    style: { height: "100%" },
    innerHTML: "<b>" + feature.attributes.NAME + "</b>" + " - " + feature.attributes.SeatsDesc + "<br/><div style='text-align:center; font-style:italic; margin: 5px 0;'>Number of Seats in the House of Representatives, 1920-2010</div>"
  }, containerDiv);

  var chart = new dojox.charting.Chart("simplechart");
  chart.setTheme(dojox.charting.themes.PlotKit.blue);
  chart.addPlot("default", { type: "Columns", hAxis: "year", vAxis: "seats", gap: 2, minBarSize: 8 }); //, maxBarSize: 10
  chart.addAxis("year", {
    title: "Year",
    titleGap: 2,
    titleOrientation: "away",
    minorTicks: true,
    minorLabels: true,
    minorTicStep: 1,
    labels: [
      { value: 1, text: "1920" },
      { value: 2, text: "1930" },
      { value: 3, text: "1940" },
      { value: 4, text: "1950" },
      { value: 5, text: "1960" },
      { value: 6, text: "1970" },
      { value: 7, text: "1980" },
      { value: 8, text: "1990" },
      { value: 9, text: "2000" },
      { value: 10, text: "2010" }
    ]
  });
  var seatsArray = [
    feature.attributes.rep1920,
    feature.attributes.rep1930,
    feature.attributes.rep1940,
    feature.attributes.rep1950,
    feature.attributes.rep1960,
    feature.attributes.rep1970,
    feature.attributes.rep1980,
    feature.attributes.rep1990,
    feature.attributes.rep2000,
    feature.attributes.rep2010
  ];
  var maxSeats = Math.max.apply(Math, seatsArray);
  var xMax = maxSeats;
  if (maxSeats < 5) {
    xMax = 5;
  }
  chart.addAxis("seats", {
    vertical: true,
    titleGap: 8,
    title: "Seats",
    minorTicks: true,
    minorLabels: true,
    minorTickStep: 1,
    min: 0,
    max: xMax
  });
  
  chart.addSeries("seatsByYear", seatsArray);
  
  var chartHighlight = new dojox.charting.action2d.Highlight(chart, "default");
  var chartTooltip = new dojox.charting.action2d.Tooltip(chart, "default");

  chart.render();

  dojo.place("simplechart", containerDiv);

  return containerDiv;
}



function zoomToHomeExtent() {
  map.setExtent(map._mapParams.extent);
}

function getMaxZoom() {
  if (configOptions.maximumZoom != undefined && configOptions.maximumZoom > 0) {
    return configOptions.maximumZoom;
  }
  else {
    return -1;
  }
}

function initUI(response) {
//add chrome theme for popup
dojo.addClass(map.infoWindow.domNode, "chrome");
//add the scalebar
var scalebar = new esri.dijit.Scalebar({
  map: map,
  scalebarUnit: configOptions.i18n.viewer.main.scaleBarUnits //metric or english
});

$(".esriSimpleSliderIncrementButton").addClass("zoomButtonIn");
$(".zoomButtonIn").each(function (i) {
  $(this).after("<div class='esriSimpleSliderIncrementButton initExtentButton'><img style='margin-top:5px' src='images/home.png'></div>");
  $(".initExtentButton").click(function () {
      map.setExtent(map._mapParams.extent);
  });
});


var layerInfo = esri.arcgis.utils.getLegendLayers(response);

if (layerInfo.length > 0) {
  var legendDijit = new esri.dijit.Legend({
      map: map,
      layerInfos: layerInfo
  }, "legendDiv");
  legendDijit.startup();
} else {
  $("#legendCon").hide();
}
}


function hideLoader() {
$("#loadingCon").hide();
}

//Jquery Layout
$(document).ready(function (e) {
$("#legendToggle").click(function () {
  if ($("#legendDiv").css('display') == 'none') {
      $("#legTogText").html(configOptions.i18n.viewer.legToggle.up);
  } else {
      $("#legTogText").html(configOptions.i18n.viewer.legToggle.down);
  }
  $("#legendDiv").stop(true, true).slideToggle();
});
});