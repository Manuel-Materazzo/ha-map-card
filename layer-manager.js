import {Utils} from "./utils.js";

export class LayerManager {
    addTileLayers(map, configLayers) {
        const namedLayers = this._generateNamedTileLayers(configLayers, map);
        const legend = this._generateLegend(namedLayers);

        namedLayers.forEach(layer =>{
          layer.layer.addTo(map)
        })

        // add the legend to the map
        L.control.layers({}, legend).addTo(map);
    }

    /**
     * Generates an array of TileLayer with names starting from a list of layers defined on the config
     */
    _generateNamedTileLayers(configLayers) {
        const namedLayers = [];
        configLayers.forEach((configLayer) => {
            // if the name is not defined, generate a UUID
            let name = configLayer.name;
            if (!name) {
                name = Utils.uuidv4();
            }

            // if the layer has multiple urls, it's an animation
            if (configLayer.urls) {
                namedLayers.push({
                    layer: this._startAnimation(configLayer.urls),
                    name: name,
                });
                return;
            }

            let url = configLayer.url;
            // if the url is a template, evaluate it
            if (configLayer.load_url_as_template) {
                url = eval("`" + url + "`");
            }

            // instantiate the tile layer and add a reference to the list
            const tileLayer = L.tileLayer(url, configLayer.options);
            namedLayers.push({
                layer: tileLayer,
                name: name,
            });
        });
        return namedLayers;
    }

    /**
     * Generates the map legend starting from a list of named layers
     */
    _generateLegend(namedLayers) {
        let legend = {};

        namedLayers.forEach((namedLayer) => {
            legend[namedLayer.name] = namedLayer.layer;
        });

        return legend;
    }

  /**
   * Generates a layer animation starting from a layer list
   * @param animationLayers
   * @return {*}
   * @private
   */
    _startAnimation(animationLayers) {
        // generate layers
        const namedLayers = this._generateNamedTileLayers(animationLayers);
        const layers = namedLayers.map(namedLayer => namedLayer.layer);
        const layerGroup = L.layerGroup(layers);

        // during the animation
        //TODO: stop while layerGroup not loaded
        //TODO: dinamic duration
        setInterval(() => {
            // hide all layers
            namedLayers.forEach((namedLayer) => {
                namedLayer.layer.setOpacity(0);
            });
            // make the first layer fisible and remove it from the array
            const visibleLayer = namedLayers.shift();
            visibleLayer.layer.setOpacity(0.7);
            // add the visible layer to the end of the array
            namedLayers.push(visibleLayer);
        }, 1000);

        return layerGroup;
    }
}
