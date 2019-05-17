import React from 'react';
import PropTypes from 'prop-types';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import { searchPlaces } from '../../../../utils/siteUtil';
import StyleUtils from '../../../../ezStyle/utils/styleUtils';
import GUID from '../../../../utils/GUID';


const BLUE = require('../../../../images/site-map-blue.png');
const BLUE_SELECT = require('../../../../images/site-map-blue-selected.png');
const GREEN = require('../../../../images/site-map-green.png');
const GREEN_SELECT = require('../../../../images/site-map-green-selected.png');
const RED = require('../../../../images/site-map-red.png');
const RED_SELECT = require('../../../../images/site-map-red-selected.png');
const YELLOW = require('../../../../images/site-map-yellow.png');
const YELLOW_SELECT = require('../../../../images/site-map-yellow-selected.png');
const GREY = require('../../../../images/site-map-grey.png');
const GREY_SELECT = require('../../../../images/site-map-grey-selected.png');

// eslint-disable-next-line no-undef
const NORMAL_SIZE = __DEV__ ? 0.3 : 0.1;
// eslint-disable-next-line no-undef
const HIGHLIGHTED_SIZE = __DEV__ ? 0.6 : 0.2;

export default class MapMarker extends React.Component {
  static propTypes = {
    onPress: PropTypes.func
  };

  static defaultProps = {
    onPress: undefined
  };

  constructor(props) {
    super(props);
    this.state = {
      featureCollection: MapboxGL.geoUtils.makeFeatureCollection()
    };
  }

  reRender = async (geometry) => {
    const feature = MapboxGL.geoUtils.makeFeature(geometry, { icon: 'GREY', iconSize: NORMAL_SIZE });
    feature.id = GUID();
    this.setState({
      featureCollection: MapboxGL.geoUtils.makeFeatureCollection([feature])
    });
    const places = await searchPlaces(geometry.coordinates, 1);
    return places[0];
  }

  renderMultipleMarkers = (markers) => {
    if (!Array.isArray(markers) || markers.length === 0) return;
    const features = markers.map((m) => {
      const feature = MapboxGL.geoUtils.makeFeature(m, {
        data: m.data,
        icon: m.selected ? `${m.icon || 'GREY'}_SELECT` : (m.icon || 'GREY'),
        iconSize: m.highlighted ? HIGHLIGHTED_SIZE : NORMAL_SIZE
      });
      feature.id = GUID();
      return feature;
    });
    this.setState({
      featureCollection: MapboxGL.geoUtils.makeFeatureCollection(features)
    });
    console.warn(this.mapShape);
  }

  emptyMarkers = () => {
    this.greyMarkers();
  }

  greyMarkers = () => {
    this.setState({
      featureCollection: {}
    });
  }

  render() {
    return (
      <MapboxGL.ShapeSource
        id='symbolLocationSource'
        ref={(ref) => { this.mapShape = ref; }}
        hitbox={{ width: StyleUtils.normalizedSize(0), height: StyleUtils.normalizedSize(0) }}
        onPress={this.props.onPress}
        images={{
          // eslint-disable-next-line max-len
          BLUE, BLUE_SELECT, GREEN, GREEN_SELECT, RED, RED_SELECT, YELLOW, YELLOW_SELECT, GREY, GREY_SELECT
        }}
        shape={this.state.featureCollection}
      >
        <MapboxGL.SymbolLayer
          id='symbolLocationSymbols'
          style={styles.icon}
        />
      </MapboxGL.ShapeSource>
    );
  }
}

const styles = MapboxGL.StyleSheet.create({
  icon: {
    iconImage: MapboxGL.StyleSheet.identity('icon'),
    iconAllowOverlap: true,
    iconSize: MapboxGL.StyleSheet.identity('iconSize'),
    iconOffset: [0, -70],
    iconKeepUpright: true
  },
});
