class Utils {
    /**
     * 台风点数据转换为 GeoJSON FeatureCollection
     * @param {Array} typhoonPoints
     */
    static generateRouteFeatures(typhoonPoints) {
        if (typhoonPoints.length == 1) return [];
        // 路径点
        let routePoints = [];
        let routeFeatures = [];
        for (let i = 0, len = typhoonPoints.length; i < len; i++) {
            let typhoonPoint = typhoonPoints[i];
            let point = [+typhoonPoint.lng, +typhoonPoint.lat]; // [typhoonPoint.lng - 0, typhoonPoint.lat - 0]
            routePoints.push(point);
            if (i < len - 1) {
                routeFeatures.push(this.generatePointFeature(typhoonPoint));
            }
        }

        //路径线
        routeFeatures.push(turf.lineString(routePoints.length == 1 ? [...routePoints, ...routePoints] : routePoints));

        return routeFeatures;
    };
    static generatePointFeature(typhoonPoint) {
        let point = [+typhoonPoint.lng, +typhoonPoint.lat]; // [typhoonPoint.lng - 0, typhoonPoint.lat - 0]
        //属性
        let props = {
            ...typhoonPoint
        };
        if (props.hasOwnProperty('forecast')) {
            delete props.forecast;
        }
        return turf.point(point, props);
    };
    static generateForecastFeatures(currentTyphoonPoint) {
        let features = [];
        //获取当前点的预测数据
        let forecastAgencys = currentTyphoonPoint.forecast;
        for (let i = 0, len = forecastAgencys.length; i < len; i++) {
            const forecastAgency = forecastAgencys[i];
            let {
                forecastpoints,
                tm
            } = forecastAgency;
            // 预测点
            let forecastPoints = [];
            for (const forecastpoint of forecastpoints) {
                let point = [+forecastpoint.lng, +forecastpoint.lat]; // [forecastpoint.lng - 0, forecastpoint.lat - 0]
                forecastPoints.push(point);
                if (i >= 1) {
                    // 第一个点及当前台风点，不需要
                    features.push(turf.point(point, {
                        ...forecastpoint,
                        tm
                    }));
                }
            }
            //预测线
            features.push(turf.lineString(forecastPoints, {
                tm
            }));
        }
        return features;
    };
    /**
     * 四个方向的半径转为风圈面
     * @param {Array} center 中心点
     * @param {String} radius 风圈半径 '320|380|300|380'
     */
    static radiusToPolygon(center, radius) {
        let radiusArr = radius.split('|');
        let rNE = radiusArr[0];
        let rSE = radiusArr[1];
        let rSW = radiusArr[2];
        let rNW = radiusArr[3];

        let lineArcOptions = {
            steps: 1024
        }
        let ne = turf.lineArc(center, rNE, 0, 90, lineArcOptions).geometry.coordinates;
        let se = turf.lineArc(center, rSE, 90, 180, lineArcOptions).geometry.coordinates;
        let sw = turf.lineArc(center, rSW, 180, 270, lineArcOptions).geometry.coordinates;
        let nw = turf.lineArc(center, rNW, 270, 360, lineArcOptions).geometry.coordinates;
        return turf.polygon([
            [...ne, ...se, ...sw, ...nw, ne[0]]
        ], {
            type: 'wind-circle'
        })
    };
    /**
     * 生成台风点的风圈风圈（面）
     * @param {Object} typhoonPoint
     */
    static generateWindCircle(typhoonPoint) {
        let center = [typhoonPoint.lng, typhoonPoint.lat];
        let windCircle7 = this.radiusToPolygon(center, typhoonPoint.radius7 || "380|380|280|350");
        let windCircle10 = this.radiusToPolygon(center, typhoonPoint.radius10 || "100|100|100|100");
        let windCircle12 = this.radiusToPolygon(center, typhoonPoint.radius12 || "40|40|40|40");
        return [windCircle7, windCircle10, windCircle12];
    }

}