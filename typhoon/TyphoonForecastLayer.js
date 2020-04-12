class TyphoonForecastLayer {
    constructor(map, typhoonCurrentPoint) {
        this.map = map;
        this.sourceId = 'typhoon-forecast-source';

        map.addSource(this.sourceId, {
            'type': 'geojson',
            'data': turf.featureCollection(Utils.generateForecastFeatures(typhoonCurrentPoint))
        });
        // 台风预测路径线
        map.addLayer({
            'id': 'forecast-forecast-line-layer',
            'type': 'line',
            'source': this.sourceId,
            'paint': {
                'line-width': [
                    'interpolate', ['linear'],
                    ['zoom'],
                    5,
                    1,
                    10,
                    3
                ],
                'line-dasharray': [3, 3],
                'line-color': [
                    'match', ['get', 'tm'],
                    '中国', '#FF4050',
                    '中国香港', '#FF66FF',
                    '中国台湾', '#FFA040',
                    '日本', '#43FF4B',
                    '美国', '#40DDFF',
                    '#ff0000'
                ]
            },
            'filter': ['==', '$type', 'LineString']
        });
        let paintOpts = {
            'paint': {
                'circle-radius': [
                    'interpolate', [
                        'cubic-bezier',
                        0.85,
                        0.45,
                        0,
                        0.65
                    ],
                    ['zoom'],
                    5, ['*', ['to-number', ['get', 'power']], 0.4],
                    10, ['*', ['to-number', ['get', 'power']], 1]
                ],
                'circle-color': [
                    'match', ['get', 'strong'],
                    '热带低压', '#00FEDF',
                    '热带风暴', '#FEF300',
                    '强热带风暴', '#FE902C',
                    '台风', '#FE0404',
                    '强台风', '#FE3AA3',
                    '超强台风', '#AE00D9',
                    '#ff0000'
                ],
                'circle-opacity': 0.8,
                'circle-stroke-width': 3,
                'circle-stroke-color': 'rgba(110, 110, 110, .3)'
            },
            'filter': ['==', '$type', 'Point']
        };
        // 台风预测路径点
        map.addLayer({
            'id': 'track-forecast-point-layer',
            'type': 'circle',
            'source': this.sourceId,
            ...paintOpts
        });
    }

    update(typhoonCurrentPoint) {
        this.map.getSource(this.sourceId).setData(turf.featureCollection(Utils.generateForecastFeatures(typhoonCurrentPoint)));
    }
}