{
  "configurationSettings":[{
    "category":"<b>Application Settings</b>",
    "fields": [{
      "type": "string",
      "fieldName": "title",
      "tooltip": "Specify a title for the application",
      "placeHolder": "Title",
      "label": "Title:"
    },{
      "type": "string",
      "fieldName": "subtitle",
      "tooltip": "Specify a subtitle for the application",
      "placeHolder": "Subtitle",
      "label": "Subtitle:"
    },{
      "type": "boolean",
      "fieldName": "legend",
      "label": "Display legend",
      "tooltip": ""
    },{
      "type": "number",
      "fieldName": "maximumZoom",
      "tooltip": "Specify the highest zoom level allowed (0 - 19)",
      "label": "Maximum Zoom:",
      "constraints" :{min:0,max:20,places:0}
    },{
      "type": "number",
      "fieldName": "popupWidth",
      "tooltip": "Specify a custom popup width (in pixels) to override application default",
      "label": "Popup Width:",
      "constraints" :{min:0,max:1000,places:0}
    },{
      "type": "number",
      "fieldName": "popupMaxHeight",
      "tooltip": "Specify a maximum popup height (in pixels) to override application default",
      "label": "Maximum Popup Height:",
      "constraints" :{min:0,max:1000,places:0}
    },{
      "type": "boolean",
      "fieldName": "popupIncludeZoomOutLink",
      "label": "Include 'Zoom out' link button in popups",
      "tooltip": ""
    }]
  }],
    "values":{
      "maximumZoom": 20,
      "popupIncludeZoomOutLink": true
    }
}