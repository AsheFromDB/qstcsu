
import { point_extent, circle_search, center_display, draw_search, getextent_cancel_draw } from './service/getExtent.js'
import { draw_route, route_search } from './service/route.js'
import { add_point, add_polygon, measure_line, cancel_draw, add_point_withcoor, draw_polygon_color, measure_polygon, update_Car_by_featureid, add_car_route, show_around_point, add_all_points, point_select, show_over } from './service/addfeature.js'
import { savefeatures } from './service/savedata.js'
import { add_baselayers, add_one_layer_featurelist, new_set_layerswitcher, new_add_feature, change_icon, show_word, update_radar, gaode_patch, show_circle, unlogin_layer, add_points_layer, login_layer, add_layers_by_ids_fids, add_features_by_ids_fids, add_border, add_home_features, add_home_points ,add_features_scream,new_add_home_points} from './service/layer.js'
import { thematic_map_count } from './service/thematic_map.js'
import { set_map, set_map_operation_mode, set_levels, open_levels, show_layers, polygon_highlight, proj_to_pixel, zoom_listener, no_feature_locker } from './service/map.js'
import { get_info } from './service/getfeatureinfo.js'

import { local_search } from './service/search_test'
import { delete_draw, delete_feature, delete_layer_features } from './service/delete_draw.js'
import { change_visible, get_visible_list, exchange_visible } from './service/layervisible.js'

import { gaode_gcs } from './service/coordinate'
import { fromLonLat, toLonLat } from 'ol/proj';

export default class Tool {

    static set_map(target, zoom, switcher, scale, mousePosition, fullScreen) {
        return set_map(target, zoom, switcher, scale, mousePosition, fullScreen)
    }

    static add_baselayers(map) {
        add_baselayers(map)
    }

    static set_layers(map) {
        return new Promise((resolve) => {
            new_set_layerswitcher(map).then(data => {
                resolve(data)
            })
        })
    }

    static add_all_features(map) {
        return new Promise((resolve) => {
            new_add_feature(map).then(data => {
                resolve(data)
            })
        })
    }

    static add_one_layer_featurelist(map, layercode, featureid_list) {
        return new Promise((resolve) => {
            add_one_layer_featurelist(map, layercode, featureid_list).then(pos => {
                resolve(pos)

            })
        })
    }

    static circle_search(longitude, latitude, radius, map, layercode_list) {
        return new Promise((resolve) => {
            circle_search(longitude, latitude, radius, map, layercode_list).then(pos => {
                resolve(pos)

            })
        })
    }

    static draw_search(type, map, layercode_list) {
        return new Promise((resolve) => {
            draw_search(type, map, layercode_list).then(pos => {
                resolve(pos)
            })
        })
    }

    static set_extent_by_feature(layercode, featureid, radius, map) {
        point_extent(layercode, featureid, radius, map)
    }

    static center_display(longitude, latitude, radius, map) {
        center_display(longitude, latitude, radius, map)
    }

    static draw_route(layer, start_list, end, station_show) {
        return new Promise((resolve) => {
            draw_route(layer, start_list, end, station_show).then(pos => {
                resolve(pos)
            })
        })
    }

    static add_point(map, layercode, featureid, type, label) {
        return new Promise((resolve) => {
            add_point(map, layercode, featureid, type, label).then(pos => {
                resolve(pos)
            })
        })
    }

    static measure_line(map) {
        return new Promise((resolve) => {
            measure_line(map).then(pos => {
                resolve(pos)
            })
        })
    }

    static add_polygon(map, layercode, featureid) {
        return new Promise((resolve) => {
            add_polygon(map, layercode, featureid).then(pos => {
                resolve(pos)
            })
        })
    }

    static save_data_tofeature(layer, layercode) {
        savefeatures(layer, layercode)
    }

    static thematic_map(map) {
        thematic_map_count(map)
    }

    static local_search(layer, location, show) {
        return new Promise((resolve) => {
            local_search(layer, location, show).then(data => {
                resolve(data)
            })
        })
    }

    static get_feature_info(layercode, featureid) {
        return new Promise((resolve) => {
            get_info(layercode, featureid).then(data => {
                resolve(data)
            })
        })
    }

    static set_map_operation_mode(map, type, box_mode) {
        if (type === 1) {
            set_map_operation_mode(map, type, box_mode)
        }
        else
            return new Promise((resolve) => {
                set_map_operation_mode(map, type, box_mode).then(data => {
                    resolve(data)
                })
            })
    }

    static change_icon(layercode, image_src, scale, map) {

        change_icon(layercode, image_src, scale, map)
    }

    static set_levels(first_level, second_leve) {
        set_levels(first_level, second_leve)
    }

    static delete_draw(map, type) {
        delete_draw(map, type)
    }

    static change_visible(layercode, map, visible) {
        change_visible(layercode, map, visible)
    }

    static delete_feature(map) {
        delete_feature(map)
    }

    static delete_layer_features(map, layercode_list) {
        delete_layer_features(map, layercode_list)
    }

    static open_levels(open, map) {
        open_levels(open, map)
    }

    static gaode_gcs(coor) {
        return gaode_gcs(coor)
    }
    static exchange_visible(layercode, map) {
        exchange_visible(layercode, map)
    }


    static cancel_draw(map, type) {
        if (type === "get_extent")
            getextent_cancel_draw(map)
        else if (type === "add_feature")
            cancel_draw(map)
    }

    static show_layers(map) {
        return show_layers(map)
    }


    static add_point_withcoor(map, coor, type, label) {
        add_point_withcoor(map, coor, type, label)
    }

    static show_word(map) {
        show_word(map)
    }

    static geo_to_proj(coordinate) {
        return fromLonLat(coordinate)
    }

    static get_visible_list(map) {
        return get_visible_list(map)
    }

    static draw_polygon_color(map, layercode, featureid, label, color_bool) {
        draw_polygon_color(map, layercode, featureid, label, color_bool)
    }

    static polygon_highlight(map, mode_bool) {
        polygon_highlight(map, mode_bool)
    }

    static update_radar(map, url) {
        update_radar(map, url)
    }

    static gaode_patch(map) {
        gaode_patch(map)
    }

    static measure_polygon(map) {
        measure_polygon(map)
    }

    static show_circle(map) {
        show_circle(map)
    }

    static proj_to_pixel(map, proj_coodinate) {
        return proj_to_pixel(map, proj_coodinate)
    }

    static update_Car_by_featureid(map, featureid) {
        update_Car_by_featureid(map, featureid)
    }

    static add_car_route(map, featureid, startTime, endTime) {
        add_car_route(map, featureid, startTime, endTime)
    }
    static show_around_point(map, layer, featureid) {

        return new Promise((resolve) => {
            show_around_point(map, layer, featureid).then(data => {
                resolve(data)
            })
        })

    }
    static add_all_points(map) {
        add_all_points(map)
    }

    static point_select(map,root) {

        return new Promise((resolve) => {
            point_select(map,root).then(data => {
                resolve(data)
            })
        })
    }

    static zoom_listener(map) {
        zoom_listener(map)
    }


    static add_points_layer(map) {

        return new Promise((resolve) => {
            add_points_layer(map).then(data => {
                resolve(data)
            })
        })
    }


    static add_layers_by_ids_fids(map, ids, fids) {
        return new Promise((resolve) => {
            add_layers_by_ids_fids(map, ids, fids).then(data => {
                resolve(data)
            })
        })
    }

    static add_features_by_ids_fids(map, ids, fids) {
        return new Promise((resolve) => {
            add_features_by_ids_fids(map, ids, fids).then(data => {
                resolve(data)
            })
        })
    }
    static add_border(map) {
        add_border(map)
    }
    static no_feature_locker(map, bool) {
        no_feature_locker(map, bool)
    }

    static add_home_features(map, ids, fids) {
        return new Promise((resolve) => {
            add_home_features(map, ids, fids).then(data => {
                resolve(data)
            })
        })
    }

    static add_home_points(map, root) {
        return new Promise((resolve) => {
            add_home_points(map, root).then(data => {
                resolve(data)
            })
        })
    }

    static new_add_home_points(map, root) {
        return new Promise((resolve) => {
            new_add_home_points(map, root).then(data => {
                resolve(data)
            })
        })
    }

    static show_over(map) {
        show_over(map)
    }

    static add_features_scream(map, ids, fids) {
        return new Promise((resolve) => {
            add_features_scream(map, ids, fids).then(data => {
                resolve(data)
            })
        })
    }


}
