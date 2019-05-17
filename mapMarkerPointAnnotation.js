/* eslint-disable no-underscore-dangle */
import React from 'react';
import { TouchableOpacity, View, Platform } from 'react-native';
import PropTypes from 'prop-types';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import { searchPlaces } from '../../../../utils/siteUtil';
import MapMarkerIcon from './mapMarkerIcon';
import GUID from '../../../../utils/GUID';

export default class MapMarker extends React.Component {
  static propTypes = {
    onPress: PropTypes.func,
    selectable: PropTypes.bool
  };

  static defaultProps = {
    onPress: undefined,
    selectable: false
  };

  constructor(props) {
    super(props);
    this.state = {
      markers: []
    };
  }

  renderOneMarker = async (geometry) => {
    this.setState({
      markers: [geometry]
    });
    const places = await searchPlaces(geometry.coordinates, 1);
    return places[0];
  }

  renderMultipleMarkers = (markers) => {
    if (!Array.isArray(markers) || markers.length === 0) return;
    this.setState({ markers });
  }

  onAnnotationSelected = (idx, marker) => {
    if (this.props.selectable) {
      if (Array.isArray(this.icons) && this.icons[idx]) {
        if (this.props.onPress) {
          this.props.onPress(idx, marker);
          this.icons[idx].setIconSize(true);
        }
      }
    }
  }

  onAnnotationDeselected = (dIdx) => {
    if (Array.isArray(this.icons) && this.icons[dIdx]) {
      this.icons[dIdx].setIconSize();
    }
  }

  renderMarkerAnnotations = () => {
    if (this.state.markers.length === 0) {
      return null;
    }
    const items = [];
    const icons = [];
    const IconWrapper = this.props.selectable ? TouchableOpacity : View;
    for (let i = 0; i < this.state.markers.length; i++) {
      const marker = this.state.markers[i];
      const coordinate = marker.coordinates;
      const id = Platform.OS === 'ios' ? GUID() : marker.name;
      items.push(
        <MapboxGL.PointAnnotation
          key={id}
          id={id}
          title={marker.name}
          coordinate={coordinate}
          anchor={{ x: 0.5, y: 1.0 }}
        >
          <IconWrapper
            onPress={() => this.onAnnotationSelected(i, marker)}
          >
            <MapMarkerIcon
              ref={(ref) => { icons.push(ref); }}
              color={marker.color}
              selected={marker.selected}
            />
          </IconWrapper>
          <MapboxGL.Callout
            style={{ display: 'none' }}
            containerStyle={{ display: 'none' }}
            contentStyle={{ display: 'none' }}
            tipStyle={{ display: 'none' }}
            textStyle={{ display: 'none' }}
          />
        </MapboxGL.PointAnnotation>
      );
    }
    this.icons = icons;
    return items;
  }

  emptyMarkers = () => {
    this.setState({
      markers: []
    });
  }

  render() {
    return this.renderMarkerAnnotations();
  }
}

