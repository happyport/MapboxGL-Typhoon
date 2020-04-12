class TyphoonCurrentLayer {
    constructor(map, typhoonCurrentPoint) {
        this.map = map;
        this.sourceId = 'typhoon-current-source';

        //图层方式
        // map.loadImage('./img/typhoon.png', (err, image) => {
        //     this.map.addImage('typhoon', image);
        // });

        //自定义图层
        //map.addImage('animating', this.animatingTyphoon(map), { pixelRatio: 2 });

        map.addSource(this.sourceId, {
            'type': 'geojson',
            'data': turf.featureCollection([Utils.generatePointFeature(typhoonCurrentPoint), ...Utils.generateWindCircle(typhoonCurrentPoint)])
        });
        // 风圈
        map.addLayer({
            'id': 'wind-current-layer',
            'type': 'fill',
            'source': this.sourceId,
            'paint': {
                // 'fill-color': 'rgba(74, 110, 140, 0.4)',
                // 'fill-outline-color': 'rgba(74, 110, 140, 1)'
                'fill-color': 'rgba(130,90,25, 0.4)',
                'fill-outline-color': 'rgba(130,90,25, 1)'
            },
            'filter': ['==', '$type', 'Polygon']
        });
        // 当前台风点
        //图层方式
        // map.addLayer({
        //     'id': 'typhoon-current-layer',
        //     'type': 'symbol',
        //     'source': this.sourceId,
        //     'layout': {
        //         // 'icon-image': 'typhoon'
        //         'icon-image': 'animating' //自定义图层
        //     },
        //     'filter': ['==', '$type', 'Point']
        // });

        //Marker方式添加动态台风点
        this.typhoonMarker = this.generateTyphoonMarker(typhoonCurrentPoint);
    }

    update(typhoonCurrentPoint) {
        this.map.getSource(this.sourceId).setData(turf.featureCollection([Utils.generatePointFeature(typhoonCurrentPoint), ...Utils.generateWindCircle(typhoonCurrentPoint)]));
        this.typhoonMarker && this.typhoonMarker.setLngLat([+typhoonCurrentPoint.lng, +typhoonCurrentPoint.lat])
    }

    generateTyphoonMarker(typhoonCurrentPoint) {
        //必须套2层，否则png动画会偏移
        let ele = document.createElement('div');
        let el = document.createElement('div')
        el.className = 'marker';
        ele.appendChild(el);
        return new mapboxgl.Marker(ele)
            .setLngLat([+typhoonCurrentPoint.lng, +typhoonCurrentPoint.lat])
            .addTo(this.map);

    }

    animatingTyphoon(map) {
        var size = 120;
        return {
            width: size,
            height: size,
            angle: 0.0,
            data: new Uint8Array(size * size * 4),

            // get rendering context for the map canvas when layer is added to the map
            onAdd: function() {
                var canvas = document.createElement('canvas');
                canvas.width = this.width;
                canvas.height = this.height;
                this.context = canvas.getContext('2d');
            },

            render: function() {
                this.angle += Math.PI;
                var context = this.context;
                //this.angle > Math.PI * 2 && (this.angle = 0.0);
                context.clearRect(0, 0, this.width, this.height);

                var img = new Image();
                img.src = "./img/typhoon.png";
                context.rotate(this.angle);
                context.translate(-this.width, -this.height);
                context.drawImage(img, 0, 0, this.width, this.height);

                this.data = context.getImageData(
                    0,
                    0,
                    this.width,
                    this.height
                ).data;
                map.triggerRepaint();
                return true;
            }
        };
    }
}